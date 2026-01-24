@echo off
REM ============================================
REM Run Database Migration - Add deleted_at columns
REM ============================================

echo Running migration: add_deleted_at_columns.sql
echo.

REM Update these variables with your MySQL credentials
set MYSQL_USER=root
set MYSQL_PASSWORD=
set MYSQL_HOST=localhost
set MYSQL_PORT=3306

REM Run the migration
mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% -h%MYSQL_HOST% -P%MYSQL_PORT% < migrations\add_deleted_at_columns.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo.
) else (
    echo.
    echo ❌ Migration failed! Error code: %ERRORLEVEL%
    echo.
)

pause
