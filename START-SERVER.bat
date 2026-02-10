@echo off
title SlideDeck - Servidor
cd /d "%~dp0server"

echo.
echo ========================================
echo   SlideDeck - Apresentacoes Inteligentes
echo ========================================
echo.
echo Iniciando servidor...
echo.
echo Quando aparecer "SlideDeck: http://localhost:3788"
echo ABRA NO NAVEGADOR:  http://localhost:3788
echo.
echo Pressione Ctrl+C para parar o servidor.
echo ========================================
echo.

node index.js

pause
