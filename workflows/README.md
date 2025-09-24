# Workflow n8n - Agents de Génération de Contenu

## Vue d'ensemble

Ce workflow automatise la génération de contenu avec 3 agents IA spécialisés :

1. **Agent Search Content** - Scanne votre site et propose des sujets d'articles (Perplexity)
2. **Agent Ghostwriting** - Rédige des articles complets (GPT-4)
3. **Agent Review Content** - Analyse et note les articles avec recommandations (Claude-3)

## Installation

### 1. Démarrer n8n

Exécutez le script de démarrage :
```bash
# Windows
scripts/start-n8n.bat

# Linux/Mac
chmod +x scripts/start-n8n.sh && ./scripts/start-n8n.sh
```

### 2. Configuration des clés API

Dans n8n, allez dans **Settings > Environment variables** et ajoutez :

```bash
PERPLEXITY_API_KEY=pplx-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

### 3. Importer le workflow

1. Ouvrez n8n dans votre navigateur : http://localhost:5678
2. Allez dans **Workflows**
3. Cliquez sur **Import from file**
4. Sélectionnez `workflows/content-agents-workflow.json`

## Utilisation

### Interface Web

1. Allez sur http://localhost:3000/workflow
2. Configurez l'URL de votre site à scanner
3. Modifiez les prompts des agents si nécessaire
4. Cliquez sur "Lancer le Workflow"

### Interface n8n

1. Ouvrez le workflow dans n8n
2. Cliquez sur "Execute Workflow"
3. Surveillez l'exécution en temps réel
4. Consultez les résultats dans l'historique

## Configuration des Agents

### Agent Search Content (Perplexity)

**Modèle :** `llama-3.1-sonar-large-128k-online`

**Fonction :**
- Analyse le contenu de votre site
- Identifie les lacunes dans votre stratégie de contenu
- Propose 3-5 sujets d'articles avec brief complet

**Paramètres modifiables :**
- URL du site à analyser
- Nombre de sujets à proposer
- Critères de sélection des sujets

### Agent Ghostwriting (GPT-4)

**Modèle :** `gpt-4`

**Fonction :**
- Rédige des articles complets (800-2000 mots)
- Optimise pour le SEO
- Structure l'article avec titres et sous-titres
- Inclut meta-description et suggestions d'images

**Paramètres modifiables :**
- Longueur cible de l'article
- Ton et style de rédaction
- Niveau de technicité

### Agent Review Content (Claude-3)

**Modèle :** `claude-3-sonnet-20240229`

**Fonction :**
- Évalue la qualité de l'article (/100)
- Fournit un score détaillé par critère
- Propose des améliorations spécifiques
- Suggère des actions correctives

**Critères d'évaluation :**
- Qualité rédactionnelle (25 pts)
- Pertinence du contenu (20 pts)
- Optimisation SEO (20 pts)
- Structure et lisibilité (15 pts)
- Engagement potentiel (10 pts)
- Respect du brief (10 pts)

## Personnalisation des Prompts

### Dans l'interface Web

1. Allez sur la page Workflow
2. Cliquez sur "Prompt" pour l'agent souhaité
3. Modifiez les instructions selon vos besoins
4. Sauvegardez les changements

### Dans n8n

1. Ouvrez le workflow
2. Double-cliquez sur le nœud de l'agent
3. Modifiez le contenu du message system
4. Sauvegardez le workflow

## Exemples de Prompts Personnalisés

### Pour un blog technique

```
Tu es un rédacteur technique spécialisé en [VOTRE DOMAINE].

Critères spécifiques :
- Inclure des exemples de code
- Ajouter des schémas techniques
- Citer les sources officielles
- Utiliser un ton expert mais accessible
```

### Pour un blog marketing

```
Tu es un expert en marketing digital.

Critères spécifiques :
- Inclure des statistiques récentes
- Ajouter des call-to-action percutants
- Optimiser pour la conversion
- Utiliser un ton persuasif et engageant
```

## Monitoring et Analytics

### Suivi des Performances

- **Taux de succès** : Pourcentage d'exécutions réussies
- **Score moyen** : Score qualité moyen des articles
- **Temps d'exécution** : Durée moyenne du workflow

### Logs et Debug

- Consultez les logs dans n8n pour diagnostiquer les erreurs
- Vérifiez la validité de vos clés API
- Surveillez les quotas d'utilisation des APIs

## Intégrations Avancées

### Webhook de Notification

Configurez un webhook pour recevoir les résultats :
```bash
POST /webhook/content-results
{
  "topic": {...},
  "article": {...},
  "review": {...},
  "timestamp": "2024-09-24T21:00:00Z"
}
```

### Base de Données

Ajoutez un nœud pour sauvegarder automatiquement les résultats dans votre base de données.

### Publication Automatique

Intégrez avec votre CMS pour publier automatiquement les articles avec un score > 80.

## Dépannage

### Erreurs Communes

1. **API Key invalide** : Vérifiez vos clés API dans les variables d'environnement
2. **Quota dépassé** : Surveillez vos limites d'utilisation
3. **Timeout** : Augmentez le timeout pour les longs articles
4. **Format JSON** : Vérifiez que les réponses des agents sont au bon format

### Support

- Documentation n8n : https://docs.n8n.io
- Issues GitHub : Créez un ticket pour les bugs
- Discord communauté : Support communautaire

## Licence

Ce workflow est fourni sous licence MIT. Vous pouvez l'utiliser et le modifier librement.