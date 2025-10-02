/**
 * Orchestrateur d'agents IA spécialisés
 * Gère la coordination entre les différents agents
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const aiService = require('./AIService');

class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
    this.agentsConfig = null;
    this.promptsConfig = null;
    
    // Chemins de configuration
    this.AGENTS_CONFIG_PATH = path.join(__dirname, '../config/agents-config.json');
    this.PROMPTS_CONFIG_PATH = path.join(__dirname, '../config/prompts-config.json');
    
    this.initializeAgents();
  }

  async initializeAgents() {
    try {
      await this.loadConfigurations();
      this.registerAgents();
      console.log('🤖 Agents IA initialisés avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation agents:', error);
    }
  }

  async loadConfigurations() {
    try {
      // Charger la configuration des agents
      const agentsConfigExists = await fs.access(this.AGENTS_CONFIG_PATH).then(() => true).catch(() => false);
      if (agentsConfigExists) {
        const agentsData = await fs.readFile(this.AGENTS_CONFIG_PATH, 'utf8');
        this.agentsConfig = JSON.parse(agentsData);
      }

      // Charger la configuration des prompts
      const promptsConfigExists = await fs.access(this.PROMPTS_CONFIG_PATH).then(() => true).catch(() => false);
      if (promptsConfigExists) {
        const promptsData = await fs.readFile(this.PROMPTS_CONFIG_PATH, 'utf8');
        this.promptsConfig = JSON.parse(promptsData);
      }
    } catch (error) {
      console.error('Erreur chargement configurations:', error);
    }
  }

  registerAgents() {
    if (!this.agentsConfig?.agents) return;

    // Agent de Veille
    this.agents.set('veille', new VeilleAgent(this.agentsConfig.agents.veille));
    
    // Agent Scriptwriter
    this.agents.set('script', new ScriptwriterAgent(this.agentsConfig.agents.script));
    
    // Agent Newsletter
    this.agents.set('newsletter', new NewsletterAgent(this.agentsConfig.agents.newsletter));
    
    // Agent Twitter
    this.agents.set('twitter', new TwitterAgent(this.agentsConfig.agents.twitter));
  }

  // ============================================
  // INTERFACE PUBLIQUE
  // ============================================

  async executeAgent(agentId, task, context = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' non trouvé`);
    }

    if (!agent.isActive()) {
      throw new Error(`Agent '${agentId}' est inactif`);
    }

    try {
      console.log(`🔄 Exécution agent ${agentId}:`, task.type);
      const result = await agent.performTask(task, context);
      console.log(`✅ Agent ${agentId} terminé avec succès`);
      return result;
    } catch (error) {
      console.error(`❌ Erreur agent ${agentId}:`, error);
      throw error;
    }
  }

  async executeWorkflow(workflowId, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' non trouvé`);
    }

    const results = {};
    
    for (const step of workflow.steps) {
      try {
        console.log(`🔄 Exécution étape: ${step.agentId} -> ${step.task.type}`);
        const stepContext = { ...context, previousResults: results };
        const result = await this.executeAgent(step.agentId, step.task, stepContext);
        results[step.id] = result;
        if (step.waitTime) await new Promise(r => setTimeout(r, step.waitTime));
      } catch (error) {
        console.error(`❌ Erreur étape ${step.id}:`, error);
        if (!step.optional) throw error;
      }
    }

    return results;
  }

  // Workflow prédéfinis
  async createContentFromTranscript(transcriptData, options = {}) {
    const context = { transcript: transcriptData, options };
    const tasks = [];

    if (options.includeAnalysis) {
      tasks.push({ id: 'analysis', agentId: 'veille', task: { type: 'analyze_transcript', data: transcriptData } });
    }

    const contentTasks = [];
    if (options.generateScript) contentTasks.push({ id: 'script', agentId: 'script', task: { type: 'create_script', data: transcriptData, options: options.scriptOptions || {} } });
    if (options.generateNewsletters) contentTasks.push({ id: 'newsletters', agentId: 'newsletter', task: { type: 'create_sequence', data: transcriptData, options: options.newsletterOptions || {} } });
    if (options.generateTweets) contentTasks.push({ id: 'tweets', agentId: 'twitter', task: { type: 'create_tweets', data: transcriptData, options: options.twitterOptions || {} } });

    const results = {};
    if (tasks.length > 0) {
      for (const task of tasks) results[task.id] = await this.executeAgent(task.agentId, task.task, context);
    }
    if (contentTasks.length > 0) {
      const contentPromises = contentTasks.map(task => this.executeAgent(task.agentId, task.task, { ...context, analysis: results.analysis }).then(result => ({ [task.id]: result })));
      const contentResults = await Promise.all(contentPromises);
      contentResults.forEach(result => Object.assign(results, result));
    }

    return results;
  }

  getAvailableAIProviders() {
    return aiService.getAvailableProviders();
  }
}

// ============================================
// AGENTS SPÉCIALISÉS (implémentations simplifiées)
// ============================================

class BaseAgent {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.description = config.description;
    this.role = config.role;
    this.capabilities = config.capabilities || [];
    this.tools = config.tools || [];
    this.active = config.active !== false;
  }
  isActive() { return this.active; }
}

class VeilleAgent extends BaseAgent {
  async performTask(task) {
    switch (task.type) {
      case 'analyze_transcript':
        return {
          trends_identified: ['Intelligence artificielle en hausse', 'Contenu vidéo court populaire', 'Automation workflow trending'],
          keywords_analysis: { primary: ['IA', 'automation', 'productivité'] },
          competitive_landscape: { engagement_level: 'high' },
          content_opportunities: { follow_up_topics: ['Implémentation pratique', 'ROI measurement'] }
        };
      default:
        throw new Error(`Tâche '${task.type}' non supportée par VeilleAgent`);
    }
  }
}

class ScriptwriterAgent extends BaseAgent {
  async performTask(task) {
    switch (task.type) {
      case 'create_script': {
        const title = task.data.title || 'Script Generated';
        const fullText = task.data.transcriptInfo?.fullText || task.data.transcript?.text || task.data.text || '';
        const prompt = `TITRE DE LA VIDÉO: ${title}\n\nTRANSCRIPTION ORIGINALE:\n${fullText}\n\nGénère un article de blog professionnel et optimisé GEO basé sur cette transcription.`;
        const systemPrompt = aiService.getContextualSystemPrompt('article', task.options.audience || 'base', task.options.format === 'article' ? 'technical' : null);
        const aiResponse = await aiService.generateContent(prompt, { provider: task.options.aiProvider || 'perplexity', model: task.options.aiModel, systemPrompt, temperature: 0.7, maxTokens: 2500 });
        return {
          script: { title: `${title} - Article Optimisé GEO`, format: task.options.format || 'article', content: aiResponse.content, ai_info: { provider: aiResponse.provider, model: aiResponse.model, usage: aiResponse.usage } },
          metadata: { seo_keywords: ['exemple', 'keywords'] }
        };
      }
      default:
        throw new Error(`Tâche '${task.type}' non supportée par ScriptwriterAgent`);
    }
  }
}

class NewsletterAgent extends BaseAgent {
  async performTask(task) {
    switch (task.type) {
      case 'create_sequence':
        return { sequence_metadata: { total_emails: task.options.count || 3 }, newsletters: [] };
      default:
        throw new Error(`Tâche '${task.type}' non supportée par NewsletterAgent`);
    }
  }
}

class TwitterAgent extends BaseAgent {
  async performTask(task) {
    switch (task.type) {
      case 'create_tweets':
        return { tweets: [{ id: 1, content: 'Tweet exemple #insights' }], campaign_strategy: { posting_schedule: [], engagement_tactics: [], performance_tracking: [] } };
      default:
        throw new Error(`Tâche '${task.type}' non supportée par TwitterAgent`);
    }
  }
}

module.exports = new AgentOrchestrator();


