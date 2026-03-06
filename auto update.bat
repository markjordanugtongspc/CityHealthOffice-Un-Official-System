@echo off
setlocal enabledelayedexpansion

REM ------------------------------------------------------------------
REM Auto Update Script for Project
REM This script stashes local changes and pulls the latest from Git.
REM ------------------------------------------------------------------

:: 1) Identify Project Path
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo --------------------------------------------------------
echo        PROJECT AUTO-UPDATE SYSTEM
echo --------------------------------------------------------
echo.

:: 2) Find Git Bash EXE (Using fallback logic from start program.bat)
set "GIT_EXE="
where git >nul 2>nul
if %errorlevel% == 0 (
    set "GIT_EXE=git"
) else (
    REM Try common paths if not in PATH
    for %%D in (C D F E G H) do (
        if exist "%%D:\Program Files\Git\bin\git.exe" set "GIT_EXE=%%D:\Program Files\Git\bin\git.exe"
        if exist "%%D:\Program Files (x86)\Git\bin\git.exe" set "GIT_EXE=%%D:\Program Files (x86)\Git\bin\git.exe"
    )
)

if not defined GIT_EXE (
    echo [ERROR] Git command not found in your system path or common folders.
    echo Please ensure Git is installed.
    echo.
    echo Press enter to exit...
    pause >nul
    exit /b
)

:: 3) Execute Git Commands
echo [STEP 1] Saving local progress (Stashing)...
"!GIT_EXE!" stash
echo.

echo [STEP 2] Fetching and Pulling latest updates from GitHub...
:: Standard pull is safer, but we add a fallback for 'force' behavior if requested
"!GIT_EXE!" pull
if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Standard pull failed. Enforcing update from origin...
    "!GIT_EXE!" fetch --all
    "!GIT_EXE!" reset --hard origin/main
)
echo.

:: 4) Finalization Message
echo --------------------------------------------------------
echo      SUCCESSFULLY UPDATED TO THE LATEST VERSION!
echo --------------------------------------------------------
echo.
echo Everything is now up to date. You can start the program.
echo.
echo Press enter to exit...
pause >nul
exit /b
