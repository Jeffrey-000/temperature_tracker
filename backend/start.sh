#! /bin/zsh
pkill mqtt && nohup dotnet run > output.log 2>&1 &
