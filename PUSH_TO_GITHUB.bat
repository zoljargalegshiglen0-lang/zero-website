@echo off
setlocal
cd /d "%~dp0"

echo =========================================
echo   WINGS - GitHub Push Helper
echo =========================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
  echo Git is not installed or not in PATH.
  echo Install Git for Windows, then run this file again.
  pause
  exit /b 1
)

if not exist .git (
  git init
  git branch -M main
)

git add .
git commit -m "WINGS website update"

for /f "delims=" %%i in ('git remote') do set HAS_REMOTE=1
if not defined HAS_REMOTE (
  echo.
  set /p REPO_URL=Paste your GitHub repository URL: 
  git remote add origin "%REPO_URL%"
)

echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. If the GitHub repository already contains an unrelated README/commit,
  echo create an empty repository or resolve the remote history first.
  pause
  exit /b 1
)

echo.
echo Done. If Vercel is connected to this repository it will redeploy automatically.
pause
