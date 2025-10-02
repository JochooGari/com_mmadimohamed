/**
 * Routes pour l'exécution des agents IA (white-label)
 */

const express = require('express');
const router = express.Router();
const agentOrchestrator = require('../services/AgentOrchestrator');

// Exécuter un agent spécifique
router.post('/execute/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task, context = {} } = req.body;
    if (!task) return res.status(400).json({ success: false, error: 'Task is required' });
    const result = await agentOrchestrator.executeAgent(agentId, task, context);
    res.json({ success: true, agent: agentId, task_type: task.type, result, execution_time: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Workflow de création de contenu complet
router.post('/workflows/content-creation', async (req, res) => {
  try {
    const { transcriptData, options = {} } = req.body;
    if (!transcriptData) return res.status(400).json({ success: false, error: 'transcriptData is required' });
    const startTime = Date.now();
    const results = await agentOrchestrator.createContentFromTranscript(transcriptData, options);
    const executionTime = Date.now() - startTime;
    res.json({ success: true, workflow: 'content-creation', execution_time_ms: executionTime, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transformation de transcript avec prompt spécifique
router.post('/transform', async (req, res) => {
  try {
    const { transcript, promptId, parameters = {}, options = {}, aiSettings = {} } = req.body;
    if (!transcript) return res.status(400).json({ success: false, error: 'Transcript is required' });
    if (!promptId) return res.status(400).json({ success: false, error: 'PromptId is required' });

    let result;
    switch (promptId) {
      case 'article':
        result = await agentOrchestrator.executeAgent('script', {
          type: 'create_script',
          data: transcript,
          options: { format: 'article', style: parameters.tone || 'professionnel', duration: parameters.length || 'long', audience: parameters.audience || 'base', aiProvider: aiSettings.provider || 'perplexity', aiModel: aiSettings.model || null, ...options }
        }, { contentType: 'article' });
        break;
      case 'tweets':
        result = await agentOrchestrator.executeAgent('twitter', { type: 'create_tweets', data: transcript, options: { count: parameters.count || 5, type: 'insights', aiProvider: aiSettings.provider || 'perplexity', aiModel: aiSettings.model || null, ...options } }, {});
        break;
      case 'newsletters':
        result = await agentOrchestrator.executeAgent('newsletter', { type: 'create_sequence', data: transcript, options: { count: parameters.count || 3, audience: parameters.audience || 'entrepreneurs', style: parameters.tone || 'éducatif', aiProvider: aiSettings.provider || 'perplexity', aiModel: aiSettings.model || null, ...options } }, {});
        break;
      case 'intelligence':
        result = await agentOrchestrator.executeAgent('veille', { type: 'analyze_content', data: transcript, options: { extractQuotes: parameters.extractQuotes !== false, findKeyMoments: parameters.findKeyMoments !== false, calculateViralScore: parameters.calculateViralScore !== false, analyzeEngagement: parameters.analyzeEngagement !== false, aiProvider: aiSettings.provider || 'perplexity', aiModel: aiSettings.model || null, ...options } }, { analysisType: 'content_intelligence' });
        break;
      default:
        result = await agentOrchestrator.executeAgent('script', { type: 'create_script', data: transcript, options: { format: promptId, style: parameters.tone || 'professionnel', duration: parameters.length || 'medium', aiProvider: aiSettings.provider || 'perplexity', aiModel: aiSettings.model || null, ...options } }, { contentType: promptId });
        break;
    }

    res.json({ success: true, data: result, metadata: { promptId, parameters, options, aiSettings } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, details: error.stack });
  }
});

// Providers disponibles
router.get('/ai-providers', async (req, res) => {
  try {
    const providers = agentOrchestrator.getAvailableAIProviders();
    res.json({ success: true, providers, default_provider: 'perplexity' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health/status
router.get('/health', async (req, res) => {
  try {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


