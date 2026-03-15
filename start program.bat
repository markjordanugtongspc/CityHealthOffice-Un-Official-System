@echo off
setlocal enabledelayedexpansion

REM ------------------------------------------------------------------
REM Project path (folder where this .bat lives)
REM ------------------------------------------------------------------
set "SCRIPT_DIR=%~dp0"
set "LOGFILE=%SCRIPT_DIR%start_program.log"
cd /d "%SCRIPT_DIR%"

call :log --------------------------------------------------------
call :log Script execution started.

REM ------------------------------------------------------------------
REM 0) Discover Project Root and Folder Name
REM ------------------------------------------------------------------
set "FINAL_PROJECT_PATH=%SCRIPT_DIR%"
if "!FINAL_PROJECT_PATH:~-1!"=="\" set "FINAL_PROJECT_PATH=!FINAL_PROJECT_PATH:~0,-1!"
for %%I in ("!FINAL_PROJECT_PATH!") do set "FOLDER_NAME=%%~nxI"
call :log Identified Project Path: !FINAL_PROJECT_PATH!
call :log Identified Folder Name: !FOLDER_NAME!

REM Base URL: http://localhost/<folder>/
set "TARGET_URL=http://localhost/!FOLDER_NAME!/"

REM ------------------------------------------------------------------
REM 1) Run npm install and npm run build (with 5-minute timeout check)
REM ------------------------------------------------------------------
set "RUN_BUILD=1"
set "MARKER_FILE=%FINAL_PROJECT_PATH%\.build_timestamp"

if exist "!MARKER_FILE!" (
    for /f "delims=" %%i in ('powershell -NoProfile -Command "if ((Get-Date) - (Get-Item '!MARKER_FILE!').LastWriteTime -le [TimeSpan]::FromMinutes(5)) { Write-Output 'SKIP' } else { Write-Output 'RUN' }"') do set "CHECK_TIME=%%i"
    if "!CHECK_TIME!"=="SKIP" (
        set "RUN_BUILD=0"
    )
)

REM We use flat logic here (goto) to prevent Batch parenthesis crashes
if "!RUN_BUILD!"=="0" goto skip_build

echo Running npm install and npm run build in "!FINAL_PROJECT_PATH!"...
call :log Running npm install in !FINAL_PROJECT_PATH! (CMD)
pushd "!FINAL_PROJECT_PATH!"

call npm install
if errorlevel 1 goto fallback_gitbash

call :log Running npm run build in !FINAL_PROJECT_PATH! (CMD)
call npm run build
if errorlevel 1 goto fallback_gitbash

REM If we reach here, standard CMD succeeded!
echo. > "!MARKER_FILE!"
call :log Build successful (CMD). Updated timestamp marker.
goto finish_build

REM ------------------------------------------------------------------
REM FALLBACK: Git Bash Auto-Discovery & Execution
REM ------------------------------------------------------------------
:fallback_gitbash
echo.
echo WARNING: Standard CMD failed. Attempting fallback via Git Bash...
call :log WARNING: Standard CMD failed. Attempting fallback via Git Bash...

set "GIT_BASH_EXE="
call :FindFile "Program Files\Git\bin\bash.exe" GIT_BASH_EXE
if not defined GIT_BASH_EXE call :FindFile "Program Files\Git\usr\bin\bash.exe" GIT_BASH_EXE
if not defined GIT_BASH_EXE call :FindFile "Program Files (x86)\Git\bin\bash.exe" GIT_BASH_EXE
if not defined GIT_BASH_EXE call :FindFile "Users\%USERNAME%\AppData\Local\Programs\Git\bin\bash.exe" GIT_BASH_EXE

if defined GIT_BASH_EXE (
    echo Found Git Bash at: !GIT_BASH_EXE!
    call :log Found Git Bash at: !GIT_BASH_EXE!

    echo Running npm install via Git Bash...
    call :log Running npm install via Git Bash...
    "!GIT_BASH_EXE!" -c "npm install"
    if errorlevel 1 (
        echo ERROR: Git Bash npm install failed.
        call :log ERROR: Git Bash npm install failed.
        goto finish_build
    )

    echo Running npm run build via Git Bash...
    call :log Running npm run build via Git Bash...
    "!GIT_BASH_EXE!" -c "npm run build"
    if errorlevel 1 (
        echo ERROR: Git Bash npm run build failed.
        call :log ERROR: Git Bash npm run build failed.
    ) else (
        REM Success via Git Bash!
        echo. > "!MARKER_FILE!"
        call :log Build successful (Git Bash). Updated timestamp marker.
    )
) else (
    echo ERROR: Git Bash not found on any drive. Fallback failed.
    call :log ERROR: Git Bash not found. Fallback failed.
)

