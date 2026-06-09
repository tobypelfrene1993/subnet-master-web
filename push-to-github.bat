@echo off
setlocal

cd /d "%~dp0"

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
  if "%COMMIT_MSG%"=="" set "COMMIT_MSG=Update Subnet Master project"

  echo.
  echo Committing changes...
  git commit -m "%COMMIT_MSG%"
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
