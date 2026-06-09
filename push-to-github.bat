@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

for /f "delims=" %%A in ('git config user.name 2^>nul') do set "GIT_NAME=%%A"
for /f "delims=" %%A in ('git config user.email 2^>nul') do set "GIT_EMAIL=%%A"
if "%GIT_NAME%"=="" set "GIT_NAME=Toby Pelfrene"
if "%GIT_EMAIL%"=="" set "GIT_EMAIL=tobypelfrene1993@users.noreply.github.com"

set "GIT_AUTHOR_NAME=%GIT_NAME%"
set "GIT_AUTHOR_EMAIL=%GIT_EMAIL%"
set "GIT_COMMITTER_NAME=%GIT_NAME%"
set "GIT_COMMITTER_EMAIL=%GIT_EMAIL%"

echo Current git status:
git status
if errorlevel 1 goto error

echo.
echo Adding changed files...
git add -A
if errorlevel 1 goto error

git diff --cached --quiet
if errorlevel 2 goto error
if %errorlevel%==0 (
  echo No changed files to commit.
) else (
  echo.
  set "COMMIT_MSG="
  set /p COMMIT_MSG=Enter commit message, or press Enter for default: 
  if "!COMMIT_MSG!"=="" set "COMMIT_MSG=Update Subnet Master project"

  echo.
  echo Committing changes...
  git commit -m "!COMMIT_MSG!"
  if errorlevel 1 goto error
)

echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 goto error

echo.
echo Success: GitHub is updated.
goto end

:error
echo.
echo Error: GitHub update failed. Review the messages above.

:end
echo.
pause
endlocal
