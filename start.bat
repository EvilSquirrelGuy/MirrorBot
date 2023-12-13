:: install pnpm if not installed
FOR /F "tokens=*" %%g IN ('WHERE pnpm') do (SET PNPM_PATH=%%g)
IF NOT EXIST %PNPM_PATH% (
  npm i -g pnpm
)

:: install dependencies if not already installed
IF NOT EXIST node_modules (
  pnpm i
)

pnpm run start
