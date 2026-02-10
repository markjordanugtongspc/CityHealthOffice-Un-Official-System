@echo off
setlocal enabledelayedexpansion

REM ------------------------------------------------------------------
REM Project path (folder where this .bat lives)
REM ------------------------------------------------------------------
set "PROJECT_PATH=%~dp0"
set "LOGFILE=%PROJECT_PATH%start_program.log"
cd /d "%PROJECT_PATH%"
echo Project path: %PROJECT_PATH%
call :log Script started. Project path: %PROJECT_PATH%

REM ------------------------------------------------------------------
REM 1) Ensure XAMPP (Apache) is running
REM    - Checks for httpd.exe (XAMPP Apache process)
REM    - If not running, tries to open C:\xampp\xampp-control.exe
REM ------------------------------------------------------------------
echo Checking if XAMPP (Apache) is running...
tasklist /FI "IMAGENAME eq httpd.exe" | find /I "httpd.exe" >nul
if errorlevel 1 (
    echo Apache does not appear to be running. Trying to start XAMPP control panel...
    call :log Apache not running. Attempting to start XAMPP control panel.
    if exist "C:\xampp\xampp-control.exe" (
        start "" "C:\xampp\xampp-control.exe"
        echo Waiting 5 seconds for XAMPP to initialize...
        call :log Started xampp-control.exe, waiting 5 seconds.
        timeout /t 5 /nobreak >nul
    ) else (
        echo Could not find C:\xampp\xampp-control.exe. Please start XAMPP manually.
        call :log ERROR: xampp-control.exe not found. Exiting.
        goto :END
    )
) else (
    echo Apache (XAMPP) appears to be running.
    call :log Apache appears to be running.
)

REM ------------------------------------------------------------------
REM 2) Find Git Bash and run `npm run dev` in this project
REM ------------------------------------------------------------------
set "GITBASH_EXE="
if exist "%ProgramFiles%\Git\git-bash.exe" (
    set "GITBASH_EXE=%ProgramFiles%\Git\git-bash.exe"
) else if exist "%ProgramFiles(x86)%\Git\git-bash.exe" (
    set "GITBASH_EXE=%ProgramFiles(x86)%\Git\git-bash.exe"
)

if not defined GITBASH_EXE (
    echo Git Bash executable not found in Program Files. Please install Git for Windows.
    call :log ERROR: Git Bash executable not found. Exiting.
    goto :END
)

echo Found Git Bash: %GITBASH_EXE%
echo Opening Git Bash and running "npm run dev"...
call :log Using Git Bash at: %GITBASH_EXE%
call :log Running "npm run dev" in %PROJECT_PATH%

REM Use git-bash.exe with --cd to set working directory
start "" "%GITBASH_EXE%" --cd="%PROJECT_PATH%" -c "npm run dev; exec bash"

REM ------------------------------------------------------------------
REM 3) Minimize all windows
REM ------------------------------------------------------------------
powershell -command "(New-Object -ComObject Shell.Application).MinimizeAll()"
call :log Minimized all windows.

REM ------------------------------------------------------------------
REM 4) After 3 seconds, open Brave to http://localhost/Project/
REM    - Prefer the Brave EXE in Program Files
REM    - Fallback to the public desktop shortcut if present
REM ------------------------------------------------------------------
echo Waiting 3 seconds before opening Brave...
timeout /t 3 /nobreak >nul

set "BRAVE_EXE="
if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_EXE=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
) else if exist "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_EXE=%ProgramFiles(x86)%\Brave-Browser\Application\brave.exe"
)

set "BRAVE_LINK=C:\Users\Public\Desktop\Brave.lnk"
set "TARGET_URL=http://localhost/Project/"

if defined BRAVE_EXE (
    echo Opening Brave via executable...
    call :log Opening Brave via executable: %BRAVE_EXE% %TARGET_URL%
    start "" "%BRAVE_EXE%" "%TARGET_URL%"
) else if exist "%BRAVE_LINK%" (
    echo Brave executable not found, using desktop shortcut...
    call :log Opening Brave via shortcut: %BRAVE_LINK% %TARGET_URL%
    start "" "%BRAVE_LINK%" "%TARGET_URL%"
) else (
    echo Brave browser not found. Please open your browser and go to:
    echo %TARGET_URL%
    call :log ERROR: Brave not found. Please open %TARGET_URL% manually.
)

goto :END

REM ------------------------------------------------------------------
REM Logging helper
REM ------------------------------------------------------------------
:log
echo [%date% %time%] %*>>"%LOGFILE%"
goto :EOF

:END
echo.
echo Script finished. Press any key to close this window...
pause >nul
endlocal