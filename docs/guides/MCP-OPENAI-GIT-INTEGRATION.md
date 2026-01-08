# MCP Server pour OpenAI - Intégration Git sur magicpath-project

**Date**: 2025-11-20
**Objectif**: Permettre à OpenAI (ChatGPT/API) d'exécuter des commits Git sur le projet magicpath-project
**Protocole**: Model Context Protocol (MCP)

---

## 1. QU'EST-CE QUE MCP?

**Model Context Protocol (MCP)** est un protocole ouvert développé par Anthropic permettant aux LLMs (comme Claude, GPT, etc.) d'interagir avec des outils externes via des "servers" MCP.

### Architecture MCP

```
┌─────────────┐
│  OpenAI API │
│  (Client)   │
└──────┬──────┘
       │ MCP Protocol (stdio/HTTP)
       │
┌──────▼──────┐
│ MCP Server  │
│ (Git Tools) │
└──────┬──────┘
       │
┌──────▼──────────────────┐
│  Système Git Local      │
│  magicpath-project/.git │
└─────────────────────────┘
```

### Avantages pour votre cas d'usage

✅ **Commits automatisés**: OpenAI peut commiter directement sans intervention manuelle
✅ **Sécurisé**: Contrôle des permissions via configuration MCP
✅ **Traçable**: Tous les commits sont loggés et vérifiables
✅ **Standardisé**: Compatible avec tous les clients MCP

---

## 2. INFORMATIONS SUR VOTRE PROJET

### Chemin du projet
```
c:\Users\power\OneDrive\Documents\Website_2025_06_30\magicpath-project
```

### Repository Git
```bash
Remote: https://github.com/JochooGari/com_mmadimohamed.git
Branch principale: main
Branch actuelle: main
```

### Commits récents
```
9bb278c - fix: use text.format for GPT-5 Responses API JSON mode
3c657f9 - debug: improve callAI error logging with full response details
7055f2a - debug: add detailed error logging to capture GPT-5 API errors
5c6e24f - feat: implement OpenAI JSON Mode for sectional article generation
9054ea6 - chore: update Claude Code settings
```

### Fichiers principaux modifiés
- `magicpath-project/api/ai-proxy.ts` (gestion API OpenAI)
- `magicpath-project/api/geo.ts` (workflow articles)
- Scripts utilitaires (`analyze-job.js`, `test-sectional-workflow.js`, etc.)

---

## 3. OPTIONS D'IMPLÉMENTATION MCP

### Option A: MCP Server Node.js personnalisé (Recommandé)

**Avantages**:
- Contrôle total des permissions
- Peut inclure validation des commits
- Logs détaillés
- Intégration avec workflows existants

**Stack technique**:
```typescript
- Runtime: Node.js 20.x
- Framework: @modelcontextprotocol/sdk
- Communication: stdio (standard input/output)
- Git: simple-git (npm package)
```

### Option B: MCP Server officiel `git` d'Anthropic

**Avantages**:
- Déjà développé et testé
- Maintenu par Anthropic
- Documentation complète

**Limitations**:
- Permissions globales (tous repos accessibles)
- Moins de contrôle fin

---

## 4. IMPLÉMENTATION RECOMMANDÉE: MCP Server Node.js Custom

### Structure du projet MCP

```
c:\Users\power\mcp-servers\
└── magicpath-git\
    ├── package.json
    ├── tsconfig.json
    ├── src\
    │   ├── index.ts          # Point d'entrée MCP
    │   ├── git-tools.ts      # Outils Git
    │   └── config.ts         # Configuration
    └── dist\                 # Build TypeScript
```

### Fichier `package.json`

```json
{
  "name": "mcp-magicpath-git",
  "version": "1.0.0",
  "description": "MCP server for Git operations on magicpath-project",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "simple-git": "^3.25.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

### Fichier `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Fichier `src/config.ts`

