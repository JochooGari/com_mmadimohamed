/**
 * Service d'IA unifié supportant plusieurs providers
 * @version 1.0.0
 */

require('dotenv').config();

class AIService {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI GPT',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions'
      },
      perplexity: {
        name: 'Perplexity',
        models: ['sonar', 'sonar-pro'],
        apiKey: process.env.PERPLEXITY_API_KEY,
        endpoint: 'https://api.perplexity.ai/chat/completions'
      },
      claude: {
        name: 'Claude (Anthropic)',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        apiKey: process.env.CLAUDE_API_KEY,
        endpoint: 'https://api.anthropic.com/v1/messages'
      },
      gemini: {
        name: 'Google Gemini',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
        apiKey: process.env.GEMINI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
      }
    };
  }

  /**
   * Obtenir la liste des providers disponibles
   */
  getAvailableProviders() {
    return Object.keys(this.providers).map(key => ({
      id: key,
      name: this.providers[key].name,
      models: this.providers[key].models,
      available: !!this.providers[key].apiKey && this.providers[key].apiKey !== 'your_' + key + '_api_key_here'
    }));
  }

  /**
   * Générer du contenu avec l'IA spécifiée
   */
  async generateContent(prompt, options = {}) {
    const {
      provider = 'perplexity',
      model = null,
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt = null
    } = options;

    if (!this.providers[provider]) {
      throw new Error(`Provider '${provider}' non supporté`);
    }

    const providerConfig = this.providers[provider];
    if (!providerConfig.apiKey || providerConfig.apiKey.startsWith('your_')) {
      throw new Error(`Clé API manquante pour ${providerConfig.name}`);
    }

    const selectedModel = model || providerConfig.models[0];

    try {
      console.log(`🤖 Génération avec ${providerConfig.name} (${selectedModel})`);
      
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, selectedModel, providerConfig, {
            temperature, maxTokens, systemPrompt
          });
        
        case 'perplexity':
          return await this.generateWithPerplexity(prompt, selectedModel, providerConfig, {
            temperature, maxTokens, systemPrompt
          });
        
        case 'claude':
          return await this.generateWithClaude(prompt, selectedModel, providerConfig, {
            temperature, maxTokens, systemPrompt
          });
        
        case 'gemini':
          return await this.generateWithGemini(prompt, selectedModel, providerConfig, {
            temperature, maxTokens, systemPrompt
          });
        
        default:
          throw new Error(`Provider '${provider}' non implémenté`);
      }
    } catch (error) {
      console.error(`❌ Erreur génération ${providerConfig.name}:`, error.message);
      throw error;
    }
  }

  async generateWithOpenAI(prompt, model, config, options) {
    const messages = [];
    
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: model,
      provider: 'openai',
      usage: data.usage
    };
  }

  async generateWithPerplexity(prompt, model, config, options) {
    const messages = [];
    
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Perplexity Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: model,
      provider: 'perplexity',
      usage: data.usage,
      citations: data.citations || []
    };
  }

  async generateWithClaude(prompt, model, config, options) {
    const requestBody = {
      model: model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      messages: []
    };

    if (options.systemPrompt) {
      requestBody.system = options.systemPrompt;
    }

    requestBody.messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: model,
      provider: 'claude',
      usage: data.usage
    };
  }

  async generateWithGemini(prompt, model, config, options) {
    const fullPrompt = options.systemPrompt ? 
      `${options.systemPrompt}\n\n${prompt}` : prompt;

    const endpoint = `${config.endpoint}/${model}:generateContent?key=${config.apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model: model,
      provider: 'gemini',
      usage: data.usageMetadata
    };
  }

  /**
   * Obtenir les prompts système optimisés pour chaque type de contenu
   */
  getSystemPrompts() {
    return {
      article: {
        base: `Tu es un expert en rédaction d'articles de blog optimisés GEO (Generative Engine Optimization).
        
Crée un article professionnel et engageant basé sur le contenu fourni.

STRUCTURE REQUISE:
1. Titre accrocheur avec mots-clés
2. Introduction engageante (problème + solution)
3. Développement structuré avec sous-titres
4. Exemples concrets et actionnables  
5. Conclusion avec call-to-action

OPTIMISATIONS GEO:
- Utilise des questions-réponses naturelles
- Inclus des données chiffrées et statistiques
- Structure avec des listes et bullet points
- Ajoute des citations d'experts
- Optimise pour les featured snippets

STYLE: Professionnel, accessible, actionnable.`,

        entrepreneurs: `En plus des consignes de base, adapte le contenu pour des entrepreneurs:
- Focus sur le ROI et l'impact business
- Exemples d'entreprises connues
- Métriques de performance
- Stratégies de croissance
- Call-to-action orientés business`,

        technical: `En plus des consignes de base, adapte pour une audience technique:
- Détails d'implémentation
- Exemples de code si pertinent
- Références aux meilleures pratiques
- Outils et technologies spécifiques
- Considérations techniques avancées`
      },

      newsletter: {
        base: `Tu es un expert en email marketing et newsletters engageantes.

Crée une séquence de newsletters basée sur le contenu fourni.

STRUCTURE REQUISE:
1. Sujet accrocheur (taux d'ouverture optimisé)
2. Preview text engageant
3. Salutation personnalisée
4. Contenu valeur (80%) + promotion (20%)
5. CTA clair et unique
6. P.S. avec engagement

OPTIMISATIONS:
- Personnalisation avec variables [prenom]
- Ton conversationnel et amical
- Paragraphes courts (2-3 lignes max)
- Urgence et rareté si approprié
- Mobile-first design thinking`,

        sequence: `Crée une séquence de 3 emails avec progression logique:
Email 1: Education/Sensibilisation
Email 2: Approfondissement/Preuve sociale  
Email 3: Action/Conversion`
      },

      twitter: {
        base: `Tu es un expert en contenu Twitter viral et engageant.

Crée du contenu Twitter basé sur les informations fournies.

FORMATS SUPPORTÉS:
- Tweets simples (280 caractères)
- Threads éducatifs
- Questions engageantes
- Citations inspirantes
- Tips actionables

OPTIMISATIONS:
- Hook fort en début
- Emojis pertinents 
- Hashtags stratégiques (max 3)
- Call-to-action pour engagement
- Structure scannable`,

        viral: `Optimise pour la viralité:
- Emotions fortes (surprise, inspirant)
- Controverses constructives
- Storytelling personnel
- Chiffres surprenants
- Questions polarisantes`
      }
    };
  }

  /**
   * Obtenir un prompt système adapté au contexte
   */
  getContextualSystemPrompt(contentType, audience = 'base', specialization = null) {
    const prompts = this.getSystemPrompts();
    
    if (!prompts[contentType]) {
      return 'Tu es un assistant IA expert en création de contenu. Suis les instructions données et crée un contenu de qualité.';
    }

    let systemPrompt = prompts[contentType].base;
    
    if (audience !== 'base' && prompts[contentType][audience]) {
      systemPrompt += '\n\n' + prompts[contentType][audience];
    }
    
    if (specialization && prompts[contentType][specialization]) {
      systemPrompt += '\n\n' + prompts[contentType][specialization];
    }

    return systemPrompt;
  }
}

module.exports = new AIService();


