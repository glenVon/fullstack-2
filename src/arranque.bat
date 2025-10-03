@REM start cmd.exe /k "cd /d %~dp0 && npm start"
@REM start cmd.exe /k "cd /d %~dp0 && npm run dev"
start cmd.exe /k "cd /d %~dp0 && npm run dev -- --host"
start http://localhost:5173/