```typescript
export const CONFIG = {
  // Chemin absolu du projet magicpath
  projectPath: 'c:\\Users\\power\\OneDrive\\Documents\\Website_2025_06_30\\magicpath-project',

  // Repository Git
  remote: 'https://github.com/JochooGari/com_mmadimohamed.git',

  // Branches autorisées pour commit
  allowedBranches: ['main', 'develop', 'feature/*'],

  // Pattern de fichiers autorisés pour modification
  allowedFiles: [
    'api/**/*.ts',
    'api/**/*.js',
    'components/**/*',
    'pages/**/*',
    '*.js',  // Scripts à la racine
    '*.md'   // Documentation
  ],

  // Fichiers interdits (sécurité)
  forbiddenFiles: [
    '.env',
    '.env.local',
    '.vercel/**',
    'node_modules/**',
    '.git/**'
  ],

  // Format des messages de commit
  commitMessageFormat: {
    prefix: '🤖 [OpenAI]',
    suffix: '\n\nGenerated via MCP by OpenAI'
  },

  // Validation
  requireSignature: false,  // Si true, utilise GPG
  maxCommitSize: 1000,      // Max fichiers par commit

  // Logs
  logPath: 'c:\\Users\\power\\mcp-servers\\magicpath-git\\logs',
  enableDetailedLogs: true
};
```

### Fichier `src/git-tools.ts`

```typescript
import simpleGit, { SimpleGit } from 'simple-git';
import { CONFIG } from './config.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class GitTools {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit(CONFIG.projectPath);
  }

  /**
   * Vérifie si un fichier est autorisé pour modification
   */
  private isFileAllowed(filePath: string): boolean {
    // Vérifier interdictions
    for (const forbidden of CONFIG.forbiddenFiles) {
      const pattern = forbidden.replace(/\*/g, '.*');
      if (new RegExp(pattern).test(filePath)) {
        return false;
      }
    }

    // Vérifier autorisations
    for (const allowed of CONFIG.allowedFiles) {
      const pattern = allowed.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
      if (new RegExp(pattern).test(filePath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Liste les fichiers modifiés
   */
  async getStatus() {
    const status = await this.git.status();
    return {
      branch: status.current,
      ahead: status.ahead,
      behind: status.behind,
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      staged: status.staged,
      conflicted: status.conflicted
    };
  }

  /**
   * Ajoute des fichiers au staging
   */
  async addFiles(files: string[]) {
    // Validation
    const invalidFiles = files.filter(f => !this.isFileAllowed(f));
    if (invalidFiles.length > 0) {
      throw new Error(`Forbidden files: ${invalidFiles.join(', ')}`);
    }

    // Vérifier que les fichiers existent
    for (const file of files) {
      const fullPath = path.join(CONFIG.projectPath, file);
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error(`File not found: ${file}`);
      }
    }

    // Git add
    await this.git.add(files);

    return {
      success: true,
      addedFiles: files,
      count: files.length
    };
  }

  /**
   * Crée un commit
   */
  async createCommit(message: string, files?: string[]) {
    // Si fichiers spécifiés, les ajouter d'abord
    if (files && files.length > 0) {
      await this.addFiles(files);
    }

    // Vérifier qu'il y a des changements stagés
    const status = await this.git.status();
    if (status.staged.length === 0) {
      throw new Error('No staged changes to commit');
    }

    // Formater le message
    const formattedMessage = `${CONFIG.commitMessageFormat.prefix} ${message}${CONFIG.commitMessageFormat.suffix}`;

    // Commit
    const result = await this.git.commit(formattedMessage);

    return {
      success: true,
      commitHash: result.commit,
      branch: result.branch,
      summary: result.summary,
      filesChanged: status.staged.length
    };
  }

  /**
   * Push vers remote
   */
  async push(remote: string = 'origin', branch?: string) {
    const currentBranch = branch || (await this.git.status()).current;

    if (!currentBranch) {
      throw new Error('Cannot determine current branch');
    }

    await this.git.push(remote, currentBranch);

    return {
      success: true,
      remote,
      branch: currentBranch
    };
  }

  /**
   * Commit + Push en une opération
   */
  async commitAndPush(message: string, files?: string[]) {
    const commitResult = await this.createCommit(message, files);
    const pushResult = await this.push();

    return {
      commit: commitResult,
      push: pushResult
    };
  }

  /**
   * Pull depuis remote
   */
  async pull(remote: string = 'origin', branch?: string) {
    const currentBranch = branch || (await this.git.status()).current;
    await this.git.pull(remote, currentBranch);

    return {
      success: true,
      remote,
      branch: currentBranch
    };
  }

  /**
   * Obtenir l'historique des commits
   */
  async getLog(limit: number = 10) {
    const log = await this.git.log({ maxCount: limit });

    return log.all.map(commit => ({
      hash: commit.hash,
      date: commit.date,
      message: commit.message,
      author: commit.author_name
    }));
  }

  /**
   * Obtenir le diff des fichiers
   */
  async getDiff(file?: string) {
    if (file) {
      return await this.git.diff(['--', file]);
    }
    return await this.git.diff();
  }
}
```

