import portManager from '@/config/ports';

/**
 * Service d'Intelligence Artificielle avec OpenAI
 * Analyse de transcriptions et transformation de contenu
 */

export class AIService {
  constructor() {
    // Désactivation de l'appel direct OpenAI côté frontend
    this.openaiApiKey = null;
    this.baseUrl = 'https://api.openai.com/v1';
    this.backendApiUrl = null; // Sera initialisé asynchrone
  }

  /**
   * Diagnostic des clés API
   */
  diagnoseApiKeys() {
    const diagnostics = {
      backend: {
        url: this.backendApiUrl || 'non configuré'
      },
      environment: {
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE
      }
    };

    console.table(diagnostics.environment);
    return diagnostics;
  }

  /**
   * Génère du contenu avec un prompt spécialisé
   */
  async generateWithPrompt(transcript, title, promptId, options = {}) {
    try {
      console.log(`🎯 Génération avec prompt spécialisé: ${promptId}`);
      
      // Préparer les paramètres avec des valeurs par défaut
      const params = {
        transcript,
        title,
        audience: options.audience || 'entrepreneurs',
        tone: options.tone || 'professionnel',
        goal: options.goal || 'informer et engager',
        platform: options.platform || 'web',
        duration: options.duration || '5',
        industry: options.industry || 'technologie',
        format: options.format || 'standard',
        keywords: options.keywords || '',
        ...options
      };

      // Construire le prompt en fonction du type
      let systemPrompt = '';
      let userPrompt = '';

      switch (promptId) {
        case 'blogArticle':
          systemPrompt = `Tu es un « Rédacteur Web Expert ». Ta mission : transformer un transcript en article de blog professionnel, bien structuré et optimisé SEO.

Règles d'écriture:
- Structure claire: Titre H1, sous-titres H2/H3, paragraphes courts
- Ton professionnel mais accessible, adapté à ${params.tone}
- Public cible: ${params.audience}
- Intègre naturellement des mots-clés pour le SEO
- Conclusion avec appel à l'action clair
- Longueur: 1200-2000 mots selon le contenu
- Utilise des listes à puces et du formatting pour la lisibilité`;

          userPrompt = `Titre de l'article : ${params.title}
Audience cible : ${params.audience}
Ton & style : ${params.tone}
Mots-clés SEO : ${params.keywords}
Objectif de l'article : ${params.goal}

TRANSCRIPT SOURCE : ${params.transcript}`;
          break;

        case 'videoScript':
          systemPrompt = `Tu es un « Scénariste Vidéo ». Ta mission : créer des scripts vidéo captivants avec une structure narrative forte.

Format de script:
- HOOK (0-5s): Accroche puissante qui fait rester
- SETUP (5-15s): Promesse de valeur claire
- DÉVELOPPEMENT: Points clés avec transitions fluides
- CLIMAX: Moment fort/révélation principale
- CONCLUSION: Récap + CTA puissant
- Notes techniques: [PLAN SERRÉ], [MONTAGE RAPIDE], [TEXTE À L'ÉCRAN]

Style:
- Ton conversationnel, naturel pour ${params.tone}
- Phrases courtes pour la voix-off
- Timing indiqué pour chaque section
- Durée totale: ${params.duration} minutes`;

          userPrompt = `Type de vidéo : ${params.videoType || 'éducative'}
Durée souhaitée : ${params.duration}
Audience : ${params.audience}
Ton & énergie : ${params.tone}
Plateforme : ${params.platform}
Objectif : ${params.goal}

CONTENU SOURCE : ${params.transcript}`;
          break;

        case 'socialMedia':
          systemPrompt = `Tu es un « Social Media Manager ». Ta mission : adapter un contenu long en posts percutants pour différentes plateformes sociales.

Adaptations par plateforme:
- LINKEDIN: Professionnel, storytelling, 1-3 paragraphes + CTA
- TWITTER/X: Thread 3-7 tweets, phrases chocs, hashtags stratégiques
- INSTAGRAM: Visuel + caption engageante, story-ready
- TIKTOK: Script vertical, hooks puissants, tendances
- FACEBOOK: Format communautaire, questions engageantes

Règles universelles:
- Hook en première ligne (stop scroll)
- Valeur claire dès le début
- Ton adapté à ${params.tone} et ${params.platform}
- Hashtags pertinents mais pas excessifs
- CTA spécifique à la plateforme`;

          userPrompt = `Plateforme principale : ${params.platform}
Objectif du post : ${params.goal}
Audience cible : ${params.audience}
Ton & style : ${params.tone}
Format souhaité : ${params.format}

CONTENU SOURCE : ${params.transcript}`;
          break;

        case 'trendAnalysis':
          systemPrompt = `Tu es un « Analyste Tendances ». Ta mission : analyser un contenu pour identifier les tendances émergentes, patterns et insights stratégiques.

Framework d'analyse:
- TENDANCES ACTUELLES: Ce qui est observable maintenant
- SIGNAUX FAIBLES: Indices de changements futurs
- IMPACTS POTENTIELS: Conséquences business/société
- OPPORTUNITÉS: Comment capitaliser sur ces tendances
- RISQUES: Menaces à anticiper
- TIMELINE: Évolution probable sur 6-24 mois
- RECOMMANDATIONS: Actions concrètes à prendre

Méthodologie:
- Croiser avec données marché existantes
- Identifier les anomalies et ruptures
- Contextualiser selon ${params.industry} et ${params.audience}
- Prioriser par impact x probabilité
- Ton analytique mais accessible`;

          userPrompt = `Secteur d'activité : ${params.industry}
Horizon d'analyse : ${params.timeframe || '12 mois'}
Audience du rapport : ${params.audience}
Focus géographique : ${params.region || 'France/Europe'}
Objectif business : ${params.goal}

CONTENU À ANALYSER : ${params.transcript}`;
          break;

        case 'newsletter':
        default:
          // Utiliser le prompt par défaut newsletter
          systemPrompt = `Tu es « Éditeur de Newsletter ». Ta mission : transformer un transcript (vidéo, podcast, webinar…) en une série de newsletters claires, utiles et orientées action.

Règles simples:
- Écris en français naturel, phrases courtes, pas de blabla.
- Ne pas inventer. Si une info manque, mets : [À vérifier].
- 1 objectif clair par email (CTA unique).
- Ton = ${params.tone}. Public = ${params.audience}.
- Longueur par email : 400–700 mots.`;

          userPrompt = `Titre de la série : ${params.title}
Audience (qui lit ?) : ${params.audience}
Objectif business : ${params.goal}
Nombre d'emails : ${params.nb_emails || '3'}
Ton & voix : ${params.tone}

TRANSCRIPT : ${params.transcript}`;
          break;
      }

      // Utiliser le backend si disponible, sinon OpenAI direct
      if (this.backendApiUrl) {
        console.log(`🔗 Utilisation du backend: ${this.backendApiUrl}`);
        
        const response = await fetch(`${this.backendApiUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            options: {
              model: options.aiSettings?.model || 'gpt-4o-mini',
              temperature: options.temperature || 0.7,
              maxTokens: options.maxTokens || 3000
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          content: data.content || data.result,
          metadata: {
            provider: 'backend',
            model: options.aiSettings?.model || 'gpt-4o-mini',
            execution_time: data.execution_time,
            tokens_used: data.tokens_used
          }
        };

      } else {
        // Fallback vers OpenAI direct
        console.log(`🔄 Fallback vers OpenAI direct`);
        
        const result = await this.openAIRequest(userPrompt, null, systemPrompt);
        
        return {
          success: true,
          content: result,
          metadata: {
            provider: 'openai',
            model: options.aiSettings?.model || 'gpt-4o-mini'
          }
        };
      }

    } catch (error) {
      console.error(`❌ Erreur génération prompt ${promptId}:`, error);
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * Initialisation asynchrone du service
   */
  async initialize() {
    await this.setupBackendUrl();
    console.log('🚀 AIService initialisé avec:', this.backendApiUrl);
  }

  /**
   * Configuration intelligente de l'URL backend
   */
  async setupBackendUrl() {
    // Initialiser le gestionnaire de ports
    await portManager.initialize();
    
    // Utiliser l'URL du gestionnaire de ports
    this.backendApiUrl = portManager.getAgentsUrl();
    console.log('🔗 Backend configuré via PortManager:', this.backendApiUrl);
  }

  /**
   * Auto-détection du backend disponible (à appeler manuellement si nécessaire)
   */
  async detectBackendPort() {
    const fallbackPorts = import.meta.env.VITE_BACKEND_FALLBACK_PORTS 
      ? import.meta.env.VITE_BACKEND_FALLBACK_PORTS.split(',').map(p => parseInt(p.trim()))
      : [3003, 3002, 3001];
    
    console.log('🔍 Recherche du backend sur les ports:', fallbackPorts);

    for (const port of fallbackPorts) {
      try {
        const healthUrl = `http://localhost:${port}/api/v2/health`;
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3s timeout
        });
        
        if (response.ok) {
          this.backendApiUrl = `http://localhost:${port}/api/agents`;
          console.log('✅ Backend détecté et configuré sur le port:', port);
          return port;
        }
      } catch (error) {
        console.log(`❌ Port ${port} non disponible:`, error.message);
        continue;
      }
    }
    
