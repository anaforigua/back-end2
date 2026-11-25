@echo off
setlocal

if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=revenfy
if "%DB_USER%"=="" set DB_USER=postgres

set BACKUP_DIR=%~dp0respaldos
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set PG_DUMP=
where pg_dump >nul 2>nul && set PG_DUMP=pg_dump

if "%PG_DUMP%"=="" (
    if exist "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" set PG_DUMP="C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
)

if "%PG_DUMP%"=="" (
    if exist "%ProgramFiles(x86)%\PostgreSQL\18\bin\pg_dump.exe" set PG_DUMP="%ProgramFiles(x86)%\PostgreSQL\18\bin\pg_dump.exe"
)

if "%PG_DUMP%"=="" (
    echo [ERROR] No se encontro pg_dump.exe en este dispositivo.
    exit /b 1
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set FECHA=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%

set ARCHIVO=%BACKUP_DIR%\%DB_NAME%_%FECHA%.backup

%PG_DUMP% -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -Fc -v -f "%ARCHIVO%" %DB_NAME%

endlocal