### Fichier `src/index.ts` (MCP Server)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GitTools } from './git-tools.js';
import { CONFIG } from './config.js';

// Initialiser Git Tools
const gitTools = new GitTools();

// Créer le serveur MCP
const server = new Server(
  {
    name: 'mcp-magicpath-git',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Définir les outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'git_status',
        description: 'Get the current Git status of magicpath-project',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'git_add',
        description: 'Stage files for commit',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file paths to stage',
            },
          },
          required: ['files'],
        },
      },
      {
        name: 'git_commit',
        description: 'Create a Git commit with staged changes',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional: files to stage before committing',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'git_push',
        description: 'Push commits to remote repository',
        inputSchema: {
          type: 'object',
          properties: {
            remote: {
              type: 'string',
              description: 'Remote name (default: origin)',
              default: 'origin',
            },
            branch: {
              type: 'string',
              description: 'Branch name (default: current branch)',
            },
          },
        },
      },
      {
        name: 'git_commit_and_push',
        description: 'Commit and push in one operation',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Files to commit',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'git_log',
        description: 'Get commit history',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of commits to retrieve',
              default: 10,
            },
          },
        },
      },
      {
        name: 'git_diff',
        description: 'Get diff of changes',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description: 'Optional: specific file to diff',
            },
          },
        },
      },
    ],
  };
});

// Gérer les appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'git_status': {
        const status = await gitTools.getStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case 'git_add': {
        const files = args?.files as string[];
        if (!files || files.length === 0) {
          throw new Error('No files specified');
        }
        const result = await gitTools.addFiles(files);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_commit': {
        const message = args?.message as string;
        const files = args?.files as string[] | undefined;

        if (!message) {
          throw new Error('Commit message is required');
        }

        const result = await gitTools.createCommit(message, files);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_push': {
        const remote = (args?.remote as string) || 'origin';
        const branch = args?.branch as string | undefined;

        const result = await gitTools.push(remote, branch);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_commit_and_push': {
        const message = args?.message as string;
        const files = args?.files as string[] | undefined;

        if (!message) {
          throw new Error('Commit message is required');
        }

        const result = await gitTools.commitAndPush(message, files);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_log': {
        const limit = (args?.limit as number) || 10;
        const result = await gitTools.getLog(limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_diff': {
        const file = args?.file as string | undefined;
        const result = await gitTools.getDiff(file);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Démarrer le serveur
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Magicpath Git Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

---

## 5. CONFIGURATION POUR OPENAI

### Configuration Claude Desktop (pour référence MCP)

Fichier: `C:\Users\power\AppData\Roaming\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "magicpath-git": {
      "command": "node",
      "args": [
        "c:\\Users\\power\\mcp-servers\\magicpath-git\\dist\\index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Configuration OpenAI Custom GPT (Actions)

Si vous utilisez un Custom GPT, ajoutez ces actions dans l'interface OpenAI:

**Schema OpenAPI pour Actions**:

```yaml
openapi: 3.0.0
info:
  title: Magicpath Git MCP API
  version: 1.0.0
servers:
  - url: http://localhost:3000
    description: MCP HTTP Proxy
paths:
  /git/status:
    get:
      summary: Get Git status
      operationId: getGitStatus
      responses:
        '200':
          description: Git status
          content:
            application/json:
              schema:
                type: object

  /git/commit:
    post:
      summary: Create commit
      operationId: createCommit
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                files:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Commit created

  /git/push:
    post:
      summary: Push to remote
      operationId: pushToRemote
      responses:
        '200':
          description: Pushed successfully
```

### Proxy HTTP pour MCP (si OpenAI n'accepte pas stdio)

**Fichier**: `c:\Users\power\mcp-servers\magicpath-git\http-proxy.js`

```javascript
import express from 'express';
import { spawn } from 'child_process';

const app = express();
app.use(express.json());

// Fonction helper pour appeler le MCP server via stdio
async function callMCP(tool, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['dist/index.js']);

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    // Envoyer la requête MCP
    proc.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: tool, arguments: args }
    }));
    proc.stdin.end();
  });
}

