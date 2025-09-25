// API backend pour le stockage des fichiers
// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// En production Vercel, utiliser un dossier temporaire writable
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(process.cwd(), 'data');

function getServerSupabase() {
  const url = process.env.SUPABASE_URL as string | undefined;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string | undefined;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function putObject(bucket: string, objectPath: string, body: string | Blob, contentType: string) {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false };
  const { error } = await supabase.storage.from(bucket).upload(objectPath, body as any, { upsert: true, contentType });
  if (error) throw error;
  return { ok: true };
}

async function getObjectJSON<T = any>(bucket: string, objectPath: string): Promise<T | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error || !data) return null;
  const text = await (data as any).text();
  try { return JSON.parse(text) as T; } catch { return null; }
}

async function getObjectText(bucket: string, objectPath: string): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error || !data) return null;
  return await (data as any).text();
}

// Assurer que les dossiers existent
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, agentType, dataType, data } = req.body || {};
    const { agent, type } = req.query;

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, agent as string, type as string);
      
      case 'POST':
        return await handlePost(req, res, action, agentType, dataType, data);
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Storage API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGet(req: any, res: any, agent: string, type: string) {
  // Special case: site theme CSS
  if (agent === 'site' && type === 'theme') {
    try {
      const text = await getObjectText('agents', 'site/inputs/theme.css');
      if (text) return res.status(200).send(text);
    } catch {}
    try {
      const cssPath = path.join(DATA_DIR, 'agents', 'site', 'inputs', 'theme.css');
      const text = await fs.promises.readFile(cssPath, 'utf8');
      return res.status(200).send(text);
    } catch {
      return res.status(200).send('');
    }
  }

  // Special case: CSS templates
  if (agent === 'site' && type === 'css_templates') {
    try {
      const text = await getObjectText('agents', 'site/inputs/css_templates.json');
      if (text) return res.status(200).send(text);
    } catch {}
    try {
      const templatesPath = path.join(DATA_DIR, 'agents', 'site', 'inputs', 'css_templates.json');
      const text = await fs.promises.readFile(templatesPath, 'utf8');
      return res.status(200).send(text);
    } catch {
      return res.status(200).send('[]');
    }
  }
  if (agent === 'monitoring' && type === 'stats') {
    // Récupérer les stats de monitoring
    const indexFile = path.join(DATA_DIR, 'monitoring', 'monitoring_index.json');
    try {
      // Essayer Supabase Storage en production
      const json = await getObjectJSON('monitoring', 'monitoring_index.json');
      if (json) return res.json(json);
      const data = await fs.promises.readFile(indexFile, 'utf8');
      return res.json(JSON.parse(data));
    } catch {
      return res.json({
        lastUpdated: '',
        totalItems: 0,
        byType: {},
        bySource: {},
        byDate: {},
        keywords: {}
      });
    }
  }

  if (agent && type) {
    // 1) Essaye Supabase Storage (prod)
    try {
      const text = await getObjectText('agents', `${agent}/inputs/${type}.json`);
      if (text) return res.json(JSON.parse(text));
    } catch {}

    // 2) Fallback local (dev)
    const agentPath = path.join(DATA_DIR, 'agents', agent, 'inputs');
    const filePath = path.join(agentPath, `${type}.json`);
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return res.json(JSON.parse(data));
    } catch {
      return res.json([]);
    }
  }

  return res.status(400).json({ error: 'Missing parameters' });
}

