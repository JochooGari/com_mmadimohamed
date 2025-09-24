@echo off
echo Demarrage de n8n pour MagicPath...

REM Variables d'environnement pour n8n
set N8N_HOST=localhost
set N8N_PORT=5678
set N8N_PROTOCOL=http
set N8N_EDITOR_BASE_URL=http://localhost:5678
set WEBHOOK_URL=http://localhost:5678

REM Configuration des données
set N8N_USER_FOLDER=%~dp0..\n8n-data
set N8N_BASIC_AUTH_ACTIVE=true
set N8N_BASIC_AUTH_USER=admin
set N8N_BASIC_AUTH_PASSWORD=magicpath2024

REM Créer le dossier de données s'il n'existe pas
if not exist "%N8N_USER_FOLDER%" mkdir "%N8N_USER_FOLDER%"

REM Démarrer n8n
echo Configuration:
echo - Interface: http://localhost:5678
echo - Utilisateur: admin
echo - Mot de passe: magicpath2024
echo.
echo Demarrage en cours...

cd "%~dp0.."
npx n8n start

pause