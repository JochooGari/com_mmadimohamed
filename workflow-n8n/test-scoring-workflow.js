#!/usr/bin/env node
/**
 * TEST DU WORKFLOW SCORING SEO/GEO
 */

const axios = require('axios');
const fs = require('fs');

async function testScoring() {
  try {
    // Charger la config
    const config = JSON.parse(fs.readFileSync('workflow-n8n/workflow-scoring-config.json', 'utf8'));
    const webhookUrl = config.webhook_url;

    console.log('\n🧪 TEST DU WORKFLOW SCORING SEO/GEO\n');
    console.log('='.repeat(80));
    console.log('📡 URL:', webhookUrl);

    // Article de test (extrait du PRD)
    const testArticle = `
<article itemscope itemtype="https://schema.org/Article">
  <header>
    <h1 itemprop="headline">Power BI vs Tableau 2025 : Comparatif Complet pour CFO</h1>
    <p class="meta" itemprop="description">Découvrez quel outil de Business Intelligence choisir pour votre entreprise française. Comparaison détaillée, ROI, cas d'usage Finance.</p>
    <time datetime="2025-01-24" itemprop="datePublished">24 janvier 2025</time>
  </header>

  <div class="intro-section">
    <p><strong>En 2025, le choix d'un outil de Business Intelligence est stratégique pour les départements Finance.</strong> Power BI et Tableau dominent le marché, mais lequel répond le mieux aux besoins des CFO et DAF français ?</p>

    <p>Ce guide complet compare les deux solutions sur 10 critères clés : coût, facilité d'utilisation, intégration comptable, conformité RGPD, et ROI mesuré. Basé sur une étude de 45 entreprises françaises et des données 2024 du Gartner Magic Quadrant.</p>

    <nav class="table-of-contents" aria-label="Table des matières">
      <h2>Sommaire</h2>
      <ul>
        <li><a href="#vue-ensemble">1. Vue d'ensemble : Power BI vs Tableau</a></li>
        <li><a href="#prix-roi">2. Prix et ROI comparés</a></li>
        <li><a href="#facilite-usage">3. Facilité d'utilisation pour la Finance</a></li>
        <li><a href="#integration">4. Intégration avec ERP et outils Finance</a></li>
        <li><a href="#faq">5. FAQ : Questions fréquentes</a></li>
      </ul>
    </nav>
  </div>

  <section id="vue-ensemble">
    <h2>1. Vue d'ensemble : Power BI vs Tableau en 2025</h2>

    <h3>1.1. Parts de marché et adoption en France</h3>
    <p>Selon le baromètre <a href="https://www.syntec-numerique.fr" target="_blank">Syntec Numérique 2024</a>, <strong>Power BI détient 62% du marché français</strong> des PME et ETI, contre 23% pour Tableau. L'écart s'explique par trois facteurs :</p>

    <ul>
      <li>Intégration native avec Microsoft 365 (utilisé par 89% des entreprises françaises)</li>
      <li>Prix 3x inférieur pour les licences Pro</li>
      <li>Courbe d'apprentissage plus rapide pour les analystes Finance</li>
    </ul>

    <div class="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Critère</th>
            <th>Power BI</th>
            <th>Tableau</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prix/utilisateur/an</td>
            <td>120€ (Pro)</td>
            <td>840€ (Creator)</td>
          </tr>
          <tr>
            <td>Temps formation moyen</td>
            <td>2-3 semaines</td>
            <td>4-6 semaines</td>
          </tr>
          <tr>
            <td>Conformité RGPD</td>
            <td>✅ Datacenter EU</td>
            <td>✅ Datacenter EU</td>
          </tr>
        </tbody>
      </table>
    </div>

    <blockquote>
      <p>"Nous avons migré de Tableau vers Power BI en 2024 et divisé nos coûts BI par 3,5. Le ROI a été atteint en 7 mois."</p>
      <cite>— Sophie Martin, DAF, Groupe industriel 450 personnes (Lyon)</cite>
    </blockquote>
  </section>

  <section id="faq">
    <h2>5. FAQ : Questions fréquentes</h2>

    <div itemscope itemtype="https://schema.org/FAQPage">
      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">Quel outil choisir pour une PME française de 50-200 personnes ?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <div itemprop="text">
            <p><strong>Power BI</strong> est recommandé pour 85% des PME françaises selon notre étude. Raisons : coût maîtrisé, intégration Office 365, support Microsoft France, et temps de formation réduit.</p>
          </div>
        </div>
      </div>

      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">Power BI est-il conforme RGPD pour les données sensibles ?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <div itemprop="text">
            <p>Oui, Power BI stocke les données dans des datacenters européens (Dublin, Amsterdam) et respecte le RGPD. Microsoft dispose de la certification ISO 27001 et du label <a href="https://www.ssi.gouv.fr/" target="_blank">SecNumCloud</a> de l'ANSSI pour les données sensibles.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="cta-box">
      <h3>🎯 Besoin d'aide pour choisir ?</h3>
      <p>Téléchargez notre grille de décision Excel pour comparer Power BI et Tableau selon vos critères métier.</p>
      <a href="/download/comparatif-bi-2025" class="cta-button">Télécharger le comparatif (gratuit)</a>
    </div>
  </footer>
</article>
    `.trim();

    const testPayload = {
      content: testArticle,
      config: {
        primaryKeyword: "Power BI vs Tableau",
        articleType: "comparatif",
        targetLength: 2500,
        searchIntent: "commercial",
        secondaryKeywords: ["business intelligence", "CFO", "DAF", "ROI BI"],
        targetPersona: "CFO et DAF d'entreprises françaises 50-500 personnes"
      },
      userProfile: {
        industry: "Finance & BI",
        market: "france"
      },
      level: "full"
    };

    console.log('\n📦 Payload:');
    console.log('   Mot-clé:', testPayload.config.primaryKeyword);
    console.log('   Type:', testPayload.config.articleType);
    console.log('   Longueur:', testArticle.split(/\s+/).length, 'mots');
    console.log('   Niveau analyse:', testPayload.level);

    console.log('\n⏱️  Envoi de la requête (estimé: 10-15 secondes)...\n');

    const startTime = Date.now();
    const response = await axios.post(webhookUrl, testPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 1 minute max
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('✅ SUCCÈS!\n');
    console.log('='.repeat(80));
    console.log('⏱️  Durée:', duration + 's');
    console.log('📊 Status:', response.status);

    const result = response.data;

    console.log('\n📈 SCORES:');
    console.log('   Global:', result.scores.global + '/100', `[${result.statusBadge}]`);
    console.log('   SEO:', result.scores.seo + '/76');
    console.log('   GEO:', result.scores.geo + '/19');
    console.log('   Fraîcheur:', result.scores.freshness + '/5');
    console.log('   Pénalité:', (result.freshnessPenalty * 100) + '%');

    console.log('\n📊 CRITÈRES:');
    console.log('   🟢 OK:', result.criteriaCounts.ok);
    console.log('   🟡 Warning:', result.criteriaCounts.warning);
    console.log('   🔴 Critical:', result.criteriaCounts.critical);

    console.log('\n🎯 PRIORITÉS:');
    if (result.priorities && result.priorities.length > 0) {
      result.priorities.slice(0, 5).forEach((p, i) => {
        const emoji = p.severity === 'critical' ? '🔴' : '🟡';
        console.log(`   ${emoji} ${i + 1}. ${p.criterion}`);
        console.log(`      Problème: ${p.problem}`);
        console.log(`      Action: ${p.action}`);
      });
    }

    console.log('\n💡 RÉSUMÉ:');
    console.log('   ', result.summary || 'Aucun résumé disponible');

    if (result.recommendations) {
      if (result.recommendations.critical && result.recommendations.critical.length > 0) {
        console.log('\n🔴 ACTIONS CRITIQUES:');
        result.recommendations.critical.forEach(a => console.log('   •', a));
      }

      if (result.recommendations.strengths && result.recommendations.strengths.length > 0) {
        console.log('\n🟢 POINTS FORTS:');
        result.recommendations.strengths.forEach(s => console.log('   •', s));
      }
    }

    console.log('\n📝 MÉTADONNÉES:');
    console.log('   Version:', result.scoringVersion);
    console.log('   Modèle:', result.llmModel);
    console.log('   Analysé:', new Date(result.analyzedAt).toLocaleString('fr-FR'));

    console.log('\n='.repeat(80));
    console.log('✅ Test terminé!\n');

    // Sauvegarder le résultat
    const outputPath = 'workflow-n8n/test-scoring-result.json';
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log('💾 Résultat sauvegardé:', outputPath);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.code === 'ECONNABORTED') {
      console.error('\n⏱️  Timeout: Le scoring prend plus de 60 secondes');
      console.error('   Vérifie l\'exécution dans n8n:');
      console.error('   👉 https://n8n.srv1144760.hstgr.cloud/executions');
    }

    process.exit(1);
  }
}

testScoring();
