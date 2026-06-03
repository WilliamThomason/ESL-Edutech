require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { Pool } = require('pg');
const Minio = require('minio');
const LiveKit = require('livekit-server-sdk');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// ── Logger ────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// ── App Setup ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000
});

// ── Middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ── Database Connections ──────────────────────────────────
const pg = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(err => logger.error('Redis connection error:', err));

// ── MinIO Client ──────────────────────────────────────────
const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

// Ensure bucket exists
(async () => {
  const bucket = process.env.MINIO_BUCKET || 'tutoring';
  const exists = await minio.bucketExists(bucket);
  if (!exists) {
    await minio.makeBucket(bucket);
    logger.info(`Created MinIO bucket: ${bucket}`);
  }
})();

// ── LiveKit Client ────────────────────────────────────────
const livekit = new LiveKit.LiveKitClient(
  process.env.LIVEKIT_API_URL || 'http://livekit:7880',
  process.env.LIVEKIT_API_KEY || 'devkey',
  process.env.LIVEKIT_API_SECRET || 'secret'
);

// ── JWT Auth Middleware ────────────────────────────────────
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret-change-me');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Socket.IO Auth ────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret-change-me');
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── LiveKit Token Generation ──────────────────────────────
app.get('/api/livekit/token', authenticate, async (req, res) => {
  try {
    const { roomName } = req.query;
    if (!roomName) return res.status(400).json({ error: 'roomName required' });

    const token = new LiveKit.AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: req.user.id, name: req.user.name || req.user.email }
    );
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    res.json({ token: await token.toJwt() });
  } catch (err) {
    logger.error('LiveKit token error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// ── File Upload ───────────────────────────────────────────
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/files/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const { bookingId } = req.body;
    const fileId = uuidv4();
    const ext = req.file.originalname.split('.').pop();
    const key = `${bookingId || 'general'}/${fileId}.${ext}`;

    await minio.putObject(
      process.env.MINIO_BUCKET || 'tutoring',
      key,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype }
    );

    // Save file record to database
    await pg.query(
      'INSERT INTO files (id, booking_id, uploader_id, filename, mime_type, size, storage_key) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [fileId, bookingId, req.user.id, req.file.originalname, req.file.mimetype, req.file.size, key]
    );

    res.json({ fileId, filename: req.file.originalname, size: req.file.size });
  } catch (err) {
    logger.error('File upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ── File Download ─────────────────────────────────────────
app.get('/api/files/:fileId', authenticate, async (req, res) => {
  try {
    const result = await pg.query(
      'SELECT * FROM files WHERE id = $1', [req.params.fileId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'File not found' });

    const stream = await minio.getObject(
      process.env.MINIO_BUCKET || 'tutoring',
      result.rows[0].storage_key
    );
    res.setHeader('Content-Type', result.rows[0].mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${result.rows[0].filename}"`);
    stream.pipe(res);
  } catch (err) {
    logger.error('File download error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

app.get('/api/files/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const result = await pg.query(
      'SELECT id, filename, mime_type, size, uploaded_at FROM files WHERE booking_id = $1 ORDER BY uploaded_at DESC',
      [req.params.bookingId]
    );
    res.json(result.rows);
  } catch (err) {
    logger.error('File list error:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// ── Chat History ──────────────────────────────────────────
app.get('/api/chat/:bookingId', authenticate, async (req, res) => {
  try {
    const result = await pg.query(
      'SELECT * FROM chat_messages WHERE booking_id = $1 ORDER BY created_at ASC LIMIT 100',
      [req.params.bookingId]
    );
    res.json(result.rows);
  } catch (err) {
    logger.error('Chat history error:', err);
    res.status(500).json({ error: 'Failed to load chat' });
  }
});

// ── Socket.IO Real-Time Events ────────────────────────────
const connectedUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id;
  connectedUsers.set(userId, { socketId: socket.id, user: socket.user });
  logger.info(`User connected: ${userId}`);

  // Join a room for a specific booking
  socket.on('join-room', (bookingId) => {
    socket.join(`booking:${bookingId}`);
    socket.to(`booking:${bookingId}`).emit('user-joined', { userId, name: socket.user.name });
  });

  socket.on('leave-room', (bookingId) => {
    socket.leave(`booking:${bookingId}`);
    socket.to(`booking:${bookingId}`).emit('user-left', { userId });
  });

  // Text chat
  socket.on('chat-message', async ({ bookingId, message }) => {
    try {
      const msgId = uuidv4();
      await pg.query(
        'INSERT INTO chat_messages (id, booking_id, sender_id, message) VALUES ($1,$2,$3,$4)',
        [msgId, bookingId, userId, message]
      );
      io.to(`booking:${bookingId}`).emit('chat-message', {
        id: msgId, bookingId, senderId: userId,
        senderName: socket.user.name, message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      logger.error('Chat message error:', err);
    }
  });

  // Typing indicator
  socket.on('typing', ({ bookingId, isTyping }) => {
    socket.to(`booking:${bookingId}`).emit('typing', { userId, name: socket.user.name, isTyping });
  });

  // Screen share signal
  socket.on('screen-share-start', ({ bookingId }) => {
    socket.to(`booking:${bookingId}`).emit('screen-share-started', { userId });
  });

  socket.on('screen-share-stop', ({ bookingId }) => {
    socket.to(`booking:${bookingId}`).emit('screen-share-stopped', { userId });
  });

  // File share notification
  socket.on('file-shared', ({ bookingId, fileId, filename }) => {
    io.to(`booking:${bookingId}`).emit('file-shared', {
      fileId, filename, senderId: userId, senderName: socket.user.name
    });
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    logger.info(`User disconnected: ${userId}`);
  });
});

// ── Database Init ─────────────────────────────────────────
async function initDb() {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS files (
      id UUID PRIMARY KEY,
      booking_id UUID,
      uploader_id VARCHAR(255) NOT NULL,
      filename VARCHAR(500) NOT NULL,
      mime_type VARCHAR(100),
      size BIGINT,
      storage_key VARCHAR(500) NOT NULL,
      uploaded_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY,
      booking_id UUID NOT NULL,
      sender_id VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_chat_booking ON chat_messages(booking_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_files_booking ON files(booking_id);
  `);
  logger.info('Database tables initialized');
}

// ── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 4000;

initDb().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`API server running on port ${PORT}`);
  });
}).catch(err => {
  logger.error('Failed to initialize database:', err);
  process.exit(1);
});
