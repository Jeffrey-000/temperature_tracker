#! /bin/zsh

pkill npm
npm run build && nohup npm run start -- -p 12696 > output.log 2>&1 &