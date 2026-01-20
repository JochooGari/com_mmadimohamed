# 🎯 LinkedIn Agent Multi-Agents - Guide Rapide

## ✅ Installation Complète

### Étape 1: Créer la table Supabase

Exécute le script SQL dans Supabase Dashboard > SQL Editor:

```bash
magicpath-project/supabase/migrations/20250120_linkedin_posts_multi_agent.sql
```

### Étape 2: Accéder à la nouvelle interface

**Depuis le module LinkedIn Agent**:
1. Va sur `/admin/linkedin-agent`
2. Clique sur le bouton **"Nouvelle Interface"** (entre Mode Co-pilot et Mode Auto-pilot)

**OU directement**:
- Dashboard: `/admin/linkedin/dashboard`
- Posts: `/admin/linkedin/posts`

## 🚀 Utilisation Rapide

### Dashboard Command Center
- Vue d'ensemble des KPIs (posts à traiter, commentaires today, leads)
- Hot opportunities avec bouton vers Focus Mode
- Performance des 3 agents (Claude, GPT-4o, Gemini)
- Bouton "Lancer scraping" pour déclencher le workflow n8n

### Posts à Engager
**Mode Liste**:
- Filtres: statut, catégorie, score, lead priority
- Recherche par nom, contenu, headline
- Bouton "Mode Focus" sur chaque carte

**Mode Focus** (Tinder pour LinkedIn):
- Un post à la fois en plein écran
- Agent Arena: compare les 3 agents en onglets
- Keyboard shortcuts:
  - `1` - Approuver & copier dans le presse-papier
  - `2` - Éditer le commentaire
  - `3` - Passer (skip)
  - `←` `→` - Navigation précédent/suivant
- Navigation automatique vers le post suivant après action

## 🤖 Fonctionnalités Multi-Agents

### Agent Arena
Affiche côte à côte les 3 agents:
- **Claude Sonnet 4.5** 🧠
- **GPT-4o** 🤖
- **Gemini 2.0 Flash** 🌟

Pour chaque agent:
- Score de pertinence (0-10)
- Commentaire suggéré
- Analyse détaillée
- Lead opportunity (si détecté)
- Mots-clés identifiés
- Temps de réponse

### Système de Vote Majoritaire
- **is_lead_opportunity**: 2 agents sur 3 minimum doivent être d'accord
- **relevance_score**: Moyenne des 3 scores
- **selected_agent**: L'agent avec le meilleur score est pré-sélectionné

## 📊 Structure des Données

### Table `linkedin_posts`

Colonnes principales:
- `agents_responses` (JSONB): Réponses des 3 agents
- `selected_agent`: Agent choisi par l'utilisateur
- `user_edited_comment`: Commentaire édité manuellement
- `comment_status`: pending, edited, posted, skipped

Exemple `agents_responses`:
```json
{
  "claude": {
    "relevance_score": 9,
    "suggested_comment": "...",
    "is_lead_opportunity": true,
    "lead_priority": "high",
    "response_time_ms": 1250
  },
  "gpt4o": { ... },
  "gemini": { ... }
}
```

## 🔄 Workflow n8n

Pour alimenter la table avec de nouveaux posts:

1. **Scraping**: Bright Data ou PhantomBuster
2. **Analyse Multi-Agents**: Appels parallèles à Claude, GPT-4o, Gemini
3. **Merge**: Node 7 avec vote majoritaire
4. **Insert**: Supabase avec `agents_responses` JSONB

Webhook: `VITE_N8N_SCRAPING_WEBHOOK` dans `.env.local`

## 💡 Tips & Tricks

### Traiter 15 posts en 5 minutes
1. Utilise le Mode Focus
2. Utilise les keyboard shortcuts (1, 2, 3)
3. Pré-filtre avec `?filter=high_priority`
4. L'agent gagnant est déjà pré-sélectionné

### Deep Linking
```
/admin/linkedin/posts?focus=POST_ID&filter=high_priority
```

Utile pour:
- Naviguer directement vers un post depuis une notification
- Partager un lien avec l'équipe
- Bookmarker les hot opportunities

### Édition Rapide
1. Clique sur un onglet d'agent pour voir son commentaire
2. Clique "Éditer" pour modifier
3. Le commentaire édité est sauvegardé dans `user_edited_comment`

## 🐛 Troubleshooting

**"Failed to fetch posts"**
→ Vérifie que la migration SQL a été exécutée

**"Copy to clipboard failed"**
→ Teste sur localhost ou HTTPS (Clipboard API nécessite un contexte sécurisé)

**Keyboard shortcuts ne fonctionnent pas**
→ Assure-toi d'être en Mode Focus (pas en mode Liste)

## 📞 Support

- Guide complet: `DEPLOY-LINKEDIN-AGENT-UI.md`
- PRD technique: `PRD - LinkedIn Automation Engine V2.1.md`
- Workflow n8n: `workflow-n8n/README-WORKFLOW-SECTIONAL.md`

---

**Version**: 1.0.0 | **Dernière mise à jour**: 20 janvier 2025