async function handlePost(req: any, res: any, action: string, agentType: string, dataType: string, data: any) {
  switch (action) {
    case 'save_sources':
      return await saveSources(res, agentType, data);
    
    case 'save_config':
      return await saveConfig(res, agentType, data);
    
    case 'save_campaigns':
      return await saveCampaigns(res, agentType, data);
    
    case 'save_monitoring':
      return await saveMonitoring(res, data);

    case 'save_site_sidebar':
      return await saveSiteSidebar(res, data);
    
    case 'save_site_theme':
      return await saveSiteTheme(res, data);

    case 'save_workflow_prompts':
      return await saveWorkflowPrompts(res, data);

    case 'save_css_templates':
      return await saveCssTemplates(res, data);

    case 'create_structure':
      return await createDirectoryStructure(res);
    
    case 'optimize_data':
      return await optimizeData(res, agentType);
    
    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
}

async function saveSources(res: any, agentType: string, sources: any[]) {
  const inputsPath = path.join(DATA_DIR, 'agents', agentType, 'inputs');
  const sourcesFile = path.join(inputsPath, 'sources.json');
  
  await ensureDirectoryExists(inputsPath);
  await fs.promises.writeFile(sourcesFile, JSON.stringify(sources, null, 2));
  // Supabase Storage (production)
  try { await putObject('agents', `${agentType}/inputs/sources.json`, JSON.stringify(sources, null, 2), 'application/json'); } catch {}
  
  // Sauvegarder chaque source individuellement
  for (const source of sources) {
    if (source.content) {
      const sourceFile = path.join(inputsPath, `source_${source.id}.txt`);
      await fs.promises.writeFile(sourceFile, source.content);
      try { await putObject('agents', `${agentType}/inputs/source_${source.id}.txt`, source.content, 'text/plain'); } catch {}
    }
  }
  
  // Optimiser pour l'IA
  await optimizeForAI(agentType, sources);
  
  return res.json({ success: true, count: sources.length });
}

async function saveConfig(res: any, agentType: string, config: any) {
  const configPath = path.join(DATA_DIR, 'agents', agentType, 'inputs');
  const configFile = path.join(configPath, 'config.json');
  
  const configWithTimestamp = {
    ...config,
    lastUpdated: new Date().toISOString()
  };
  
  await ensureDirectoryExists(configPath);
  await fs.promises.writeFile(configFile, JSON.stringify(configWithTimestamp, null, 2));
  try { await putObject('agents', `${agentType}/inputs/config.json`, JSON.stringify(configWithTimestamp, null, 2), 'application/json'); } catch {}
  
  return res.json({ success: true });
}

async function saveCampaigns(res: any, agentType: string, campaigns: any[]) {
  const campaignPath = path.join(DATA_DIR, 'agents', agentType, 'inputs');
  const campaignFile = path.join(campaignPath, 'campaigns.json');
  
  await ensureDirectoryExists(campaignPath);
  await fs.promises.writeFile(campaignFile, JSON.stringify(campaigns, null, 2));
  try { await putObject('agents', `${agentType}/inputs/campaigns.json`, JSON.stringify(campaigns, null, 2), 'application/json'); } catch {}
  
  return res.json({ success: true, count: campaigns.length });
}

async function saveSiteSidebar(res: any, payload: any) {
  const agentPath = path.join(DATA_DIR, 'agents', 'site', 'inputs');
  const filePath = path.join(agentPath, 'sidebar.json');
  await ensureDirectoryExists(agentPath);
  await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2));
  try { await putObject('agents', `site/inputs/sidebar.json`, JSON.stringify(payload, null, 2), 'application/json'); } catch {}
  return res.json({ success: true });
}

async function saveSiteTheme(res: any, payload: any) {
  const css: string = String(payload?.css || '');
  const agentPath = path.join(DATA_DIR, 'agents', 'site', 'inputs');
  const filePath = path.join(agentPath, 'theme.css');
  await ensureDirectoryExists(agentPath);
  await fs.promises.writeFile(filePath, css, 'utf8');
  try { await putObject('agents', `site/inputs/theme.css`, css, 'text/css'); } catch {}
  return res.json({ success: true, bytes: css.length, savedAt: new Date().toISOString() });
}

async function saveWorkflowPrompts(res: any, payload: any) {
  // payload is an object: { [agentId]: { prompt: string } }
  const agentPath = path.join(DATA_DIR, 'agents', 'workflow', 'inputs');
  const filePath = path.join(agentPath, 'prompts.json');
  await ensureDirectoryExists(agentPath);
  const text = JSON.stringify(payload || {}, null, 2);
  await fs.promises.writeFile(filePath, text, 'utf8');
  try { await putObject('agents', `workflow/inputs/prompts.json`, text, 'application/json'); } catch {}
  return res.json({ success: true, savedAt: new Date().toISOString() });
}

async function saveCssTemplates(res: any, templates: any[]) {
  const agentPath = path.join(DATA_DIR, 'agents', 'site', 'inputs');
  const filePath = path.join(agentPath, 'css_templates.json');
  await ensureDirectoryExists(agentPath);
  await fs.promises.writeFile(filePath, JSON.stringify(templates, null, 2));
  try { await putObject('agents', `site/inputs/css_templates.json`, JSON.stringify(templates, null, 2), 'application/json'); } catch {}
  return res.json({ success: true, count: templates.length, savedAt: new Date().toISOString() });
}

