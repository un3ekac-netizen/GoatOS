#!/bin/bash
# GoatOS Services Starter — API + Static + Tunnel + Watcher

# Ensure cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
  sudo curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
  sudo chmod +x /usr/local/bin/cloudflared
fi

# Start API server (also serves static files) if not running
if ! pgrep -f "node api.mjs" > /dev/null; then
  cd /home/ubuntu/projects/goat-os
  nohup node api.mjs > /tmp/goat-os-api.log 2>&1 &
  echo "API + static server started on :8766"
fi

# Start cloudflared if not running
if ! pgrep -f "cloudflared tunnel" > /dev/null; then
  nohup cloudflared tunnel --url http://localhost:8766 > /tmp/cloudflared.log 2>&1 &
  sleep 5
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared.log | head -1)
  echo "Tunnel live: $URL"
fi

# Start file watcher if not running
if ! pgrep -f "watch.sh" > /dev/null; then
  nohup /home/ubuntu/projects/goat-os/watch.sh > /tmp/goat-os-watch.log 2>&1 &
  echo "File watcher started"
fi
