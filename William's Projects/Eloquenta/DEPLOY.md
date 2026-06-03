# Eloquenta Video Classroom - Deployment Guide

## Quick Start (Local Testing)

1. Make sure Node.js is installed (v18+)
2. Run: `./start.sh`
3. Open in TWO browser tabs to test:
   - Teacher: https://localhost:8443/voip.html?room=test1&role=teacher
   - Student: https://localhost:8443/voip.html?room=test1&role=student
4. Accept the self-signed cert warning (click "Advanced" -> "Proceed")

## How It Works

- `server/signaling-server.js` -- Node.js WebSocket signaling server + static file server
- `voip.html` -- Single-file video classroom with real WebRTC
- Teacher initiates the call (creates offer), student receives and answers
- Uses public Google/Twilio STUN servers for NAT traversal
- Self-signed TLS certs auto-generated on first run

## Deploying to a VPS (for remote testing)

### Option A: Direct Node.js (simplest)

1. Copy the `site/` folder to your server
2. Run `./start.sh`
3. Open firewall ports 8080 (HTTP) and 8443 (HTTPS)
4. Replace self-signed certs with real ones (see below)

### Option B: With Nginx reverse proxy

1. Install Nginx
2. Get real TLS certs with Certbot:
   ```
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```
3. Nginx config:
   ```nginx
   server {
     listen 443 ssl;
     server_name yourdomain.com;
     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

     location / {
       proxy_pass http://localhost:8080;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
     }
   }
   ```
4. Run the signaling server: `node server/signaling-server.js`

### Option C: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server/ ./server/
RUN cd server && npm install
COPY *.html ./
COPY landing.html index.html
EXPOSE 8080 8443
CMD ["node", "server/signaling-server.js"]
```

## TURN Server (for restrictive networks)

Public STUN works for ~80% of connections. For the remaining 20% (symmetric NAT, corporate firewalls), you need a TURN server:

1. Install coturn:
   ```
   sudo apt install coturn
   ```

2. Configure `/etc/turnserver.conf`:
   ```
   listening-port=3478
   realm=yourdomain.com
   server-name=yourdomain.com
   cred=secretpassword
   lt-cred-mech
   ```

3. Start: `sudo systemctl start coturn`

4. Update `voip.html` ICE servers to include:
   ```javascript
   { urls: 'turn:yourdomain.com:3478', username: 'user', credential: 'secretpassword' }
   ```

Free TURN alternatives:
- Twilio Network Traversal Service (free tier: 10GB/month)
- Xirsys (free tier available)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| HTTP_PORT | 8080 | HTTP port (redirect to HTTPS) |
| HTTPS_PORT | 8443 | HTTPS port |
| STATIC_DIR | .. | Path to HTML files |

## Troubleshooting

- "Signaling server error" -- Make sure the server is running
- "Could not access microphone" -- Check browser permissions, must be HTTPS or localhost
- Black remote video -- Check STUN/TURN, check firewall allows UDP
- Self-signed cert warning -- Normal for local testing, use Certbot for production