async function saveMonitoring(res: any, content: any) {
  const sourcesPath = path.join(DATA_DIR, 'monitoring', 'sources');
  const optimizedPath = path.join(DATA_DIR, 'monitoring', 'optimized');
  
  await ensureDirectoryExists(sourcesPath);
  await ensureDirectoryExists(optimizedPath);
  
  // Sauvegarder le contenu brut
  const sourceFile = path.join(sourcesPath, `${content.type}_${content.id}.json`);
  await fs.promises.writeFile(sourceFile, JSON.stringify(content, null, 2));
  try { await putObject('monitoring', `sources/${content.type}_${content.id}.json`, JSON.stringify(content, null, 2), 'application/json'); } catch {}
  
  // Créer la version optimisée
  const optimizedContent = await optimizeContentForAI(content);
  const optimizedFile = path.join(optimizedPath, `optimized_${content.id}.json`);
  await fs.promises.writeFile(optimizedFile, JSON.stringify(optimizedContent, null, 2));
  try { await putObject('monitoring', `optimized/optimized_${content.id}.json`, JSON.stringify(optimizedContent, null, 2), 'application/json'); } catch {}
  
  // Mettre à jour l'index
  await updateMonitoringIndex(content);
  
  return res.json({ success: true });
}

async function createDirectoryStructure(res: any) {
  const directories = [
    'agents/linkedin/inputs',
    'agents/linkedin/outputs',
    'agents/geo/inputs', 
    'agents/geo/outputs',
    'monitoring/sources',
    'monitoring/optimized',
    'monitoring/reports',
    'exports',
    'backups'
  ];
  
  for (const dir of directories) {
    const fullPath = path.join(DATA_DIR, dir);
    await ensureDirectoryExists(fullPath);
  }
  
  return res.json({ success: true, directories: directories.length });
}

async function optimizeData(res: any, agentType: string) {
  // Logique d'optimisation simplifiée
  const outputPath = path.join(DATA_DIR, 'agents', agentType, 'outputs');
  await ensureDirectoryExists(outputPath);
  
  const optimizedData = {
    lastUpdated: new Date().toISOString(),
    agentType,
    status: 'optimized'
  };
  
  const optimizedFile = path.join(outputPath, 'ai_optimized.json');
  await fs.promises.writeFile(optimizedFile, JSON.stringify(optimizedData, null, 2));
  try { await putObject('agents', `${agentType}/outputs/ai_optimized.json`, JSON.stringify(optimizedData, null, 2), 'application/json'); } catch {}
  
  return res.json({ success: true });
}

// Fonctions utilitaires
async function optimizeForAI(agentType: string, sources: any[]) {
  const outputPath = path.join(DATA_DIR, 'agents', agentType, 'outputs');
  await ensureDirectoryExists(outputPath);
  
  const optimizedData = {
    lastUpdated: new Date().toISOString(),
    agentType,
    sourceCount: sources.length,
    sources: sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      tags: source.tags,
      summary: generateSummary(source.content),
      keywords: extractKeywords(source.content),
      lastUpdated: source.lastUpdated,
      wordCount: source.content?.split(' ').length || 0
    }))
  };
  
  const optimizedFile = path.join(outputPath, 'ai_optimized.json');
  await fs.promises.writeFile(optimizedFile, JSON.stringify(optimizedData, null, 2));
}

async function optimizeContentForAI(content: any) {
  return {
    id: content.id,
    title: content.title,
    type: content.type,
    source: content.source,
    publishedAt: content.publishedAt,
    summary: generateSummary(content.content),
    keywords: extractKeywords(content.content),
    optimizedAt: new Date().toISOString()
  };
}

async function updateMonitoringIndex(content: any) {
  const indexFile = path.join(DATA_DIR, 'monitoring', 'monitoring_index.json');
  
  let index: any;
  try {
    const data = await fs.promises.readFile(indexFile, 'utf8');
    index = JSON.parse(data);
  } catch {
    index = {
      lastUpdated: '',
      totalItems: 0,
      byType: {},
      bySource: {},
      byDate: {},
      keywords: {}
    };
  }
  
  index.lastUpdated = new Date().toISOString();
  index.totalItems++;
  index.byType[content.type] = (index.byType[content.type] || 0) + 1;
  
  if (content.source) {
    index.bySource[content.source] = (index.bySource[content.source] || 0) + 1;
  }
  
  const dateKey = new Date(content.publishedAt).toISOString().split('T')[0];
  index.byDate[dateKey] = (index.byDate[dateKey] || 0) + 1;
  
  await fs.promises.writeFile(indexFile, JSON.stringify(index, null, 2));
}

function generateSummary(content?: string): string {
  if (!content) return '';
  const sentences = content.split('.');
  return sentences.slice(0, 3).join('.') + '.';
}

function extractKeywords(content?: string): string[] {
  if (!content) return [];
  return content.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 10);
}