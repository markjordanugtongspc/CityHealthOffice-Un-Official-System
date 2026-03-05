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
set "SEARCH_PROJECT=CityHealthOffice-Un-Official-System"
set "SEARCH_PROJECT_ALT=Project"
set "FINAL_PROJECT_PATH="
set "FOLDER_NAME="

if exist "%SCRIPT_DIR%package.json" (
    set "FINAL_PROJECT_PATH=%SCRIPT_DIR%"
) else (
    call :FindFile "xampp\htdocs\%SEARCH_PROJECT%" FINAL_PROJECT_PATH
    if not defined FINAL_PROJECT_PATH call :FindFile "xampp\htdocs\%SEARCH_PROJECT_ALT%" FINAL_PROJECT_PATH
)

if not defined FINAL_PROJECT_PATH (
    set "FINAL_PROJECT_PATH=%SCRIPT_DIR%"
    call :log WARNING: Could not definitively find project root via search. Using script location.
)

REM Strip trailing backslash if exists
if "!FINAL_PROJECT_PATH:~-1!"=="\" set "FINAL_PROJECT_PATH=!FINAL_PROJECT_PATH:~0,-1!"

REM Get the folder name from the path
for %%I in ("!FINAL_PROJECT_PATH!") do set "FOLDER_NAME=%%~nxI"

call :log Identified Project Path: !FINAL_PROJECT_PATH!
call :log Identified Folder Name: !FOLDER_NAME!

set "TARGET_URL=http://localhost/!FOLDER_NAME!/"

REM ------------------------------------------------------------------
REM 1) Detect XAMPP and ensure Apache/MySQL are running
REM ------------------------------------------------------------------
echo Detecting if XAMPP is running...
call :log Detecting if XAMPP is running...

set "XAMPP_PROC_RUNNING=0"
tasklist /FI "IMAGENAME eq xampp-control.exe" | find /I "xampp-control.exe" >nul
if not errorlevel 1 set "XAMPP_PROC_RUNNING=1"
tasklist /FI "IMAGENAME eq xampp_start.exe" | find /I "xampp_start.exe" >nul
if not errorlevel 1 set "XAMPP_PROC_RUNNING=1"

if "%XAMPP_PROC_RUNNING%"=="1" (
    echo XAMPP process detected as running.
    call :log XAMPP process detected as running.
) else (
    echo XAMPP is not running. Searching for xampp_start.exe...
    call :log XAMPP not running. Searching across drives...
    
    call :FindFile xampp\xampp_start.exe XAMPP_START_PATH
    if defined XAMPP_START_PATH (
        echo Found XAMPP at: !XAMPP_START_PATH!
        call :log Found XAMPP: !XAMPP_START_PATH!
        echo Starting XAMPP...
        start "" "!XAMPP_START_PATH!"
        timeout /t 5 /nobreak >nul
    ) else (
        echo ERROR: xampp_start.exe not found on C, D, F, E, G, H drives.
        call :log ERROR: xampp_start.exe not found.
    )
)

REM Ensure services are up
call :StartService httpd.exe xampp\xampp-control.exe --startapache Apache
call :StartService mysqld.exe xampp\xampp-control.exe --startmysql MySQL

REM ------------------------------------------------------------------
REM 2) Find Git Bash and run `npm run dev`
REM ------------------------------------------------------------------
echo Searching for Git Bash...
call :log Searching for Git Bash...

set "GITBASH_EXE="
call :FindFile "Program Files\Git\git-bash.exe" GITBASH_EXE
if not defined GITBASH_EXE call :FindFile "Program Files (x86)\Git\git-bash.exe" GITBASH_EXE
if not defined GITBASH_EXE call :FindFile "Git\git-bash.exe" GITBASH_EXE

if defined GITBASH_EXE (
    echo Found Git Bash: !GITBASH_EXE!
    call :log Found Git Bash: !GITBASH_EXE!
    echo Opening Git Bash and running "npm run dev" with 2s delay...
    
    REM Simplified but effective start for Git Bash
    REM The -c command runs the string, and we use 'exec bash' at the end to keep the window open.
    start "" "!GITBASH_EXE!" --cd="!FINAL_PROJECT_PATH!" -c "sleep 2; npm run dev; exec bash"
    
    call :log Executed start command for Git Bash at !FINAL_PROJECT_PATH!
) else (
    echo ERROR: Git Bash not found. 
    call :log ERROR: Git Bash not found.
)

REM ------------------------------------------------------------------
REM 3) Minimize Windows & Wait
REM ------------------------------------------------------------------
echo Minimizing all windows to clear workspace...
call :log Minimizing all windows.
powershell -command "(New-Object -ComObject Shell.Application).MinimizeAll()"

REM Added a longer delay (7 seconds) to allow XAMPP and npm run dev to stabilize
echo Waiting 7 seconds for servers to stabilize...
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
echo Script finished. Press any key to close...
pause >nul
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
REM Helper: StartService <ProcName> <CtrlPath> <Flag> <DisplayName>
REM ------------------------------------------------------------------
:StartService
tasklist /FI "IMAGENAME eq %~1" | find /I "%~1" >nul
if errorlevel 1 (
    echo %~4 is NOT running. Attempting to start...
    call :FindFile "%~2" CTRL_LOCAL
    if defined CTRL_LOCAL (
        start /min "" "!CTRL_LOCAL!" %~3
        call :log Triggered %~4 start via !CTRL_LOCAL!
        timeout /t 2 /nobreak >nul
    )
) else (
    echo %~4 is already running.
)
exit /b

REM ------------------------------------------------------------------
REM Helper: Logging
REM ------------------------------------------------------------------
:log
echo [%date% %time%] %*>>"%LOGFILE%"
exit /b
