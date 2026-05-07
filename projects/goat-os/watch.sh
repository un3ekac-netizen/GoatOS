#!/bin/bash
SRC="/home/ubuntu/projects/goat-os/index.html"
DEST="/home/ubuntu/.openclaw/canvas/documents/goat-os/index.html"
while true; do
  inotifywait -q -e modify,close_write "$SRC"
  cp "$SRC" "$DEST"
  echo "[$(date +%H:%M:%S)] deployed"
done
