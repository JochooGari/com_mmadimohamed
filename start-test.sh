#!/bin/bash

echo "🚀 Démarrage Test Éditeur IA Amélioré"
echo "====================================="
echo

echo "🔍 Vérification de l'intégrité..."
node test-enhanced-editor.js

if [ $? -ne 0 ]; then
    echo
    echo "❌ Erreurs détectées. Arrêt."
    exit 1
fi

echo
echo "📦 Installation des dépendances..."
npm install

echo
echo "🚀 Démarrage du serveur de développement..."
echo
echo "Interface disponible sur: http://localhost:5174/admin"
echo "Appuyez sur Ctrl+C pour arrêter"
echo

npm run dev