# Tutoring Platform

Self-hosted tutoring platform with teacher dashboards, student booking, voice/video chat, screen sharing, and file sharing.

## Features

- **Teacher Dashboards** — Personal calendar, availability settings, booking management
- **Student Booking** — Browse teachers, see available slots, book sessions
- **Voice & Video** — WebRTC-powered group calls via LiveKit
- **Screen Sharing** — Teachers can share their screen during sessions
- **Text Chat** — Real-time messaging during sessions with history
- **File Sharing** — Upload and share files during or between sessions
- **Session Management** — Track past and upcoming sessions

## Architecture

| Service | Purpose | Port |
|---------|---------|------|
| Cal.com | Booking, dashboards, scheduling | 3000 |
| LiveKit | WebRTC SFU (voice/video/screen) | 7880 |
| coturn | TURN/STUN (NAT traversal) | 3478 |
| PostgreSQL | Database | 5432 |
| Redis | Caching, sessions | 6379 |
| MinIO | File storage (S3-compatible) | 9000 |
| Custom API | Chat, files, session mgmt | 4000 |
| Nginx | Reverse proxy, SSL | 80/443 |

## Quick Start

### Prerequisites

- A server with Ubuntu 22.04 (Oracle Cloud free tier works great)
- A domain name pointed to your server's IP
- At least 2GB RAM, 2 CPU cores

### Installation

```bash
# Clone or copy this project to your server
git clone <your-repo> tutoring-platform
cd tutoring-platform

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Install Docker and Docker Compose
2. Configure the firewall
3. Set up SSL certificates (Let's Encrypt)
4. Generate secure secrets
5. Start all services

### Manual Setup

```bash
# Copy and edit environment variables
cp .env.example .env
nano .env  # Set your domain, secrets, SMTP settings

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Initialize SSL (after DNS is set up)
docker-compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email your@email.com --agree-tos \
  -d yourdomain.com
```

## Configuration

### Cal.com (Booking + Dashboards)

After setup, go to `https://yourdomain.com` and:
1. Create an admin account
2. Go to Settings → Availability to set your schedule
3. Create Event Types for different session types (e.g., "30-min tutoring", "60-min session")
4. Share your booking page with students

### LiveKit (Voice/Video)

LiveKit is pre-configured. When a session starts:
1. The frontend requests a LiveKit token from the API
2. Both teacher and student join the LiveKit room
3. Voice, video, and screen sharing work automatically

### File Sharing

Files are stored in MinIO (S3-compatible). The API handles:
- Upload: `POST /api/files/upload`
- Download: `GET /api/files/:fileId`
- List by booking: `GET /api/files/booking/:bookingId`

### Chat

Real-time chat uses Socket.IO:
- Messages are persisted to PostgreSQL
- History loads when joining a room
- Typing indicators included

## Customization

### Adding Features

The custom API (`api/`) is a Node.js Express app. Add routes in `src/index.js`:

```javascript
app.post('/api/custom-endpoint', authenticate, async (req, res) => {
  // Your logic here
});
```

### Frontend

Cal.com's frontend is open source and customizable. Fork the Cal.com repo and point the docker-compose to your custom image.

### Branding

- Replace logos in Cal.com settings
- Customize colors in Cal.com admin panel
- Modify the nginx config for custom domain routing

## Scaling

For more users:
- Add CPU/RAM to your VM
- Run LiveKit on a separate server for better media performance
- Use managed PostgreSQL (e.g., Supabase) instead of containerized
- Add Redis Sentinel for high availability

## Troubleshooting

```bash
# Check service status
docker-compose ps

# View logs for a specific service
docker-compose logs -f livekit
docker-compose logs -f calcom
docker-compose logs -f api

# Restart a service
docker-compose restart livekit

# Check TURN server
docker-compose logs coturn

# Database access
docker-compose exec postgres psql -U calcom -d calcom
```

## Cost

All software is free and open source. Only cost is server hosting:
- Oracle Cloud Free Tier: **$0/month** (4 CPU, 24GB RAM)
- Hetzner CX11: **€3.50/month** (2 CPU, 4GB RAM)
- DigitalOcean Basic: **$6/month** (1 CPU, 2GB RAM)

## License

MIT — use it however you want.
