@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ==============================================
echo   WINGS V4 - GitHub Push Helper
echo ==============================================
echo.

echo Current folder:
echo %CD%
echo.

echo %CD% | find /I "\AppData\Local\Temp\" >nul
if %errorlevel%==0 (
  echo ERROR: This file is running from a temporary ZIP folder.
  echo Extract the ZIP first, then run this BAT again.
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed or not in PATH.
  echo Install Git for Windows, reopen CMD, then run this file again.
  pause
  exit /b 1
)

for /f "delims=" %%A in ('git config --global user.name 2^>nul') do set GITNAME=%%A
for /f "delims=" %%A in ('git config --global user.email 2^>nul') do set GITEMAIL=%%A

if not defined GITNAME (
  set /p GITNAME=Git display name: 
  git config --global user.name "%GITNAME%"
)
if not defined GITEMAIL (
  set /p GITEMAIL=GitHub email: 
  git config --global user.email "%GITEMAIL%"
)

if not exist .git (
  git init
)

git add .
git commit -m "WINGS V4 premium redesign"
if errorlevel 1 (
  echo.
  echo Commit was not created. If Git says "nothing to commit", that is okay.
)

git branch -M main

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  set /p REPO=Paste GitHub repository URL: 
  git remote add origin "%REPO%"
)

echo.
echo Pushing main branch...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Check the error above.
  echo If the GitHub repository contains unrelated old files and you INTEND to replace them,
  echo run manually: git push -u origin main --force
  pause
  exit /b 1
)

echo.
echo SUCCESS. GitHub updated. Connected Vercel project should deploy automatically.
pause
