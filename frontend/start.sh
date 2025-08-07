#! /bin/zsh

pkill npm
npm run build && nohup npm run start > output.log 2>&1 &