Start-Process powershell -ArgumentList '-NoLogo -NoProfile -ExecutionPolicy Bypass -Command npm start' -WorkingDirectory (Get-Location).Path
