# 🚀 Guide de Test - Éditeur IA Amélioré

## 📋 Étapes de Test Local

### 1. Vérification des Dépendances

```bash
cd magicpath-project
npm install
```

### 2. Démarrage du Serveur de Développement

```bash
# Terminal 1 : Frontend Vite
npm run dev

# Terminal 2 : API Backend (si nécessaire pour les fonctions IA)
vercel dev --yes --confirm --port 3000
```

### 3. Accès à l'Interface

1. **Ouvrir** : http://localhost:5174
2. **Aller sur** : `/admin`
3. **Se connecter** (si authentification requise)
4. **Cliquer sur** : "Éditeur IA Amélioré" (bouton violet en haut à droite)

## 🧪 Tests à Effectuer

### ✅ **Test 1 : Layout et Navigation**
- [ ] Vérifier l'affichage 3 colonnes
- [ ] Tester les boutons de basculement des panneaux (œil)
- [ ] Activer/désactiver le mode focus et zen
- [ ] Vérifier la responsivité mobile

### ✅ **Test 2 : Panneau Gauche - Structure**
- [ ] Écrire du contenu avec des titres `## H2` et `### H3`
- [ ] Vérifier que l'arborescence se génère automatiquement
- [ ] Tester le drag & drop des sections
- [ ] Utiliser les templates de la bibliothèque
- [ ] Insérer des snippets

### ✅ **Test 3 : Éditeur Central**
- [ ] Saisir titre, description, contenu
- [ ] Utiliser les raccourcis : **Ctrl+B** (gras), **Ctrl+I** (italique), **Ctrl+K** (lien)
- [ ] Tester l'aperçu markdown
- [ ] Vérifier les compteurs de mots/caractères
- [ ] Observer les suggestions d'amélioration

### ✅ **Test 4 : Chat IA Assistant**
- [ ] Envoyer un message simple
- [ ] Tester les commandes slash : `/seo`, `/geo`, `/expand`
- [ ] Utiliser les boutons d'actions rapides
- [ ] Appliquer une suggestion IA au contenu

### ✅ **Test 5 : Scoring SEO**
- [ ] Observer le score SEO se mettre à jour en temps réel
- [ ] Vérifier les métriques : mots-clés, lisibilité, structure
- [ ] Corriger les problèmes détectés
- [ ] Utiliser les actions rapides d'optimisation

### ✅ **Test 6 : Scoring GEO**
- [ ] Vérifier le score GEO (moteurs génératifs)
- [ ] Observer le potentiel Featured Snippet
- [ ] Appliquer les optimisations automatiques
- [ ] Tester les formats recommandés (listes, tableaux, FAQ)

### ✅ **Test 7 : Analytics & Insights**
- [ ] Explorer l'analyse concurrentielle
- [ ] Vérifier les suggestions de mots-clés
- [ ] Observer les tendances et métriques de performance

## 🔧 Dépannage Courant

### Erreur de Compilation

Si vous obtenez des erreurs TypeScript :

```bash
# Nettoyer le cache
rm -rf node_modules/.vite
npm run dev
```

### Composants Non Trouvés

Si des imports échouent, vérifiez que tous les fichiers sont créés :

```bash
# Vérifier la structure
ls -la src/components/admin/enhanced-editor/
ls -la src/components/admin/enhanced-editor/LeftPanel/
ls -la src/components/admin/enhanced-editor/CenterEditor/
ls -la src/components/admin/enhanced-editor/RightPanel/
```

### Problèmes de Style

Si les styles ne s'affichent pas correctement :

```bash
# Redémarrer le serveur
npm run dev
```

## 📱 Tests Mobile

1. **Ouvrir** les DevTools (F12)
2. **Activer** le mode appareil mobile
3. **Tester** sur différentes tailles :
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1200px+)

## 🚨 Points d'Attention

### Performance
- [ ] Temps de chargement < 2 secondes
- [ ] Réactivité des interactions
- [ ] Autosave fonctionne sans lag

### Accessibilité
- [ ] Navigation au clavier
- [ ] Contraste des couleurs
- [ ] Aria labels présents

### Fonctionnalités IA
- [ ] Réponses du chat cohérentes
- [ ] Scoring se met à jour correctement
- [ ] Suggestions pertinentes

## 📝 Données de Test

Voici du contenu de test à utiliser :

**Titre :** "Guide Complet du Marketing Digital en 2024"

**Description :** "Découvrez les stratégies marketing digital les plus efficaces pour 2024. Guide pratique avec exemples, outils et techniques éprouvées."

**Contenu Markdown :**
```markdown
# Guide Complet du Marketing Digital en 2024

Le marketing digital évolue constamment. En 2024, les entreprises doivent adapter leurs stratégies pour rester compétitives.

## Qu'est-ce que le Marketing Digital ?

Le marketing digital désigne l'ensemble des techniques marketing utilisées sur les supports et canaux digitaux.

## Les Tendances 2024

### 1. Intelligence Artificielle
L'IA révolutionne la création de contenu et la personnalisation.

### 2. Video Marketing
Les contenus vidéo génèrent 1200% de partages en plus que les textes.

### 3. Marketing Automation
L'automatisation permet d'optimiser les conversions de 30%.

## FAQ

### Combien coûte une stratégie marketing digital ?
Le budget varie entre 5000€ et 50000€ selon la taille de l'entreprise.

### Quels outils utiliser ?
- Google Analytics
- HubSpot
- Mailchimp
- Canva

## Conclusion

Le marketing digital en 2024 nécessite une approche data-driven et centrée sur l'expérience utilisateur.
```

## 🎯 Résultats Attendus

Après les tests, vous devriez observer :

- **Score SEO** : 75-85/100 avec le contenu test
- **Score GEO** : 70-80/100 avec les optimisations
- **Chat IA** : Réponses contextuelles pertinentes
- **Interface** : Fluide et responsive sur tous appareils

## 🚀 Validation Finale

Avant mise en production, vérifier :

- [ ] Tous les tests passent
- [ ] Aucune erreur console
- [ ] Performance acceptable
- [ ] Sauvegarde fonctionne
- [ ] Retour interface classique possible

## 📞 Support

En cas de problème :
1. Vérifier la console navigateur (F12)
2. Contrôler les logs du serveur
3. Tester sur un autre navigateur
4. Vider le cache navigateur

**Interface prête pour la production ! 🎉**