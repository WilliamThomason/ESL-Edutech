#!/bin/bash
# Tutoring Platform — One-command setup
# Run this on a fresh Ubuntu 22.04 VM (Oracle Cloud free tier or any VPS)

set -e

echo "============================================"
echo "  Tutoring Platform Setup"
echo "============================================"

# ── 1. System Updates ─────────────────────────────────────
echo "[1/7] Updating system..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw fail2ban

# ── 2. Docker Install ─────────────────────────────────────
echo "[2/7] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  echo "Docker installed. You may need to log out and back in."
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# ── 3. Firewall ───────────────────────────────────────────
echo "[3/7] Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3478     # TURN
sudo ufw allow 5349     # TURN TLS
sudo ufw allow 7880     # LiveKit
sudo ufw allow 7881     # LiveKit TCP
sudo ufw allow 7882/udp # LiveKit UDP
sudo ufw allow 50000:51000/udp # RTP media
sudo ufw --force enable

# ── 4. Clone/Create Project ───────────────────────────────
echo "[4/7] Setting up project..."
PROJECT_DIR="$HOME/tutoring-platform"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# ── 5. Environment ────────────────────────────────────────
echo "[5/7] Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate random secrets
  CALCOM_NEXTAUTH=$(openssl rand -hex 32)
  CALCOM_ENC=$(openssl rand -hex 32)
  LIVEKIT_KEY="lk_$(openssl rand -hex 8)"
  LIVEKIT_SECRET=$(openssl rand -hex 32)
  TURN_SECRET=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 32)

  sed -i "s|DOMAIN=tutoring.example.com|DOMAIN=${DOMAIN:-localhost}|" .env
  sed -i "s|CALCOM_NEXTAUTH_SECRET=.*|CALCOM_NEXTAUTH_SECRET=${CALCOM_NEXTAUTH}|" .env
  sed -i "s|CALCOM_ENCRYPTION_KEY=.*|CALCOM_ENCRYPTION_KEY=${CALCOM_ENC}|" .env
  sed -i "s|LIVEKIT_API_KEY=.*|LIVEKIT_API_KEY=${LIVEKIT_KEY}|" .env
  sed -i "s|LIVEKIT_API_SECRET=.*|LIVEKIT_API_SECRET=${LIVEKIT_SECRET}|" .env
  sed -i "s|TURN_SECRET=.*|TURN_SECRET=${TURN_SECRET}|" .env
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env

  echo "Generated random secrets in .env"
fi

# ── 6. SSL Certificates ───────────────────────────────────
echo "[6/7] Setting up SSL..."
read -p "Enter your domain (e.g., tutoring.example.com): " DOMAIN
read -p "Enter your email (for SSL certificates): " EMAIL

sed -i "s|DOMAIN=.*|DOMAIN=${DOMAIN}|" .env

# Start nginx temporarily for certbot challenge
docker-compose up -d nginx

# Get SSL certificate
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "livekit.$DOMAIN" \
  -d "api.$DOMAIN" \
  -d "files.$DOMAIN" \
  -d "minio.$DOMAIN"

# ── 7. Start Everything ───────────────────────────────────
echo "[7/7] Starting all services..."
docker-compose up -d

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Your platform is available at:"
echo "  Main app:    https://${DOMAIN}"
echo "  LiveKit:     https://livekit.${DOMAIN}"
echo "  API:         https://api.${DOMAIN}"
echo "  File storage: https://files.${DOMAIN}"
echo "  MinIO admin: https://minio.${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Go to https://${DOMAIN} and create your admin account"
echo "  2. Teachers: set up your profile and availability in Cal.com"
echo "  3. Students: book sessions through the public booking page"
echo "  4. At session time, both join the LiveKit room for voice/video/screen share"
echo "  5. Use the chat sidebar for text messages and file sharing"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Restart:      docker-compose restart"
echo "  Stop:         docker-compose down"
echo "  Update:       docker-compose pull && docker-compose up -d"
