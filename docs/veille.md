Veille LinkedIn/Web — Mode d’emploi

Objectif
Collecter automatiquement les posts les plus engageants et les contenus d’autorité (data, finance, marketing) + indexer les articles/ressources du site. Dédupliquer, analyser et nourrir l’Agent LinkedIn pour proposer des posts à forte valeur.

Lancer un cycle
- UI: Admin → LinkedIn Agent → onglet `Veille` → bouton « Lancer Veille »
- API: POST `/api/monitoring` avec `{ "action": "run_now" }`
- Résultats: `data/monitoring/`
  - `sources/` contenus bruts
  - `optimized/` contenus optimisés (résumé, keywords, topics…)
  - `monitoring_index.json` index global (stats)
  - `reports/` rapports quotidiens

Configuration (optionnelle)
Fichier `data/monitoring/config.json`:
```
{
  "linkedin": {
    "postUrls": [
      "https://www.linkedin.com/posts/...",
      "https://www.linkedin.com/posts/..."
    ]
  },
  "rss": { "feeds": ["https://hbr.org/feed", "https://blog.hubspot.com/feed.xml"] },
  "websites": { "urls": ["https://ton-domaine"] }
}
```
Variables d’environnement utiles:
```
SITE_URL=https://ton-domaine   # permet de crawler /sitemap.xml
VITE_OPENAI_API_KEY=sk-...     # requis pour le Chat IA (pas de fallback)
```

Fonctionnement
- LinkedIn: collecte basique depuis des URLs publiques de posts (titre/description/auteur, métriques si détectables). Déduplication par URL.
- RSS: parsing basique des items (titre, lien, description, pubDate).
- Site web: lecture `SITE_URL/sitemap.xml`, fetch des pages, extraction du texte (HTML→texte).
- Optimisation: résumé, keywords, topics, sentiment, pertinence, tags automatiques, similarité inter‑contenus.

Anti‑doublons
- Déduplication par URL au moment de la collecte.
- Similarité par mots‑clés pour éviter de reproposer des posts quasi identiques.

Autorités et Top posts
- Les rapports (`data/monitoring/reports/`) agrègent les top sources/auteurs et les tendances mots‑clés.
- Ces données alimentent le générateur de posts et le Chat de vérification IA.

Prochaines évolutions
- Connecteur LinkedIn authentifié (si clé/cookies fournis côté serveur).
- Enrichissement des métriques d’engagement (likes/comments/shares) via API tierces.
- Classement de posts par secteur/persona + détection de doublons multi‑canaux.


