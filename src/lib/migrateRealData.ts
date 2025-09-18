// Migration des vraies données localStorage vers IndexedDB
import { BrowserFileStorage } from './browserStorage';

export async function migrateRealDataToIndexedDB(): Promise<boolean> {
  console.log('🔄 Migration des vraies données localStorage → IndexedDB...');
  
  try {
    // Récupérer les vraies données du localStorage
    const realSources = JSON.parse(localStorage.getItem('linkedin:sources') || '[]');
    const realProcessed = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
    const realConfig = JSON.parse(localStorage.getItem('linkedin:agent-config') || 'null');
    
    console.log(`📁 ${realSources.length} vraies sources trouvées`);
    console.log(`🤖 ${realProcessed.length} données IA trouvées`);
    console.log(`⚙️ Config trouvée:`, !!realConfig);
    
    if (realSources.length === 0) {
      console.log('ℹ️ Aucune vraie donnée à migrer');
      return false;
    }
    
    // Convertir les sources au format IndexedDB
    const convertedSources = realSources
      .filter((source: any) => source && source.id)
      .map((source: any) => {
        const processed = realProcessed.find((p: any) => p.sourceId === source.id);
        
        // Extraire le contenu le plus pertinent
        let content = '';
        
        // Priorité 1: contenu original extrait
        if (processed?.aiData?.originalContent && processed.aiData.originalContent.length > 50) {
          content = processed.aiData.originalContent;
        }
        // Priorité 2: description du source
        else if (source.description && source.description.length > 50) {
          content = source.description;
        }
        // Priorité 3: contenu de base
        else if (source.content) {
          content = source.content;
        }
        // Fallback: nom + métadonnées
        else {
          content = `Document: ${source.name}. Tags: ${(source.tags || []).join(', ')}. Type: ${source.type || 'document'}.`;
        }
        
        return {
          id: source.id,
          name: source.name || `Document ${source.id}`,
          type: (source.type || 'document') as 'document' | 'transcript',
          status: 'ready' as const,
          tags: Array.isArray(source.tags) ? source.tags : ['linkedin'],
          lastUpdated: source.lastUpdated || new Date().toISOString(),
          content: content,
          extractedData: {
            wordCount: content.split(' ').length,
            language: 'fr',
            originalSize: content.length,
            hasAIProcessing: !!processed,
            processingDate: processed?.timestamp || new Date().toISOString()
          }
        };
      });
    
    console.log(`✨ ${convertedSources.length} sources converties`);
    
    // Afficher un aperçu du contenu
    convertedSources.slice(0, 3).forEach(source => {
      console.log(`📄 ${source.name}: ${source.content.substring(0, 100)}...`);
    });
    
    // Sauvegarder dans IndexedDB
    await BrowserFileStorage.saveContentSources('linkedin', convertedSources);
    console.log(`💾 ${convertedSources.length} sources sauvegardées dans IndexedDB`);
    
    // Migrer la configuration si elle existe
    if (realConfig) {
      await BrowserFileStorage.saveAgentConfig('linkedin', realConfig);
      console.log('⚙️ Configuration migrée');
    }
    
    // Créer une configuration par défaut améliorée
    const enhancedConfig = {
      name: 'Agent LinkedIn Expert - Données Réelles',
      description: `Agent IA spécialisé LinkedIn avec accès à ${convertedSources.length} sources de données réelles`,
      prompt: `Tu es un expert en marketing LinkedIn avec accès à ${convertedSources.length} sources de données réelles et vérifiées.

SOURCES DISPONIBLES:
${convertedSources.slice(0, 5).map(s => `- ${s.name} (${s.extractedData.wordCount} mots)`).join('\n')}

EXPERTISE:
- Ghostwriting LinkedIn professionnel
- Stratégies de croissance organique
- Génération de leads qualifiés
- Personal branding et authority building
- Automatisation marketing intelligente
- Analyse ROI et métriques de performance

INSTRUCTIONS:
1. Utilise TOUJOURS le contenu des sources pour tes réponses
2. Cite des exemples concrets tirés des documents
3. Propose des stratégies actionables et mesurables
4. Adapte tes conseils au contexte français/francophone
5. Reste factuel et basé sur les données réelles

Tu as accès à du contenu premium sur le ghostwriting, la croissance LinkedIn, et les stratégies de lead generation. Utilise ces connaissances pour donner des conseils d'expert.`,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      tools: ['LinkedIn Sales Navigator', 'LinkedIn Creator Studio', 'HubSpot', 'Notion', 'Calendly'],
      specialties: [
        'ghostwriting-linkedin',
        'personal-branding', 
        'lead-generation-b2b',
        'content-strategy',
        'growth-hacking',
        'roi-optimization'
      ],
      dataSource: 'real-user-documents',
      lastOptimized: new Date().toISOString()
    };
    
    await BrowserFileStorage.saveAgentConfig('linkedin', enhancedConfig);
    console.log('🎯 Configuration optimisée créée');
    
    // Re-optimiser pour l'IA avec les vraies données
    await BrowserFileStorage.optimizeAgentData('linkedin', convertedSources);
    console.log('🧠 Données optimisées pour l\'IA');
    
    // Créer un rapport de migration
    const migrationReport = {
      migrationDate: new Date().toISOString(),
      originalSources: realSources.length,
      processedData: realProcessed.length,
      migratedSources: convertedSources.length,
      totalContent: convertedSources.reduce((sum, s) => sum + s.content.length, 0),
      avgWordsPerSource: Math.round(convertedSources.reduce((sum, s) => sum + s.extractedData.wordCount, 0) / convertedSources.length),
      sourcesWithContent: convertedSources.filter(s => s.content.length > 100).length,
      sources: convertedSources.map(s => ({
        name: s.name,
        words: s.extractedData.wordCount,
        contentLength: s.content.length
      }))
    };
    
    console.log('\n📊 Rapport de migration:');
    console.log(`✅ ${migrationReport.migratedSources} sources migrées`);
    console.log(`📝 ${migrationReport.totalContent.toLocaleString()} caractères au total`);
    console.log(`📈 ${migrationReport.avgWordsPerSource} mots en moyenne par source`);
    console.log(`✨ ${migrationReport.sourcesWithContent} sources avec contenu substantiel`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration des vraies données:', error);
    return false;
  }
}

// Fonction pour vérifier les données migrées
export async function verifyMigratedData(): Promise<void> {
  console.log('\n🔍 Vérification des données migrées...');
  
  try {
    const sources = await BrowserFileStorage.getContentSources('linkedin');
    const config = await BrowserFileStorage.getAgentConfig('linkedin');
    
    console.log(`📁 ${sources.length} sources disponibles dans IndexedDB`);
    console.log(`⚙️ Configuration:`, !!config);
    
    if (sources.length > 0) {
      console.log('\n📄 Aperçu des sources:');
      sources.slice(0, 5).forEach((source, index) => {
        console.log(`${index + 1}. ${source.name}`);
        console.log(`   📊 ${(source.extractedData?.wordCount ?? 0)} mots, ${(source.content?.length ?? 0)} caractères`);
        console.log(`   🏷️ Tags: ${(source.tags ?? []).join(', ')}`);
        console.log(`   📝 Aperçu: ${(source.content ?? '').substring(0, 100)}...`);
        console.log('');
      });
      
      if (sources.length > 5) {
        console.log(`... et ${sources.length - 5} autres sources`);
      }
    }
    
    if (config) {
      console.log('\n⚙️ Configuration agent:');
      console.log(`   📛 Nom: ${config.name}`);
      console.log(`   🎯 Spécialités: ${config.specialties?.join(', ')}`);
      console.log(`   🛠️ Outils: ${config.tools?.join(', ')}`);
    }
    
    console.log('\n✅ Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exposer les fonctions globalement
(window as any).migrateRealDataToIndexedDB = migrateRealDataToIndexedDB;
(window as any).verifyMigratedData = verifyMigratedData;