@echo off
REM Скачивает пакет PDF LETTO и распаковывает на Рабочий стол OneDrive
set DEST=C:\Users\shadc\OneDrive\Desktop\LETTO-dogovory-Word
set URL=https://github.com/MatveiShadchin/letto/raw/cursor/letto-contract-docs-0c24/docs/LETTO-dogovory-Word.zip
set ZIP=%TEMP%\LETTO-dogovory-Word.zip

echo Destination: %DEST%
mkdir "%DEST%" 2>nul
powershell -NoProfile -Command "Invoke-WebRequest -Uri '%URL%' -OutFile '%ZIP%'"
powershell -NoProfile -Command "Expand-Archive -Path '%ZIP%' -DestinationPath '%TEMP%\LETTO-unpack' -Force"
xcopy /E /Y /I "%TEMP%\LETTO-unpack\LETTO-dogovory-Word\*" "%DEST%\"
echo.
echo Done. Open: %DEST%
explorer "%DEST%"
pause