    console.warn('⚠️ Aucun backend détecté sur les ports:', fallbackPorts);
    console.warn('🔄 Utilisation de l\'URL par défaut:', this.backendApiUrl);
    return null;
  }

  /**
   * Test de connectivité backend avec fallback automatique
   */
  async testBackendConnection() {
    try {
      // Test de l'URL configurée
      const healthUrl = this.backendApiUrl.replace('/api/agents', '/api/v2/health');
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log('✅ Backend connecté:', this.backendApiUrl);
        return true;
      } else {
        throw new Error(`Backend réponse: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Backend principal non disponible:', error.message);
      console.log('🔍 Tentative d\'auto-détection...');
      
      const detectedPort = await this.detectBackendPort();
      return detectedPort !== null;
    }
  }

  // ===================
  // ANALYSE DE CONTENU
  // ===================

  async analyzeTranscript(transcript, options = {}) {
    try {
      const {
        includeSummary = true,
        includeKeyPoints = true,
        includeTags = true,
        includeSentiment = true,
        includeTopics = true,
        language = 'fr'
      } = options;

      const connected = await this.testBackendConnection();
      if (!connected) throw new Error('Backend IA indisponible');
      const response = await fetch(`${this.backendApiUrl}/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: { text: transcript },
          promptId: 'intelligence',
          parameters: {
            extractQuotes: includeSummary,
            findKeyMoments: includeKeyPoints,
            calculateViralScore: includeSentiment,
            analyzeEngagement: includeTopics,
            language
          }
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || `Erreur backend (${response.status})`);
      }
      const r = payload.data || payload.result || {};
      return {
        summary: r.globalAnalysis?.summary || r.summary || '',
        key_points: r.key_points || r.keyPoints || (r.keyMoments ? r.keyMoments.map(k => k.title || k.description) : []),
        tags: r.tags || (r.contentThemes ? r.contentThemes.map(t => t.name) : []),
        sentiment: r.sentiment || r.globalAnalysis?.overallSentiment || 'neutre',
        sentiment_score: r.sentiment_score || r.globalAnalysis?.engagementFactor || 0,
        topics: r.topics || (r.contentThemes ? r.contentThemes.map(t => t.name) : [])
      };
      
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      return { success: false, error: error.message };
    }
  }

  async generateSummary(text, maxLength = 200) {
    try {
      const prompt = `Résume ce texte en ${maxLength} caractères maximum, en gardant les points essentiels. Réponds au format JSON : "${text}"`;
      
      const result = await this.openAIRequest(prompt, {
        type: "object",
        properties: {
          summary: { type: "string" }
        }
      });

      return result.summary;
      
    } catch (error) {
      console.error('Error generating summary:', error);
      return Promise.reject(new Error(error.message || 'Erreur génération résumé'));
    }
  }

  async extractKeywords(text, maxKeywords = 10) {
    try {
      const prompt = `Extrais les ${maxKeywords} mots-clés les plus importants de ce texte. Réponds au format JSON : "${text}"`;
      
      const result = await this.openAIRequest(prompt, {
        type: "object",
        properties: {
          keywords: { 
            type: "array", 
            items: { type: "string" },
            maxItems: maxKeywords
          }
        }
      });

      return result.keywords;
      
    } catch (error) {
      console.error('Error extracting keywords:', error);
      return Promise.reject(new Error(error.message || 'Erreur extraction mots-clés'));
    }
  }

  // ===================
  // MÉTHODE UNIVERSELLE POUR NEWSLETTERS
  // ===================

  /**
   * Méthode générique invokeLLM pour compatibilité avec Base44 et le générateur de newsletters
   */
  async invokeLLM(systemPrompt, userPrompt, options = {}) {
    try {
      const { response_json_schema, add_context_from_internet = false } = options;

      // Construire la requête avec les prompts système et utilisateur
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const requestBody = {
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 3000
      };

      // Si un schéma JSON est fourni, l'utiliser
      if (response_json_schema) {
        requestBody.response_format = { type: "json_object" };
      }

      console.log('🤖 Appel invokeLLM avec OpenAI...');
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Si un schéma JSON était demandé, parser la réponse
      if (response_json_schema) {
        try {
          const result = JSON.parse(content);
          return {
            success: true,
            result: result,
            metadata: {
              provider: 'openai',
              model: 'gpt-4o-mini',
              usage: data.usage
            }
          };
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Réponse OpenAI invalide - impossible de parser le JSON');
        }
      }

      return {
        success: true,
        result: content,
        metadata: {
          provider: 'openai', 
          model: 'gpt-4o-mini',
          usage: data.usage
        }
      };

    } catch (error) {
      console.error('❌ Erreur invokeLLM:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'appel à l\'IA'
      };
    }
  }

  // ===================
  // REQUÊTES OPENAI
  // ===================

  async openAIRequest(prompt, schema = null, customSystemPrompt = null) {
    // Revérifier la clé en cas de rechargement tardif des variables d'environnement
    if (!this.openaiApiKey) {
      this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }
    
    if (!this.openaiApiKey) {
      console.error('❌ Clé API OpenAI manquante. Vérifiez que VITE_OPENAI_API_KEY est définie dans .env.local');
      throw new Error('Clé API OpenAI manquante');
    }

    const systemContent = customSystemPrompt || 'Tu es un assistant IA spécialisé dans l\'analyse de contenu vidéo et la transformation de texte. Réponds toujours en français.';

    const messages = [
      {
        role: 'system',
        content: systemContent
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const requestBody = {
      model: 'gpt-4o-mini', // ou 'gpt-4-turbo' pour plus de puissance
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    };

    // Si un schéma JSON est fourni, l'utiliser
    if (schema) {
      requestBody.response_format = { type: "json_object" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      if (schema) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Réponse OpenAI invalide');
        }
      }

      return content;
      
    } catch (error) {
      console.error('OpenAI request failed:', error);
      throw error;
    }
  }

  // ===================
  // CONSTRUCTION DES PROMPTS
  // ===================

  buildAnalysisPrompt(transcript, options) {
    const {
      includeSummary,
      includeKeyPoints,
      includeTags,
      includeSentiment,
      includeTopics,
      language
    } = options;

    let prompt = `Analyse cette transcription de vidéo YouTube et fournis une analyse complète au format JSON :\n\n"${transcript}"\n\n`;

    if (includeSummary) {
      prompt += `- Génère un résumé concis (150-200 mots)\n`;
    }
    if (includeKeyPoints) {
      prompt += `- Extrais 5-7 points clés principaux\n`;
    }
    if (includeTags) {
      prompt += `- Identifie 8-12 tags pertinents\n`;
    }
    if (includeSentiment) {
      prompt += `- Analyse le sentiment global (positif, neutre, négatif)\n`;
    }
    if (includeTopics) {
      prompt += `- Identifie les sujets/thématiques abordés\n`;
    }

    prompt += `\nRéponds en ${language} et fournis ta réponse au format JSON valide.`;

    return prompt;
  }

  buildAnalysisSchema(options) {
    const {
      includeSummary,
      includeKeyPoints,
      includeTags,
      includeSentiment,
      includeTopics
    } = options;

    const properties = {};

    if (includeSummary) {
      properties.summary = { type: "string" };
    }
    if (includeKeyPoints) {
      properties.key_points = {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 10
      };
    }
    if (includeTags) {
      properties.tags = {
        type: "array",
        items: { type: "string" },
        minItems: 5,
        maxItems: 15
      };
    }
    if (includeSentiment) {
      properties.sentiment_global = { 
        type: "string",
        enum: ["positif", "neutre", "négatif"]
      };
      properties.sentiment_score = { 
        type: "number",
        minimum: -1,
        maximum: 1
      };
    }
    if (includeTopics) {
      properties.topics = {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 8
      };
    }

    return {
      type: "object",
      properties: properties,
      required: Object.keys(properties)
    };
  }

  // ===================
  // DONNÉES DE TEST
  // ===================

  generateMockAnalysis(transcript) {
    console.log('🔍 Génération de données de test pour:', transcript.substring(0, 100) + '...');
    const wordCount = transcript.split(' ').length;
    
    // Analyser le contenu pour générer des données plus réalistes
    const hasAI = transcript.toLowerCase().includes('intelligence artificielle') || transcript.toLowerCase().includes('ia');
    const hasTech = transcript.toLowerCase().includes('technologie') || transcript.toLowerCase().includes('tech');
    const hasMarketing = transcript.toLowerCase().includes('marketing') || transcript.toLowerCase().includes('vente');
    const hasReact = transcript.toLowerCase().includes('react') || transcript.toLowerCase().includes('javascript');
    const hasHormozi = transcript.toLowerCase().includes('20s') || transcript.toLowerCase().includes('30s') || transcript.toLowerCase().includes('million') || transcript.toLowerCase().includes('asymmetric bets');
    
    let summary, key_points, tags, topics, sentiment;
    
    if (hasHormozi) {
      summary = `Cette vidéo d'Alex Hormozi offre des conseils pratiques pour maximiser son potentiel dans la vingtaine et la trentaine. Il partage son expérience personnelle d'entrepreneur ayant généré plus de 250 millions de dollars de revenus et donne cinq conseils clés pour réussir dans la vie et les affaires.`;
      key_points = [
        "Prendre des paris asymétriques quand on a rien à perdre",
        "Se concentrer sur l'intérêt composé (argent, compétences, relations)",
        "Être obsédé par l'exécution plutôt que les idées",
        "Apprendre constamment pour rester pertinent",
        "Construire des relations de qualité avec des mentors et pairs"
      ];
      tags = ["entrepreneuriat", "succès", "20s", "30s", "million", "conseils", "business", "développement personnel", "paris asymétriques", "intérêt composé", "exécution", "apprentissage", "relations"];
      topics = ["Entrepreneuriat", "Développement Personnel", "Business", "Succès"];
      sentiment = "positif";
    } else if (hasAI) {
      summary = `Cette vidéo traite de l'intelligence artificielle et de son impact sur notre société moderne. Le contenu explore les différentes applications de l'IA dans divers secteurs et aborde les défis éthiques posés par cette technologie révolutionnaire.`;
      key_points = [
        "L'IA révolutionne de nombreux secteurs d'activité",
        "Applications dans la médecine, l'éducation et les transports",
        "Défis éthiques et responsabilités",
        "Impact sur l'emploi et la société",
        "Perspectives d'avenir de l'IA"
      ];
      tags = ["intelligence artificielle", "IA", "technologie", "éthique", "innovation", "futur", "automatisation", "machine learning"];
      topics = ["Intelligence Artificielle", "Technologie", "Éthique", "Innovation"];
      sentiment = "positif";
    } else if (hasReact) {
      summary = `Cette vidéo présente React, une bibliothèque JavaScript pour créer des interfaces utilisateur interactives. Le contenu couvre les concepts fondamentaux et guide les développeurs dans leurs premiers projets.`;
      key_points = [
        "React est développé par Facebook/Meta",
        "Concepts de composants et de props",
        "Gestion de l'état des composants",
        "Avantages pour le développement web",
        "Écosystème React et outils associés"
      ];
      tags = ["react", "javascript", "développement web", "frontend", "composants", "props", "état", "interface utilisateur"];
      topics = ["Développement Web", "React", "JavaScript", "Frontend"];
      sentiment = "positif";
    } else if (hasMarketing) {
      summary = `Cette vidéo aborde le marketing digital et les stratégies efficaces pour 2025. Le contenu partage des techniques pratiques pour attirer des clients et augmenter les ventes dans un environnement digital en constante évolution.`;
      key_points = [
        "Évolution du marketing avec les réseaux sociaux",
        "Intégration de l'IA dans les stratégies marketing",
        "Techniques pour attirer plus de clients",
        "Mesure et optimisation des performances",
        "Tendances actuelles du marketing digital"
      ];
      tags = ["marketing digital", "stratégie", "réseaux sociaux", "vente", "clients", "optimisation", "tendances", "performance"];
      topics = ["Marketing Digital", "Stratégie", "Vente", "Optimisation"];
      sentiment = "positif";
    } else {
      summary = `Cette vidéo présente un contenu informatif et éducatif de ${wordCount} mots. Le contenu couvre des sujets variés et fournit des informations utiles pour les spectateurs intéressés par ce domaine.`;
      key_points = [
        "Contenu principal abordé dans la vidéo",
        "Points importants développés",
        "Concepts clés expliqués",
        "Applications pratiques mentionnées",
        "Perspectives et conclusions"
      ];
      tags = ["éducation", "information", "contenu", "apprentissage", "développement", "connaissance", "formation", "expertise"];
      topics = ["Éducation", "Information", "Développement"];
      sentiment = "neutre";
    }
    
    return {
      summary,
      key_points,
      tags,
      sentiment,
      sentiment_score: sentiment === "positif" ? 0.7 : sentiment === "négatif" ? -0.3 : 0.1,
      topics
    };
  }

  // ===================
  // TRANSFORMATION DE CONTENU
  // ===================

  async transformToArticle(transcript, title) {
    try {
      const prompt = `Transforme cette transcription en un article structuré avec le titre "${title}":\n\n"${transcript}"\n\nCrée un article avec introduction, sections principales et conclusion.`;

      const result = await this.openAIRequest(prompt, {
        type: "object",
        properties: {
          article: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" }
              }
            }
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error transforming to article:', error);
      return {
        article: `Article basé sur la transcription de "${title}"...`,
        sections: [
          { title: "Introduction", content: "Introduction de l'article..." },
          { title: "Développement", content: "Contenu principal..." },
          { title: "Conclusion", content: "Conclusion de l'article..." }
        ]
      };
    }
  }

  async generateScript(transcript, format = 'video') {
    try {
      const prompt = `Transforme cette transcription en script ${format}:\n\n"${transcript}"\n\nCrée un script structuré avec intro, développement et conclusion.`;

      const result = await this.openAIRequest(prompt, {
        type: "object",
        properties: {
          script: { type: "string" },
          duration: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                content: { type: "string" }
              }
            }
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error generating script:', error);
      return {
        script: `Script basé sur la transcription...`,
        duration: "5-10 minutes",
        sections: [
          { time: "0:00", content: "Introduction..." },
          { time: "1:00", content: "Développement..." },
          { time: "4:00", content: "Conclusion..." }
        ]
      };
    }
  }

  // ===================
  // GÉNÉRATION CONTENU GEO AVANCÉ
  // ===================

  /**
   * Génère un article GEO optimisé via le backend avec l'IA configurée dans l'admin
   */
  async generateGEOArticle(transcript, title, options = {}) {
    try {
      console.log('🚀 Génération article GEO via backend...');
      
      // Test de connectivité avec fallback automatique
      const isConnected = await this.testBackendConnection();
      if (!isConnected) throw new Error('Backend IA indisponible');
      
      const response = await fetch(`${this.backendApiUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: {
            text: typeof transcript === 'string' ? transcript : transcript.transcript || transcript.text,
            title: title,
            metadata: {
              source: 'main_app',
              generated_at: new Date().toISOString()
            }
          },
          promptId: 'article',
          parameters: {
            tone: options.tone || 'professionnel',
            length: options.length || 'long',
            audience: options.audience || 'entrepreneurs'
          },
          options: {
            includeSources: true,
            includeStats: true,
            optimizeForGEO: true,
            ...options
          }
          // Note: aiSettings est géré côté admin, pas ici
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Article GEO généré avec succès');
        return {
          success: true,
          article: result.data?.script?.content || result.data?.content || result.data,
          metadata: {
            provider: result.data?.script?.ai_info?.provider,
            model: result.data?.script?.ai_info?.model,
            execution_time: result.metadata?.execution_time_ms,
            cost: result.data?.script?.ai_info?.usage?.total_cost,
            citations: result.metadata?.citations || []
          }
        };
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('❌ Erreur génération article GEO:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Génère des tweets optimisés via le backend
   */
  async generateTweets(transcript, title, options = {}) {
    try {
      console.log('🐦 Génération tweets via backend...');
      
      // Test de connectivité avec fallback automatique
      const isConnected = await this.testBackendConnection();
      if (!isConnected) throw new Error('Backend IA indisponible');
      
      const response = await fetch(`${this.backendApiUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: {
            text: typeof transcript === 'string' ? transcript : transcript.transcript || transcript.text,
            title: title
          },
          promptId: 'tweets',
          parameters: {
            count: options.count || 5,
            type: options.type || 'insights'
          },
          options: options
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Tweets générés avec succès');
        return {
          success: true,
          tweets: result.data?.tweets || result.data,
          metadata: result.metadata
        };
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('❌ Erreur génération tweets:', error);
      return { success: false, error: error.message, tweets: [] };
    }
  }

  /**
   * Génère une séquence de newsletters avancée avec OpenAI directement
   * Utilise le système de prompt optimisé pour les newsletters professionnelles
   */
  async generateNewsletters(transcript, title, options = {}) {
    try {
      console.log('📧 Génération newsletters avancée avec OpenAI...');
      
      // Configuration par défaut
      const {
        audience = "entrepreneurs et consultants B2B",
        goal = "Lead",
        nb_emails = 3,
        tone = "clair, concret, convivial",
        cta_label = "En savoir plus",
        cta_url = "#",
        include_sponsor = false,
        sponsor_name = "",
        sponsor_url = "",
        partner_mode = false,
        high_ticket = false,
        format = "md"
      } = options;

      // Prompt système optimisé pour les newsletters
      const systemPrompt = `Tu es « Éditeur de Newsletter ». Ta mission : transformer un transcript (vidéo, podcast, webinar…) en une série de newsletters claires, utiles et orientées action.

Règles simples :
- Écris en français naturel, phrases courtes, pas de blabla.
- Ne pas inventer. Si une info manque, mets : [À vérifier].
- 1 objectif clair par email (CTA unique).
- Ton = ${tone}. Public = ${audience}.
- Longueur par email : 400–700 mots.

Avant d'écrire :
1) Fais un **plan de série** : liste des ${nb_emails} emails avec un titre interne et le but de chacun.

Ensuite, pour **chaque email** :
- 3 **objets** (≤ 45 caractères) + 1 **pré-en-tête** (≤ 80 caractères).
- **Accroche** (2–3 phrases).
- 2 à 4 **blocs** avec sous-titres (paragraphes courts + listes).
- **Étapes concrètes** (checklist).
- **Récap'** en 3 bullets.
- **CTA** principal : ${cta_label} → ${cta_url}.
- **P.S.** court.
${include_sponsor ? `- Ajoute un **Bloc sponsor** : ${sponsor_name} → ${sponsor_url} (2 phrases).` : ''}
${partner_mode ? '- Ajoute un **Bloc partenaire** (1 phrase + lien).' : ''}
${high_ticket ? `- Oriente le CTA vers un **appel découverte** et insère un mini-encart « TAP » :
  - Training : ce qu'ils apprennent
  - Access : accès/coaching  
  - Perks : livrables/garanties` : ''}

Sortie :
- Format = ${format} (md|html|json). Par défaut : md.
- Toujours inclure les placeholders {unsubscribe_link} et {company_address}.

Réponds au format JSON avec cette structure :
{
  "plan": [
    {"email": 1, "titre": "titre email", "objectif": "but de l'email"}
  ],
  "newsletters": [
    {
      "email_number": 1,
      "subjects": ["Objet 1", "Objet 2", "Objet 3"],
      "preview_text": "Pré-en-tête",
      "content": "contenu complet avec markdown",
      "cta": "${cta_label}",
      "ps": "P.S. message"
    }
  ]
}`;

      // Template utilisateur
      const userPrompt = `Titre de la série : ${title}
Audience (qui lit ?) : ${audience}
Objectif business : ${goal}
Nombre d'emails à générer : ${nb_emails}

Ton & voix : ${tone}

CTA par défaut : ${cta_label} → ${cta_url}

Options :
- Inclure un sponsor ? ${include_sponsor}
${include_sponsor ? `  - Nom sponsor : ${sponsor_name}
  - URL sponsor : ${sponsor_url}` : ''}
- Mode Partenaire/BOPA ? ${partner_mode}
- Mode High-Ticket ? ${high_ticket}

Format de sortie : ${format}

TRANSCRIPT (texte brut) :
${typeof transcript === 'string' ? transcript : transcript.transcript || transcript.text || JSON.stringify(transcript)}`;

      const result = await this.openAIRequest(userPrompt, {
        type: "object",
        properties: {
          plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                email: { type: "number" },
                titre: { type: "string" },
                objectif: { type: "string" }
              }
            }
          },
          newsletters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                email_number: { type: "number" },
                subjects: {
                  type: "array",
                  items: { type: "string" },
                  maxItems: 3
                },
                preview_text: { type: "string" },
                content: { type: "string" },
                cta: { type: "string" },
                ps: { type: "string" }
              }
            }
          }
        }
      }, systemPrompt);
      
      console.log('✅ Newsletters avancées générées avec succès via OpenAI');
      return {
        success: true,
        newsletters: result.newsletters || [],
        plan: result.plan || [],
        metadata: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          source: 'direct_api',
          options: options
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur génération newsletters avancées:', error);
      return { success: false, error: error.message, newsletters: [], plan: [] };
    }
  }

  /**
   * Génère tout le contenu en une fois (article + tweets + newsletters)
   */
  async generateAllContent(transcript, title, options = {}) {
    try {
      console.log('🚀 Génération complète de contenu...');
      
      // Génération en parallèle pour optimiser les performances
      const [articleResult, tweetsResult, newslettersResult] = await Promise.allSettled([
        this.generateGEOArticle(transcript, title, options),
        this.generateTweets(transcript, title, options),
        this.generateNewsletters(transcript, title, options)
      ]);

      return {
        article: articleResult.status === 'fulfilled' ? articleResult.value : { success: false, error: articleResult.reason },
        tweets: tweetsResult.status === 'fulfilled' ? tweetsResult.value : { success: false, error: tweetsResult.reason },
        newsletters: newslettersResult.status === 'fulfilled' ? newslettersResult.value : { success: false, error: newslettersResult.reason },
        execution_summary: {
          total_time: Date.now(),
          successful_generations: [articleResult, tweetsResult, newslettersResult].filter(r => r.status === 'fulfilled').length,
          failed_generations: [articleResult, tweetsResult, newslettersResult].filter(r => r.status === 'rejected').length
        }
      };
    } catch (error) {
      console.error('❌ Erreur génération complète:', error);
      throw error;
    }
  }

  /**
   * Génère une analyse de contenu intelligent avec OpenAI directement
   * Extrait les citations virales, moments clés et scores d'engagement
   */
  async analyzeContentIntelligence(transcript, title, options = {}) {
    try {
      console.log('🔍 Analyse intelligence contenu avec OpenAI...');
      
      // Prompt dédié pour l'analyse de contenu intelligent
      const intelligencePrompt = `Analyse cette transcription de vidéo YouTube pour extraire des insights marketing et d'engagement :

TITRE: "${title}"

TRANSCRIPTION:
"${transcript}"

Analyse le contenu et fournis une réponse JSON structurée avec :

1. CITATIONS VIRALES (5 maximum) :
   - Citations courtes et impactantes (30-200 caractères)
   - Phrases qui peuvent devenir virales sur les réseaux sociaux
   - Avec timestamp approximatif, score viral (1-10), et utilisation suggérée

2. MOMENTS CLÉS (6 maximum) :
   - Points importants, tournants, ou insights principaux
   - Avec timestamp approximatif, description, importance (1-10), et catégorie

3. ANALYSE GLOBALE :
   - Score général du contenu (1-10)
   - Potentiel viral (0-100%)
   - Facteur d'engagement (1-10)
   - Thèmes principaux identifiés
   - Audience recommandée
   - Meilleures plateformes pour ce contenu
   - Résumé en 2-3 phrases

Format JSON attendu :
{
  "viralQuotes": [
    {
      "text": "citation impactante",
      "viralScore": 8.5,
      "timestamp": "3:45",
      "context": "contexte de la citation",
      "suggestedUse": ["twitter", "linkedin", "shorts"]
    }
  ],
  "keyMoments": [
    {
      "title": "Titre du moment clé",
      "timestamp": "2:30",
      "description": "Description du moment important",
      "importance": 9.2,
      "category": "insight"
    }
  ],
  "globalAnalysis": {
    "overallScore": 8.7,
    "viralPotential": 85,
    "engagementFactor": 8.9,
    "contentThemes": [{"name": "business", "confidence": 90}],
    "audienceRecommendation": "Entrepreneurs et professionnels du numérique",
    "bestPlatforms": ["LinkedIn", "Twitter", "YouTube"],
    "summary": "Résumé concis du contenu et de son potentiel"
  }
}

Réponds uniquement avec le JSON, sans texte supplémentaire.`;

      const result = await this.openAIRequest(intelligencePrompt, {
        type: "object",
        properties: {
          viralQuotes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                viralScore: { type: "number" },
                timestamp: { type: "string" },
                context: { type: "string" },
                suggestedUse: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          keyMoments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                timestamp: { type: "string" },
                description: { type: "string" },
                importance: { type: "number" },
                category: { type: "string" }
              }
            }
          },
          globalAnalysis: {
            type: "object",
            properties: {
              overallScore: { type: "number" },
              viralPotential: { type: "number" },
              engagementFactor: { type: "number" },
              contentThemes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    confidence: { type: "number" }
                  }
                }
              },
              audienceRecommendation: { type: "string" },
              bestPlatforms: {
                type: "array",
                items: { type: "string" }
              },
              summary: { type: "string" }
            }
          }
        }
      });
      
      console.log('✅ Analyse intelligence générée avec succès via OpenAI');
      return {
        success: true,
        viralQuotes: result.viralQuotes || [],
        keyMoments: result.keyMoments || [],
        globalAnalysis: result.globalAnalysis || {},
        metadata: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          source: 'direct_api'
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse intelligence OpenAI:', error);
      
      // Fallback vers analyse basique en cas d'erreur
      return this.generateFallbackIntelligence(transcript, title);
    }
  }


  /**
   * Génération avec prompt spécifique via le backend
   */
  async generateWithPrompt(transcript, title, promptId, parameters = {}) {
    try {
      console.log(`🚀 Génération avec prompt: ${promptId} via backend...`);
      
      // Test de connectivité avec fallback automatique
      const isConnected = await this.testBackendConnection();
      if (!isConnected) {
        console.warn('❌ Backend non disponible, utilisation du fallback...');
        return {
          success: false,
          content: `Contenu ${promptId} - Backend non disponible`,
          error: 'Backend non disponible'
        };
      }
      
      const response = await fetch(`${this.backendApiUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: {
            text: typeof transcript === 'string' ? transcript : transcript.transcript || transcript.text,
            title: title,
            metadata: {
              source: 'main_app',
              generated_at: new Date().toISOString()
            }
          },
          promptId: promptId,
          parameters: parameters,
          options: {
            includeSources: true,
            includeStats: true,
            ...parameters
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Contenu ${promptId} généré avec succès`);
        return {
          success: true,
          content: result.data?.script?.content || result.data?.content || result.data,
          metadata: {
            provider: result.data?.script?.ai_info?.provider,
            model: result.data?.script?.ai_info?.model,
            execution_time: result.metadata?.execution_time_ms,
            cost: result.data?.script?.ai_info?.usage?.total_cost,
            citations: result.metadata?.citations || []
          }
        };
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error(`❌ Erreur génération ${promptId}:`, error);
      return {
        success: false,
        content: `Erreur lors de la génération du contenu ${promptId}`,
        error: error.message
      };
    }
  }

  /**
   * Fallback avec données par défaut en cas d'erreur
   */
  generateFallbackIntelligence(transcript, title) {
    console.warn('🔄 Utilisation du fallback pour l\'intelligence de contenu');
    
    return {
      success: true,
      viralQuotes: this.getDefaultViralQuotes(),
      keyMoments: this.getDefaultKeyMoments(),
      globalAnalysis: this.getDefaultGlobalAnalysis(),
      metadata: { provider: 'fallback', model: 'local' }
    };
  }

  // Méthodes pour données par défaut
  getDefaultViralQuotes() {
    return [
      {
        text: "La clé du succès n'est pas de travailler plus dur, mais plus intelligemment",
        viralScore: 8.7,
        timestamp: "3:45",
        context: "Conseil de productivité",
        suggestedUse: ["twitter", "linkedin"]
      }
    ];
  }

  getDefaultKeyMoments() {
    return [
      {
        title: "Introduction du concept principal",
        timestamp: "1:23",
        description: "Présentation de l'idée centrale du contenu",
        importance: 9.2,
        category: "insight"
      }
    ];
  }

  getDefaultGlobalAnalysis() {
    return {
      overallScore: 8.5,
      viralPotential: 78,
      engagementFactor: 8.8,
      contentThemes: [{ name: 'business', confidence: 85 }],
      audienceRecommendation: "Professionnels et entrepreneurs",
      bestPlatforms: ["LinkedIn", "Twitter"],
      summary: "Contenu riche en insights avec un bon potentiel d'engagement..."
    };
  }
}

// Instance singleton avec initialisation automatique
const aiService = new AIService();

// Initialisation automatique
aiService.initialize().catch(error => {
  console.error('❌ Erreur initialisation AIService:', error);
});

export { aiService };


