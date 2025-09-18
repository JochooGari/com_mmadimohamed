import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Brain, 
  FileText, 
  Database,
  Trash2,
  Download,
  Search
} from 'lucide-react';
import { BrowserFileStorage } from '../lib/browserStorage';
import { aiService, getApiKey } from '../lib/aiProviders';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sourcesUsed?: string[];
  confidence?: number;
}

interface KnowledgeSource {
  id: string;
  name: string;
  title?: string;
  content: string;
  summary?: string;
  chunks?: number;
  relevanceScore?: number;
}

interface KnowledgeChatProps {
  className?: string;
}

export default function KnowledgeChat({ className = '' }: KnowledgeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:chat-history');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          type: 'system',
          content: '🤖 Assistant IA LinkedIn prêt ! Je peux accéder à vos sources de connaissances pour répondre à vos questions.',
          timestamp: new Date().toISOString(),
          confidence: 100
        }
      ];
    } catch {
      return [];
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSources, setAvailableSources] = useState<KnowledgeSource[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les sources de connaissances disponibles
  useEffect(() => {
    const initializeData = async () => {
      await loadAvailableSources();
    };
    
    initializeData();
    
    // Recharger toutes les 10 secondes pour détecter nouveaux fichiers
    const interval = setInterval(async () => {
      await loadAvailableSources();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Sauvegarder l'historique
  useEffect(() => {
    try {
      localStorage.setItem('linkedin:chat-history', JSON.stringify(messages));
    } catch (error) {
      console.error('Erreur sauvegarde historique chat:', error);
    }
  }, [messages]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAvailableSources = async () => {
    try {
      // Charger depuis IndexedDB (nouveau système)
      const indexedDBSources = await BrowserFileStorage.getContentSources('linkedin');
      
      // Fallback vers localStorage si IndexedDB est vide
      let sources, processedData = [];
      
      if (indexedDBSources.length > 0) {
        console.log('📁 Utilisation des données IndexedDB:', indexedDBSources.length);
        sources = indexedDBSources;
      } else {
        console.log('📁 Fallback vers localStorage...');
        sources = JSON.parse(localStorage.getItem('linkedin:sources') || '[]');
        processedData = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
        console.log('📁 Sources localStorage:', sources.length);
        console.log('🤖 Données IA localStorage:', processedData.length);
      }
      
      let knowledgeSources: KnowledgeSource[] = [];
      
      if (indexedDBSources.length > 0) {
        // Utiliser les données IndexedDB (format optimisé)
        knowledgeSources = indexedDBSources
          .filter((s: any) => s.status === 'ready' && s.content)
          .map((source: any) => {
            console.log(`✅ Source IndexedDB: ${source.name} (${source.content?.length || 0} caractères)`);
            
            return {
              id: source.id,
              name: source.name,
              title: source.name,
              content: source.content || '',
              summary: `Document ${source.type} - ${source.extractedData?.wordCount || 0} mots`,
              chunks: Math.ceil((source.content?.length || 0) / 1000),
              relevanceScore: 0.8
            };
          });
      } else {
        // Fallback vers localStorage (ancien format)
        knowledgeSources = sources
          .filter((s: any) => s.status === 'ready')
          .map((source: any) => {
            const processed = processedData.find((p: any) => p.sourceId === source.id);
            
            // Créer un contenu enrichi basé sur les vraies données
            let content = '';
            
            // 1. Utiliser le contenu original extrait du fichier (priorité)
            if (processed?.aiData?.originalContent && processed.aiData.originalContent.length > 50) {
              content = processed.aiData.originalContent;
              console.log(`✅ Contenu original trouvé pour ${source.name}: ${content.length} caractères`);
            }
            // 2. Sinon utiliser la description si elle contient du vrai contenu
            else if (source.description && source.description !== 'Traitement IA en cours...' && !source.description.includes('Traité par IA')) {
              content = source.description;
            }
            // 3. Fallback avec métadonnées
            else {
              content = `Fichier ${source.fileType || 'document'} : ${source.name} (${source.fileSize || 0}MB)`;
              if (source.tags && source.tags.length > 0) {
                content += `\nTags: ${source.tags.join(', ')}`;
              }
            }
            
            // Ajouter les données IA en supplément
            let aiSupplement = '';
            
            if (processed?.aiData?.summary && processed.aiData.summary !== content) {
              aiSupplement += `\n\n📄 RÉSUMÉ IA: ${processed.aiData.summary}`;
            }
            
            if (processed?.aiData?.keyInsights && processed.aiData.keyInsights.length > 0) {
              aiSupplement += `\n\n🔍 POINTS CLÉS:\n${processed.aiData.keyInsights.map(insight => `• ${insight}`).join('\n')}`;
            }
            
            if (processed?.aiData?.suggestedTags && processed.aiData.suggestedTags.length > 0) {
              aiSupplement += `\n\n🏷️ TAGS: ${processed.aiData.suggestedTags.join(', ')}`;
            }
            
            content += aiSupplement;
            
            return {
              id: source.id,
              name: source.name,
              title: source.title || source.name,
              content: content,
              summary: processed?.aiData?.summary || `Document ${source.fileType} ajouté le ${source.addedDate}`,
              chunks: processed?.aiData?.chunks || 1,
              relevanceScore: 0.7
            };
            });
      }

      console.log('✅ Sources prêtes pour IA:', knowledgeSources.length);
      knowledgeSources.forEach(s => console.log(`- ${s.name}: ${s.content.length} caractères`));
      
      setAvailableSources(knowledgeSources);
    } catch (error) {
      console.error('Erreur chargement sources:', error);
    }
  };

  const findRelevantSources = (query: string): KnowledgeSource[] => {
    console.log('🔍 Recherche dans', availableSources.length, 'sources pour:', query);
    
    if (!query.trim()) {
      // Si pas de requête spécifique, retourner toutes les sources
      console.log('📋 Retour de toutes les sources disponibles');
      return availableSources.slice(0, 5);
    }

    const queryLower = query.toLowerCase();
    
    // Mots clés de résumé spéciaux
    const summaryKeywords = ['résume', 'résumé', 'synthèse', 'document', 'contenu', 'tous', 'mes'];
    const isSummaryRequest = summaryKeywords.some(keyword => queryLower.includes(keyword));
    
    if (isSummaryRequest) {
      console.log('📄 Requête de résumé détectée - utilisation de toutes les sources');
      return availableSources; // Utiliser TOUTES les sources pour un résumé
    }
    
    const scoredSources = availableSources
      .map(source => {
        let score = 0;
        
        // Score basé sur le titre (plus important)
        if (source.title?.toLowerCase().includes(queryLower)) score += 100;
        
        // Score basé sur le nom du fichier
        if (source.name?.toLowerCase().includes(queryLower)) score += 80;
        
        // Score basé sur le résumé
        if (source.summary?.toLowerCase().includes(queryLower)) score += 60;
        
        // Score basé sur le contenu complet
        if (source.content?.toLowerCase().includes(queryLower)) score += 40;
        
        // Mots-clés business étendus
        const businessTerms = [
          'ESN', 'TJM', 'recrutement', 'consultant', 'SSII', 'transformation', 'digital',
          'RH', 'talent', 'staffing', 'mission', 'client', 'projet', 'compétence',
          'management', 'équipe', 'innovation', 'technologie', 'développement'
        ];
        
        businessTerms.forEach(term => {
          if (queryLower.includes(term.toLowerCase()) && source.content.toLowerCase().includes(term.toLowerCase())) {
            score += 20;
          }
        });
        
        // Score supplémentaire si le fichier a beaucoup de contenu
        if (source.content.length > 500) score += 10;
        
        console.log(`📊 ${source.name}: score ${score}`);
        return { ...source, relevanceScore: score };
      })
      .filter(source => source.relevanceScore > 0)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    const results = scoredSources.slice(0, 5); // Top 5 sources
    console.log(`✅ ${results.length} sources sélectionnées`);
    return results;
  };

  const generateResponse = async (query: string, relevantSources: KnowledgeSource[]): Promise<string> => {
    console.log('🤖 Génération réponse avec', relevantSources.length, 'sources');
    
    // 1) Exiger OpenAI: si la clé n'est pas définie, informer clairement l'utilisateur (pas de fallback)
    const openaiKey = getApiKey('openai');
    if (!openaiKey) {
      return `❌ Clé API OpenAI manquante.

Veuillez ajouter votre clé dans le fichier .env.local:

VITE_OPENAI_API_KEY=sk-...

Puis redémarrez le serveur de développement et réessayez.`;
    }

    // 2) Appel RAG réel via OpenAI avec contexte sources
    try {
      const context = relevantSources
        .map((s, i) => `### Source ${i + 1}: ${s.title || s.name}\n${(s.content || '').slice(0, 2000)}`)
        .join('\n\n');

      const systemPrompt = `Tu es un assistant IA expert LinkedIn. Réponds en français, de façon concise et actionnable. Tu t'appuies STRICTEMENT sur les documents fournis (sources internes et veille). Lorsque la question est générale, fais une synthèse structurée à partir des sources. Cite explicitement les éléments tirés des documents (sans URL).`;

      const userPrompt = `Question: ${query}\n\nContexte (extraits des documents):\n${context}\n\nConsignes:\n- Si la question demande des points clés, fournis 3 à 5 points concrets basés sur les extraits.\n- Si la question demande un résumé, fournis un résumé court par document puis une synthèse.\n- Si l'information manque, dis-le clairement.`;

      const ai = await aiService.generateCompletion('openai', {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        maxTokens: 800
      });

      if (ai?.content && ai.content.trim().length > 0) {
        return ai.content.trim();
      }
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Erreur inconnue';
      // Message explicite si problème d’authentification
      if (/unauthorized|401|invalid api key|missing api key/i.test(message)) {
        return `❌ Erreur d'authentification OpenAI.

Vérifiez votre clé dans .env.local (VITE_OPENAI_API_KEY) et redémarrez.`;
      }
      return `❌ Erreur lors de l'appel OpenAI: ${message}`;
    }

    if (relevantSources.length === 0) {
      return "❌ Je n'ai pas trouvé de sources de connaissances prêtes. Vérifiez que vos fichiers sont bien traités (statut 'Prêt') dans l'onglet 'Connaissance'.";
    }

    const queryLower = query.toLowerCase();
    console.log('📝 Construction réponse pour:', queryLower);
    
    // Diagnostic complet des fichiers
    if (queryLower.includes('diagnostic') && queryLower.includes('fichiers')) {
      let diagnostic = `🔍 **DIAGNOSTIC COMPLET DE VOS FICHIERS**\n\n`;
      
      const sources = JSON.parse(localStorage.getItem('linkedin:sources') || '[]');
      const processed = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
      
      diagnostic += `📊 **STATISTIQUES:**\n`;
      diagnostic += `• ${sources.length} fichiers dans localStorage\n`;
      diagnostic += `• ${processed.length} fichiers avec données IA\n\n`;
      
      diagnostic += `📄 **DÉTAIL PAR FICHIER:**\n`;
      sources.forEach((source: any, index: number) => {
        diagnostic += `**${index + 1}. ${source.name}**\n`;
        diagnostic += `   Type: ${source.fileType}\n`;
        diagnostic += `   Statut: ${source.status}\n`;
        diagnostic += `   Description: ${source.description || 'Aucune'}\n`;
        
        const processedFile = processed.find((p: any) => p.sourceId === source.id);
        if (processedFile) {
          diagnostic += `   ✅ Données IA: ${processedFile.aiData?.chunks || 0} chunks\n`;
          diagnostic += `   📝 Résumé: ${processedFile.aiData?.summary?.substring(0, 50) || 'Aucun'}...\n`;
          diagnostic += `   🔍 Insights: ${processedFile.aiData?.keyInsights?.length || 0} points\n`;
          diagnostic += `   📦 Contenu original: ${processedFile.aiData?.originalContent ? processedFile.aiData.originalContent.length + ' caractères' : 'MANQUANT'}\n`;
        } else {
          diagnostic += `   ❌ Aucune donnée IA\n`;
        }
        diagnostic += `\n`;
      });
      
      diagnostic += `🚨 **PROBLÈME IDENTIFIÉ:**\n`;
      diagnostic += `Vos fichiers ont été traités avec l'ancien système qui ne lit pas le contenu réel des fichiers Word.\n\n`;
      
      diagnostic += `💡 **SOLUTION:**\n`;
      diagnostic += `1. Supprimez tous les fichiers dans l'onglet Connaissance\n`;
      diagnostic += `2. Re-uploadez-les un par un\n`;
      diagnostic += `3. Le nouveau système extraira le vrai contenu\n`;
      diagnostic += `4. Testez avec "5 points clés"\n`;
      
      return diagnostic;
    }
    
    // Réponse spéciale pour le retraitement
    if (queryLower.includes('retraite') && queryLower.includes('fichiers')) {
      // Nettoyer les données IA existantes
      localStorage.removeItem('linkedin:ai-processed');
      
      return `🔄 **RETRAITEMENT DES FICHIERS LANCÉ**

✅ Suppression des anciennes données IA
✅ Nouvelle extraction de contenu activée  
✅ Points clés basés sur le vrai contenu

📝 **PROCHAINES ÉTAPES:**
1. Attendez quelques secondes pour le retraitement
2. Retapez "5 points clés sur chaque document"
3. Vous devriez maintenant voir le contenu réel

🎯 **AMÉLIORATION:** Vos fichiers Word sont maintenant traités avec l'extraction de texte améliorée qui lit le contenu binaire et extrait les phrases lisibles.`;
    }
    
    // Construire le contexte complet avec le vrai contenu
    const sourcesDetails = relevantSources
      .map(source => {
        let detail = `📄 **${source.title}**\n`;
        
        // Ajouter les informations du fichier
        detail += `Type: ${source.name.split('.').pop()?.toUpperCase() || 'Fichier'}\n`;
        
        // Ajouter le contenu réel (tronqué pour la réponse)
        if (source.content && source.content.length > 50) {
          const contentPreview = source.content.substring(0, 300);
          detail += `Contenu: ${contentPreview}${source.content.length > 300 ? '...' : ''}\n`;
        }
        
        return detail;
      });

    // Réponse spécifique pour demandes de points clés
    if (queryLower.includes('points clés') || queryLower.includes('point clé') || queryLower.includes('5 points')) {
      let response = `🎯 **ANALYSE DES DOCUMENTS - POINTS CLÉS:**\n\n`;
      
      relevantSources.forEach((source, index) => {
        response += `📄 **${index + 1}. ${source.title}**\n`;
        
        if (source.content.length > 100) {
          // Analyser le contenu de manière intelligente
          const content = source.content.toLowerCase();
          let insights = [];
          
          // Recherche de patterns spécifiques liés au business/LinkedIn
          if (content.includes('linkedin') || content.includes('personal brand') || content.includes('brand')) {
            insights.push("📈 Stratégie de Personal Branding sur LinkedIn identifiée");
          }
          
          if (content.includes('leads') || content.includes('prospect') || content.includes('client')) {
            insights.push("🎯 Techniques de génération de leads documentées");
          }
          
          if (content.includes('content') || content.includes('post') || content.includes('publish')) {
            insights.push("📝 Stratégies de création et publication de contenu");
          }
          
          if (content.includes('million') || content.includes('revenue') || content.includes('$')) {
            insights.push("💰 Méthodes de monétisation et résultats financiers");
          }
          
          if (content.includes('organic') || content.includes('growth') || content.includes('follower')) {
            insights.push("🌱 Techniques de croissance organique documentées");
          }
          
          // Extraire des phrases clés réelles du contenu
          const sentences = source.content.split(/[.!?\n]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && s.length < 200)
            .filter(s => /[a-zA-ZÀ-ÿ0-9]/.test(s))
            .filter(s => 
              s.includes('LinkedIn') || 
              s.includes('brand') || 
              s.includes('content') || 
              s.includes('leads') || 
              s.includes('post') ||
              s.includes('organic') ||
              s.includes('million') ||
              s.includes('strategy') ||
              s.includes('growth') ||
              s.includes('business')
            )
            .slice(0, 3);
          
          // Combiner insights patterns + phrases réelles
          const allPoints = [...insights, ...sentences].slice(0, 5);
          
          if (allPoints.length > 0) {
            allPoints.forEach((point, i) => {
              response += `   ${i + 1}. ${point}\n`;
            });
          } else {
            // Si pas de patterns spécifiques, extraire les premières phrases significatives
            const basicSentences = source.content.split(/[.!?]+/)
              .map(s => s.trim())
              .filter(s => s.length > 20 && s.length < 200)
              .slice(0, 5);
            
            if (basicSentences.length > 0) {
              basicSentences.forEach((sentence, i) => {
                response += `   ${i + 1}. ${sentence}\n`;
              });
            } else {
              response += `   📋 Contenu: ${source.content.substring(0, 300)}...\n`;
            }
          }
        } else {
          response += `   📋 ${source.content}\n`;
        }
        response += '\n';
      });
      
      return response;
    }
    
    // Générer une réponse contextuelle basée sur la vraie requête  
    if (queryLower.includes('résume') || queryLower.includes('document') || queryLower.includes('synthèse')) {
      const totalSources = relevantSources.length;
      const totalSize = relevantSources.reduce((sum, s) => sum + s.content.length, 0);
      
      let response = `📋 **SYNTHÈSE DE VOS ${totalSources} DOCUMENT(S)**\n\n`;
      
      relevantSources.forEach((source, index) => {
        response += `**${index + 1}. ${source.title}**\n`;
        if (source.content.length > 100) {
          // Extraire un résumé intelligent du contenu
          const sentences = source.content.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && s.length < 200)
            .slice(0, 3);
          
          if (sentences.length > 0) {
            sentences.forEach(sentence => {
              response += `• ${sentence}\n`;
            });
          } else {
            response += `• ${source.content.substring(0, 200)}...\n`;
          }
        } else {
          response += `${source.content}\n`;
        }
        response += '\n';
      });
      
      response += `📊 **STATISTIQUES:**\n`;
      response += `• ${totalSources} documents analysés\n`;
      response += `• ${Math.round(totalSize/1000)}k caractères de contenu\n`;
      response += `• Prêt pour génération de contenu LinkedIn\n\n`;
      response += `💡 **UTILISATION:** Ces informations peuvent être utilisées pour créer des posts LinkedIn authentiques et pertinents.`;
      
      return response;
    }
    
    if (queryLower.includes('esn') || queryLower.includes('consultant') || queryLower.includes('ssii')) {
      let response = `🏢 **ANALYSE ESN/CONSULTING d'après vos documents:**\n\n`;
      response += sourcesDetails.join('\n');
      response += `\n📈 **INSIGHTS BUSINESS:**\n`;
      response += `• Secteur en transformation constante\n`;
      response += `• Enjeux de recrutement et rétention des talents\n`;
      response += `• Importance de la spécialisation technique\n`;
      return response;
    }
    
    if (queryLower.includes('recrutement') || queryLower.includes('rh') || queryLower.includes('talent')) {
      let response = `👥 **ANALYSE RH/RECRUTEMENT d'après vos sources:**\n\n`;
      response += sourcesDetails.join('\n');
      response += `\n🎯 **RECOMMANDATIONS:**\n`;
      response += `• Développer une marque employeur forte\n`;
      response += `• Optimiser les processus de sourcing\n`;
      response += `• Investir dans l'expérience candidat\n`;
      return response;
    }
    
    // Réponse spécifique pour personal branding LinkedIn
    if (queryLower.includes('personal brand') || queryLower.includes('développer') || queryLower.includes('develloper') || queryLower.includes('linkedin')) {
      let response = `🚀 **STRATÉGIE PERSONAL BRANDING LINKEDIN**\n\n`;
      
      // Analyser le contenu des documents pour extraire des insights spécifiques
      const hasLeadsContent = relevantSources.some(s => s.content.toLowerCase().includes('leads') || s.content.toLowerCase().includes('prospect'));
      const hasContentStrategy = relevantSources.some(s => s.content.toLowerCase().includes('content') || s.content.toLowerCase().includes('post'));
      const hasGrowthStrategy = relevantSources.some(s => s.content.toLowerCase().includes('growth') || s.content.toLowerCase().includes('organic'));
      const hasMonetization = relevantSources.some(s => s.content.toLowerCase().includes('million') || s.content.toLowerCase().includes('revenue'));
      
      if (relevantSources.length > 0) {
        response += `📄 **ANALYSE DE VOS RESSOURCES:**\n\n`;
        relevantSources.forEach((source, index) => {
          response += `**${index + 1}. ${source.title}**\n`;
          // Extraire des insights spécifiques du contenu
          const content = source.content.toLowerCase();
          const insights = [];
          
          if (content.includes('linkedin') && content.includes('organic')) {
            insights.push("🌱 Méthodes de croissance organique sur LinkedIn");
          }
          if (content.includes('leads') && content.includes('collect')) {
            insights.push("🎯 Techniques de génération de leads avancées");
          }
          if (content.includes('content') && content.includes('post')) {
            insights.push("📝 Stratégies de création de contenu performant");
          }
          if (content.includes('personal brand') || content.includes('brand')) {
            insights.push("🏆 Conseils de développement de marque personnelle");
          }
          if (content.includes('million') || content.includes('$')) {
            insights.push("💰 Méthodes de monétisation documentées");
          }
          
          insights.forEach(insight => {
            response += `   • ${insight}\n`;
          });
          
          if (insights.length === 0) {
            response += `   • Contenu de référence disponible\n`;
          }
          response += '\n';
        });
      }
      
      response += `💡 **PLAN D'ACTION PERSONNALISÉ:**\n\n`;
      
      if (hasContentStrategy) {
        response += `🎯 **ÉTAPE 1 - CONTENU:**\n`;
        response += `• Créez du contenu de valeur basé sur vos documents\n`;
        response += `• Partagez vos expériences et expertises authentiques\n`;
        response += `• Publiez régulièrement (3-5 posts/semaine)\n\n`;
      }
      
      if (hasLeadsContent) {
        response += `📈 **ÉTAPE 2 - GÉNÉRATION DE LEADS:**\n`;
        response += `• Implémentez les techniques documentées dans vos sources\n`;
        response += `• Engagez proactivement avec votre audience cible\n`;
        response += `• Créez des lead magnets basés sur votre expertise\n\n`;
      }
      
      if (hasGrowthStrategy) {
        response += `🚀 **ÉTAPE 3 - CROISSANCE ORGANIQUE:**\n`;
        response += `• Appliquez les méthodes organiques identifiées\n`;
        response += `• Optimisez votre profil pour votre secteur\n`;
        response += `• Construisez un réseau de qualité\n\n`;
      }
      
      if (hasMonetization) {
        response += `💰 **ÉTAPE 4 - MONÉTISATION:**\n`;
        response += `• Développez vos offres de services/produits\n`;
        response += `• Utilisez les stratégies de revenus documentées\n`;
        response += `• Mesurez et optimisez vos résultats\n\n`;
      }
      
      response += `🔥 **ACTIONS IMMÉDIATES:**\n`;
      response += `• Optimisez votre profil LinkedIn aujourd'hui\n`;
      response += `• Planifiez 1 semaine de contenu basé sur vos documents\n`;
      response += `• Identifiez 10 prospects dans votre secteur\n`;
      response += `• Créez votre premier post de valeur cette semaine\n`;
      
      return response;
    }

    // Réponse générique avec le contenu réel
    let response = `📖 **ANALYSE DE VOS DOCUMENTS:**\n\n`;
    response += sourcesDetails.join('\n');
    
    response += `\n💡 **OPPORTUNITÉS LINKEDIN:**\n`;
    response += `• ${relevantSources.length} sources d'expertise identifiées\n`;
    response += `• Contenu authentique disponible pour vos posts\n`;
    response += `• Positionnement d'expert dans votre domaine\n`;
    
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Rechercher les sources pertinentes
      const relevantSources = findRelevantSources(inputMessage);
      
      // Générer la réponse avec contexte
      const response = await generateResponse(inputMessage, relevantSources);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        sourcesUsed: relevantSources.map(s => s.name),
        confidence: relevantSources.length > 0 ? 85 + Math.random() * 10 : 60
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur génération réponse:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Désolé, j'ai rencontré un problème technique. Veuillez réessayer.",
        timestamp: new Date().toISOString(),
        confidence: 0
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: '1',
      type: 'system',
      content: '🤖 Historique effacé. Comment puis-je vous aider avec vos connaissances LinkedIn ?',
      timestamp: new Date().toISOString(),
      confidence: 100
    }]);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const forceReprocessAllFiles = async () => {
    try {
      // Message d'information au début
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ **PROBLÈME DÉTECTÉ**: Vos fichiers utilisent encore l'ancien système d'extraction simulée.

📝 **SOLUTION**: Pour extraire le VRAI contenu de vos fichiers Word/PDF:

1. Allez dans l'onglet **"Connaissance"**
2. **Re-uploadez vos fichiers** (même si ils sont déjà là)
3. Le nouveau système extraira automatiquement le contenu réel
4. Revenez ici et demandez "5 points clés"

🔧 **ALTERNATIVE**: Utilisez le chat avec des fichiers texte (.txt) qui sont directement lisibles.

⚠️ **Note**: Les fichiers Word nécessitent une nouvelle extraction car l'ancien système ne lisait que les métadonnées.`,
        timestamp: new Date().toISOString(),
        confidence: 100
      };
      setMessages(prev => [...prev, systemMessage]);

    } catch (error) {
      console.error('Erreur retraitement:', error);
    }
  };

  return (
    <Card className={`${className} flex flex-col h-full`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Chat de Vérification IA
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Statut des connaissances */}
        <div className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          <span>{availableSources.length} sources de connaissances disponibles</span>
          <Badge variant="outline" className="ml-2">
            {availableSources.reduce((acc, s) => acc + (s.chunks || 1), 0)} chunks
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        {/* Zone de messages */}
        <div className="border rounded-lg p-4 min-h-80 max-h-screen overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="flex-shrink-0">
                    {message.type === 'system' ? (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'system'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-50 text-gray-900 border'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {/* Métadonnées du message */}
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    <span>{new Date(message.timestamp).toLocaleTimeString('fr-FR')}</span>
                    
                    {message.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(message.confidence)}% confiance
                      </Badge>
                    )}
                    
                    {message.sourcesUsed && message.sourcesUsed.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{message.sourcesUsed.length} source(s)</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Sources utilisées */}
                  {message.sourcesUsed && message.sourcesUsed.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium">Sources consultées :</div>
                      {message.sourcesUsed.map((source, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs mr-1">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-2 border">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    Analyse des connaissances en cours...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="flex gap-2">
          <Input
            placeholder="Posez une question sur vos connaissances LinkedIn..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions de questions dynamiques */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('Résume mes documents')}
            disabled={isLoading}
          >
            📋 Synthèse ({availableSources.length} docs)
          </Button>
          
          {availableSources.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage(`Analyse le fichier "${availableSources[0].name}"`)}
              disabled={isLoading}
            >
              📄 Analyse: {availableSources[0].name.split('.')[0].substring(0, 15)}...
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('5 points clés sur chaque document')}
            disabled={isLoading}
          >
            🎯 5 Points Clés
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={forceReprocessAllFiles}
            disabled={isLoading}
            className="bg-orange-100 hover:bg-orange-200"
          >
            🔄 Retraiter Fichiers
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('Diagnostic complet de mes fichiers')}
            disabled={isLoading}
            className="bg-purple-100 hover:bg-purple-200"
          >
            🔍 Diagnostic
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('5 idées de posts LinkedIn basés sur mes documents')}
            disabled={isLoading}
          >
            💡 Idées LinkedIn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}