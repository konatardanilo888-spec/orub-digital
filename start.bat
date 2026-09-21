@echo off
setlocal
title ORUB DIGITAL - server

REM Predji u folder u kom se nalazi ovaj start.bat fajl
cd /d "%~dp0"

REM Ako package.json nije ovdje, probaj da udjes u podfolder "orub-digital"
if not exist "package.json" (
  if exist "orub-digital\package.json" (
    cd orub-digital
  )
)

if not exist "package.json" (
  echo.
  echo GRESKA: Ne mogu da pronadjem package.json.
  echo Prebacite ovaj start.bat fajl direktno u folder gdje se nalaze
  echo server.js, package.json, lib, views i public.
  echo.
  pause
  exit /b 1
)

echo.
echo Pokrecem ORUB DIGITAL server...
echo Kada se pojavi "server pokrenut", otvorite u browseru: http://localhost:3000
echo Admin panel: http://localhost:3000/admin
echo.
echo (Ovaj prozor MORA ostati otvoren dok sajt radi. Zatvorite ga da ugasite server.)
echo.

call npm start

echo.
echo Server je zaustavljen.
pause
