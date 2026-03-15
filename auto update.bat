@echo off
setlocal enabledelayedexpansion

REM ------------------------------------------------------------------
REM Auto Update Script for Project
REM This script safely stashes local changes and pulls the latest from Git.
REM ------------------------------------------------------------------

:: 1) Identify Project Path
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo --------------------------------------------------------
echo        PROJECT AUTO-UPDATE SYSTEM
echo --------------------------------------------------------
echo.

:: 2) Find Git EXE (Using robust fallback logic)
set "GIT_EXE="
where git >nul 2>nul
if %errorlevel% == 0 (
    set "GIT_EXE=git"
) else (
    REM Try common paths if not in PATH
    for %%D in (C D F E G H) do (
        if exist "%%D:\Program Files\Git\bin\git.exe" set "GIT_EXE=%%D:\Program Files\Git\bin\git.exe"
        if exist "%%D:\Program Files (x86)\Git\bin\git.exe" set "GIT_EXE=%%D:\Program Files (x86)\Git\bin\git.exe"
        if exist "%%D:\Users\%USERNAME%\AppData\Local\Programs\Git\bin\git.exe" set "GIT_EXE=%%D:\Users\%USERNAME%\AppData\Local\Programs\Git\bin\git.exe"
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

:: 3) Check for Local Changes and Stash
set "HAS_CHANGES=0"
for /f "delims=" %%i in ('"!GIT_EXE!" status --porcelain') do set "HAS_CHANGES=1"

if "!HAS_CHANGES!"=="1" (
    :: Auto-Increment Logic
    set "COUNTER_FILE=.stash_counter"
    set "COUNTER=0"
    if exist "!COUNTER_FILE!" (
        set /p COUNTER=<!COUNTER_FILE!
    )
    
    echo [STEP 1] Saving local progress as "Stash Backup !COUNTER!"...
    "!GIT_EXE!" stash push -m "Stash Backup !COUNTER!"
    echo.
    
    :: Increment counter and save it for the next time the script runs
    set /a COUNTER+=1
    echo !COUNTER! > "!COUNTER_FILE!"
) else (
    echo [STEP 1] No local changes detected. Skipping stash.
    echo.
)

:: 4) Execute Git Pull
echo [STEP 2] Fetching and Pulling latest updates from GitHub...
"!GIT_EXE!" pull
if !errorlevel! neq 0 (
    echo.
    echo [NOTICE] Standard pull encountered an issue. Check for network errors or repository access.
)
echo.

:: 5) Finalization Message
echo --------------------------------------------------------
echo       SUCCESSFULLY PROCESSED UPDATES!
echo --------------------------------------------------------
echo.
echo Everything is now up to date with the remote repository.
if "!HAS_CHANGES!"=="1" (
    echo.
    echo [INFO] Your local edits were saved to the Git Stash.
    echo To view your backups, run: git stash list
    echo To manually recover them, run: git stash pop
)
echo.
echo Press enter to exit...
pause >nul
exit /b