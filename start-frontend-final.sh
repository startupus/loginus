#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
cd /root/loginus-new/frontend
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pnpm dev