// Endpoints HTTP
app.get('/git/status', async (req, res) => {
  try {
    const result = await callMCP('git_status', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/git/commit', async (req, res) => {
  try {
    const result = await callMCP('git_commit', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/git/push', async (req, res) => {
  try {
    const result = await callMCP('git_push', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/git/commit-and-push', async (req, res) => {
  try {
    const result = await callMCP('git_commit_and_push', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MCP HTTP Proxy running on port ${PORT}`);
});
```

---

## 6. INSTALLATION ET DÉMARRAGE

### Étape 1: Créer le projet MCP

```bash
# Créer le dossier
mkdir c:\Users\power\mcp-servers\magicpath-git
cd c:\Users\power\mcp-servers\magicpath-git

# Initialiser npm
npm init -y

# Installer dépendances
npm install @modelcontextprotocol/sdk simple-git zod
npm install -D @types/node typescript

# Créer structure
mkdir src
mkdir logs
```

### Étape 2: Copier les fichiers

Copier tous les fichiers TypeScript fournis ci-dessus:
- `src/index.ts`
- `src/git-tools.ts`
- `src/config.ts`
- `package.json`
- `tsconfig.json`

### Étape 3: Build

```bash
npm run build
```

### Étape 4: Tester localement

```bash
# Test du serveur MCP
node dist/index.js
# (Le serveur attend des commandes sur stdin)

# Tester avec une requête MCP
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

### Étape 5: Configurer pour OpenAI

**Option A**: Utiliser le proxy HTTP

```bash
# Installer express
npm install express

# Démarrer le proxy
node http-proxy.js
```

Puis configurer OpenAI Custom GPT pour pointer vers `http://localhost:3000`

**Option B**: Utiliser via Claude Desktop (comme pont)

1. Configurer Claude Desktop avec le MCP
2. Utiliser Claude Desktop comme interface pour OpenAI
3. OpenAI → demande à utilisateur → utilisateur demande à Claude → Claude exécute via MCP

---

## 7. SÉCURITÉ ET PERMISSIONS

### Fichiers autorisés (définis dans config.ts)

✅ **Autorisés**:
- `api/**/*.ts` (fichiers API TypeScript)
- `api/**/*.js` (fichiers API JavaScript)
- `components/**/*` (composants React)
- `pages/**/*` (pages Next.js)
- `*.js` (scripts racine)
- `*.md` (documentation)

❌ **Interdits**:
- `.env`, `.env.local` (secrets)
- `.vercel/**` (config Vercel)
- `node_modules/**` (dépendances)
- `.git/**` (objets Git internes)

### Validation des commits

Chaque commit est préfixé avec `🤖 [OpenAI]` pour traçabilité.

### Logs

Tous les appels MCP sont loggés dans:
```
c:\Users\power\mcp-servers\magicpath-git\logs\
```

---

## 8. EXEMPLES D'UTILISATION

### Depuis OpenAI Custom GPT (via HTTP Proxy)

**Utilisateur**: "Commit les changements dans ai-proxy.ts avec le message 'fix JSON schema'"

**OpenAI exécute**:
```http
POST http://localhost:3000/git/commit-and-push
Content-Type: application/json

{
  "message": "fix JSON schema",
  "files": ["api/ai-proxy.ts"]
}
```

**Réponse**:
```json
{
  "commit": {
    "success": true,
    "commitHash": "a1b2c3d",
    "branch": "main",
    "filesChanged": 1
  },
  "push": {
    "success": true,
    "remote": "origin",
    "branch": "main"
  }
}
```

### Depuis Claude Desktop (stdio)

**Utilisateur dans Claude**: "Montre-moi le statut Git"

**Claude utilise MCP tool**: `git_status`

**Résultat affiché**:
```json
{
  "branch": "main",
  "ahead": 0,
  "behind": 0,
  "modified": ["api/ai-proxy.ts"],
  "created": [],
  "deleted": [],
  "staged": [],
  "conflicted": []
}
```

---

## 9. TROUBLESHOOTING

### Erreur: "Forbidden files"

**Cause**: Tentative de modifier un fichier dans `forbiddenFiles`

**Solution**: Vérifier `src/config.ts` et ajuster `allowedFiles`

### Erreur: "No staged changes to commit"

**Cause**: Aucun fichier n'a été ajouté au staging

**Solution**: Appeler `git_add` avant `git_commit`, ou utiliser `git_commit` avec le paramètre `files`

### MCP Server ne démarre pas

**Cause**: TypeScript pas compilé

**Solution**:
```bash
cd c:\Users\power\mcp-servers\magicpath-git
npm run build
```

### Proxy HTTP ne répond pas

**Cause**: Port 3000 déjà utilisé

**Solution**: Changer le PORT dans `http-proxy.js`

---

## 10. INFORMATIONS COMPLÉMENTAIRES

### Repository GitHub
```
URL: https://github.com/JochooGari/com_mmadimohamed.git
Owner: JochooGari
Repo: com_mmadimohamed
```

### Authentification Git

Si le repo nécessite authentification pour push:

**Option 1**: SSH Key
```bash
# Générer une clé SSH si pas déjà fait
ssh-keygen -t ed25519 -C "your_email@example.com"

# Ajouter à GitHub
cat ~/.ssh/id_ed25519.pub
# Copier dans GitHub Settings > SSH Keys
```

**Option 2**: Personal Access Token (PAT)

1. Aller sur GitHub Settings > Developer Settings > Personal Access Tokens
2. Générer un nouveau token avec scope `repo`
3. Configurer dans Git:

```bash
# Stocker credentials
git config --global credential.helper store

# Au prochain push, entrer:
# Username: votre_username
# Password: ghp_xxxxxxxxxxxx (votre PAT)
```

### Webhook pour notifications (optionnel)

Ajouter un webhook Discord/Slack pour être notifié des commits:

```typescript
// Dans src/git-tools.ts, après createCommit()
async notifyCommit(commitInfo: any) {
  const webhookUrl = 'https://discord.com/api/webhooks/...';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🤖 New commit by OpenAI: ${commitInfo.commitHash}`,
      embeds: [{
        title: commitInfo.summary.changes[0],
        description: `Branch: ${commitInfo.branch}\nFiles: ${commitInfo.filesChanged}`,
        color: 5814783
      }]
    })
  });
}
```

---

## RÉSUMÉ - CHECKLIST D'INSTALLATION

- [ ] Créer le dossier `c:\Users\power\mcp-servers\magicpath-git`
- [ ] Copier les 5 fichiers fournis (package.json, tsconfig.json, 3x .ts)
- [ ] Exécuter `npm install`
- [ ] Exécuter `npm run build`
- [ ] Tester avec `node dist/index.js`
- [ ] **Pour OpenAI**: Démarrer le proxy HTTP avec `node http-proxy.js`
- [ ] **Pour OpenAI Custom GPT**: Configurer les Actions avec le schema OpenAPI fourni
- [ ] **Pour Claude Desktop**: Ajouter la config dans `claude_desktop_config.json`
- [ ] Vérifier les permissions Git (SSH ou PAT)
- [ ] Tester un commit test

---

**Vous avez maintenant toutes les informations nécessaires pour implémenter le MCP server !**

Des questions sur une partie spécifique ?
