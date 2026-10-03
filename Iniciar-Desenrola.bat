@echo off
title Desenrola.ai
color 0A
echo.
echo =========================================
echo       INICIANDO O DESENROLA.AI...
echo =========================================
echo.
echo ⚡ Ligando o motor da IA...

:: Aguarda 2 segundos e abre o Chrome em Modo App (sem barra de URL)
start /B cmd /c "timeout /t 2 >nul && start chrome --app=http://localhost:3000"

:: Inicia o servidor Node.js (Feche esta janela quando quiser desligar o app)
node server.js