:finish_build
popd
goto setup_laragon

:skip_build
echo Build was successfully executed within the last 5 minutes.
echo Skipping npm install and npm run build...
call :log Skipped npm install and build (ran less than 5 mins ago).

:setup_laragon
REM ------------------------------------------------------------------
REM 2) Start Laragon normally and prepare services (Auto-Discovery)
REM ------------------------------------------------------------------
echo.
echo Preparing Laragon services...
call :log Preparing Laragon services...

set "LARAGON_EXE="

if defined laragon_root (
    if exist "%laragon_root%\laragon.exe" (
        set "LARAGON_EXE=%laragon_root%\laragon.exe"
    )
)

if not defined LARAGON_EXE (
    for %%D in (C D E F G H) do (
        if exist "%%D:\laragon\laragon.exe" (
            set "LARAGON_EXE=%%D:\laragon\laragon.exe"
            set "laragon_root=%%D:\laragon"
        )
    )
)

if defined LARAGON_EXE (
    echo Found Laragon at: !LARAGON_EXE!
    call :log Found Laragon at: !LARAGON_EXE!
    
    echo Starting Laragon normally to ensure Apache and MySQL run...
    start "" "!LARAGON_EXE!"
    
    REM Give Laragon a brief moment to spin up services
    timeout /t 3 /nobreak >nul

    echo Reloading Laragon stack via CLI...
    call :log Reloading Laragon stack via CLI...
    "!laragon_root!\laragon" reload apache
    "!laragon_root!\laragon" reload nginx 2>nul
) else (
    echo ERROR: Could not find laragon.exe on any drive.
    echo WARNING: Skipping Laragon reload. Please start Laragon manually.
    call :log ERROR: laragon.exe not found. Skipping reload.
)

REM ------------------------------------------------------------------
REM 3) Minimize Windows & Wait
REM ------------------------------------------------------------------
echo.
echo Minimizing all windows to clear workspace...
call :log Minimizing all windows.
powershell -command "(New-Object -ComObject Shell.Application).MinimizeAll()"

REM Allow build and Laragon services to stabilize
echo Waiting 7 seconds for services to stabilize...
call :log Waiting 7 seconds before launching browser.
timeout /t 7 /nobreak >nul

REM ------------------------------------------------------------------
REM 4) Open Browser (Brave)
REM ------------------------------------------------------------------
echo Searching for Brave Browser...
call :log Searching for Brave Browser...

set "BRAVE_PATH="
call :FindFile "Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" BRAVE_PATH
if not defined BRAVE_PATH call :FindFile "Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe" BRAVE_PATH
if not defined BRAVE_PATH call :FindFile "Users\%USERNAME%\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe" BRAVE_PATH

REM Also search for the shortcut if exe not found directly
if not defined BRAVE_PATH (
    call :FindFile "Users\Public\Desktop\Brave.lnk" BRAVE_PATH
)

if defined BRAVE_PATH (
    echo Found Brave at: !BRAVE_PATH!
    call :log Opening Brave: !BRAVE_PATH! !TARGET_URL!
    REM Use start "" to ensure it opens as a new window and focus it
    start "" "!BRAVE_PATH!" "!TARGET_URL!"
) else (
    echo Brave not found. Opening URL with default browser.
    call :log Brave not found. Opening URL with default browser.
    start "" "!TARGET_URL!"
)

REM ------------------------------------------------------------------
REM Finalization
REM ------------------------------------------------------------------
call :log Script execution finished.
echo.
echo ========================================================
echo Script finished! Please review any logs above.
echo This window will close automatically in 10 seconds...
echo ========================================================
timeout /t 10 /nobreak >nul
exit /b

REM ------------------------------------------------------------------
REM Helper: FindFile <RelativePath> <ReturnVarName>
REM ------------------------------------------------------------------
:FindFile
set "%~2="
for %%D in (C D F E G H) do (
    if exist "%%D:\%~1" (
        set "%~2=%%D:\%~1"
        exit /b 0
    )
)
exit /b 1

REM ------------------------------------------------------------------
REM Helper: Logging
REM ------------------------------------------------------------------
:log
echo [%date% %time%] %*>>"%LOGFILE%"
exit /b