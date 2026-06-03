#!/bin/bash
# Eloquenta Video Classroom - Quick Start
# =======================================

cd "$(dirname "$0")"

# Generate self-signed TLS certs if needed
if [ ! -f server/certs/key.pem ]; then
  echo "Generating self-signed TLS certificates..."
  mkdir -p server/certs
  openssl req -x509 -newkey rsa:2048 \
    -keyout server/certs/key.pem \
    -out server/certs/cert.pem \
    -days 365 -nodes \
    -subj "/CN=localhost"
  echo "Certificates generated."
fi

# Install dependencies if needed
if [ ! -d server/node_modules ]; then
  echo "Installing dependencies..."
  cd server && npm install && cd ..
fi

echo ""
echo "Starting Eloquenta server..."
echo ""
node server/signaling-server.js
