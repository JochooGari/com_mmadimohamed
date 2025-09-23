#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégrité de l'éditeur amélioré
 * Usage: node test-enhanced-editor.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'src/components/admin/enhanced-editor/EnhancedEditorLayout.tsx',
  'src/components/admin/enhanced-editor/LeftPanel/ArticleOutline.tsx',
  'src/components/admin/enhanced-editor/LeftPanel/ContentLibrary.tsx',
  'src/components/admin/enhanced-editor/CenterEditor/SmartEditor.tsx',
  'src/components/admin/enhanced-editor/RightPanel/AIAssistant.tsx',
  'src/components/admin/enhanced-editor/RightPanel/SEOScoring.tsx',
  'src/components/admin/enhanced-editor/RightPanel/GEOScoring.tsx',
  'src/components/admin/enhanced-editor/RightPanel/Insights.tsx',
  'src/components/admin/enhanced-editor/index.ts'
];

const ICONS_USED = [
  'ChevronDown', 'ChevronRight', 'Hash', 'Type', 'Move3D', 'Plus',
  'Search', 'FileText', 'Image', 'Code', 'Quote', 'Table', 'Star',
  'Copy', 'Bold', 'Italic', 'List', 'Link', 'Eye', 'EyeOff',
  'Maximize2', 'Minimize2', 'Send', 'Bot', 'User', 'Wand2', 'Target',
  'Lightbulb', 'CheckCircle', 'Zap', 'TrendingUp', 'AlertTriangle',
  'ExternalLink', 'Clock', 'Sparkles', 'MessageSquare', 'HelpCircle',
  'CheckSquare', 'BarChart3', 'Users', 'Globe', 'ThumbsUp', 'Share2',
  'Settings', 'Brain'
];

function checkFiles() {
  console.log('🔍 Vérification des fichiers de l\'éditeur amélioré...\n');

  let allFilesExist = true;

  REQUIRED_FILES.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ MANQUANT: ${file}`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

function checkLucideIcons() {
  console.log('\n📦 Vérification des icônes Lucide utilisées...\n');

  // Vérifier que lucide-react est installé
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasLucide = packageJson.dependencies?.['lucide-react'] ||
                      packageJson.devDependencies?.['lucide-react'];

    if (hasLucide) {
      console.log(`✅ lucide-react: ${hasLucide}`);
    } else {
      console.log(`❌ lucide-react non installé`);
      console.log(`   Installer avec: npm install lucide-react`);
      return false;
    }
  }

  console.log(`\n📋 Icônes utilisées (${ICONS_USED.length}) :`);
  ICONS_USED.forEach((icon, index) => {
    if ((index + 1) % 6 === 0) {
      console.log(`   ${icon}`);
    } else {
      process.stdout.write(`   ${icon.padEnd(12)}`);
    }
  });
  console.log();

  return true;
}

function checkIntegration() {
  console.log('\n🔗 Vérification de l\'intégration AdminPage...\n');

  const adminPagePath = path.join(__dirname, 'src/pages/AdminPage.tsx');
  if (fs.existsSync(adminPagePath)) {
    const content = fs.readFileSync(adminPagePath, 'utf8');

    const checks = [
      {
        test: content.includes('EnhancedEditorLayout'),
        message: 'Import EnhancedEditorLayout'
      },
      {
        test: content.includes('useEnhancedEditor'),
        message: 'State useEnhancedEditor'
      },
      {
        test: content.includes('Éditeur IA Amélioré'),
        message: 'Bouton switch interface'
      }
    ];

    checks.forEach(check => {
      if (check.test) {
        console.log(`✅ ${check.message}`);
      } else {
        console.log(`❌ MANQUANT: ${check.message}`);
      }
    });

    return checks.every(check => check.test);
  } else {
    console.log('❌ AdminPage.tsx non trouvé');
    return false;
  }
}

function generateTestCommands() {
  console.log('\n🚀 Commandes de test :\n');

  console.log('# 1. Installation des dépendances');
  console.log('npm install');
  console.log('');

  console.log('# 2. Vérification TypeScript');
  console.log('npx tsc --noEmit');
  console.log('');

  console.log('# 3. Démarrage en développement');
  console.log('npm run dev');
  console.log('');

  console.log('# 4. Accès interface');
  console.log('http://localhost:5174/admin');
  console.log('');

  console.log('# 5. Test API backend (si nécessaire)');
  console.log('vercel dev --port 3000');
  console.log('');
}

function main() {
  console.log('🎯 Test de l\'Éditeur IA Amélioré\n');
  console.log('=====================================\n');

  const filesOk = checkFiles();
  const iconsOk = checkLucideIcons();
  const integrationOk = checkIntegration();

  console.log('\n📊 Résumé :\n');
  console.log(`   Fichiers: ${filesOk ? '✅ OK' : '❌ Problèmes'}`);
  console.log(`   Icônes: ${iconsOk ? '✅ OK' : '❌ Problèmes'}`);
  console.log(`   Intégration: ${integrationOk ? '✅ OK' : '❌ Problèmes'}`);

  if (filesOk && iconsOk && integrationOk) {
    console.log('\n🎉 Tout est prêt pour les tests !');
    generateTestCommands();
  } else {
    console.log('\n⚠️  Corrigez les problèmes avant de tester.');
    process.exit(1);
  }
}

main();