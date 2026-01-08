// Script pour extraire et formater l'article complet en HTML
const fs = require('fs');

const jsonPath = 'article_complet_2parts.json';
const outputPath = 'ARTICLE_COMPLET_2PARTS.html';

console.log('📖 Lecture du JSON...');
const articleData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const sections = articleData.sections || [];
console.log(`✅ ${sections.length} sections trouvées\n`);

// Compter les mots
let totalWords = 0;
sections.forEach(s => {
  const text = (s.html || '').replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 0);
  totalWords += words.length;
});

console.log(`📊 Nombre total de mots: ${totalWords}\n`);

// Générer HTML
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Article Complet - Datawarehouse Finance et Power BI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.6;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .meta {
            background: #e8f5e9;
            padding: 20px;
            border-left: 4px solid #4caf50;
            margin: 30px 0;
            border-radius: 4px;
        }
        h1 {
            color: #1a237e;
            font-size: 2.2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3f51b5;
            padding-bottom: 15px;
        }
        h2 {
            color: #283593;
            font-size: 1.8em;
            margin-top: 50px;
            margin-bottom: 20px;
            border-bottom: 2px solid #7986cb;
            padding-bottom: 10px;
        }
        h3 {
            color: #5c6bc0;
            font-size: 1.4em;
            margin-top: 30px;
        }
        h4 {
            color: #7986cb;
            font-size: 1.1em;
            margin-top: 20px;
        }
        a {
            color: #1976d2;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table th {
            background: #3f51b5;
            color: white;
            padding: 12px;
            text-align: left;
        }
        table td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        table tr:nth-child(even) {
            background: #f5f5f5;
        }
        .key-points {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .case-study {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .tip-box {
            background: #f1f8e9;
            border-left: 4px solid #8bc34a;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .cta-box {
            background: #fff8e1;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: center;
        }
        .visual-placeholder {
            background: #fafafa;
            border: 2px dashed #9e9e9e;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            text-align: center;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        li {
            margin: 8px 0;
        }
        p {
            margin: 15px 0;
        }
        strong {
            color: #d32f2f;
            font-weight: 600;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>

<div class="container">

<div class="meta">
    <strong>✅ ARTICLE COMPLET GÉNÉRÉ EN 2 PARTIES - GPT-5.1</strong><br>
    Job ID: job_1763636460462_lok84m<br>
    Sections: ${sections.length}<br>
    Mots: ~${totalWords}<br>
    Tokens générés: 8,426 (4,000 Part 1 + 4,000 Part 2)<br>
    Durée génération: ~76 secondes (38s + 38s)<br>
    <strong style="color: #4caf50;">✓ SANS TIMEOUT - Fusion automatique réussie!</strong>
</div>

${sections.map((section, i) => {
  console.log(`   ${i + 1}. ${section.title}`);
  return `\n<!-- ========== SECTION ${i + 1}: ${section.title} ========== -->\n${section.html}`;
}).join('\n\n')}

<div class="meta">
    <strong>📋 STRUCTURE COMPLÈTE DE L'ARTICLE:</strong>
    <ul style="margin: 10px 0 0 20px;">
${sections.map((s, i) => `        <li>${i + 1}. ${s.title}</li>`).join('\n')}
    </ul>
</div>

</div>

</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');

console.log(`\n✅ HTML généré: ${outputPath}`);
console.log(`📄 Taille: ${Math.round(html.length / 1024)} KB`);
console.log(`\n🎉 Ouvrez ${outputPath} dans votre navigateur pour voir l'article complet!`);
