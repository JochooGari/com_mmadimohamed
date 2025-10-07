# Bibliothèque Power BI - Documentation

## Vue d'ensemble

La **Bibliothèque Power BI** est une fonctionnalité avancée du site portfolio permettant aux visiteurs de découvrir, filtrer et télécharger des dashboards Power BI professionnels organisés par domaine d'expertise.

---

## 🎯 Objectifs

- Offrir une bibliothèque de ressources Power BI avec système de filtrage avancé (inspiré d'Envato Elements)
- Permettre aux utilisateurs de découvrir des dashboards par **topic**, **persona** et **sous-topic**
- Faciliter le téléchargement de fichiers `.pbix` et `.pbit`
- Tracker les métriques d'engagement (vues, téléchargements, notes)

---

## 📋 Structure des données

### Base de données Supabase

**Tables principales:**

1. **`powerbi_dashboards`** - Dashboards Power BI
2. **`dashboard_kpis`** - KPIs associés à chaque dashboard
3. **`dashboard_ratings`** - Notes et commentaires utilisateurs
4. **`dashboard_downloads`** - Tracking des téléchargements

### Migration SQL

Le schéma complet est disponible dans:
```
supabase/migrations/20250930_powerbi_dashboards.sql
```

Pour appliquer la migration:

**Option A - Dashboard Supabase:**
1. Ouvrir le SQL Editor
2. Copier-coller le contenu de la migration
3. Exécuter

**Option B - CLI:**
```bash
supabase db push
```

---

## 🏗️ Architecture Frontend

### Structure des fichiers

```
src/
├── types/
│   └── powerbi-dashboard.ts          # Types TypeScript
├── components/
│   └── powerbi/
│       ├── PowerBILibrary.tsx        # Composant principal
│       ├── FiltersSidebar.tsx        # Sidebar de filtrage
│       └── DashboardCard.tsx         # Card d'un dashboard
├── data/
│   └── mock-powerbi-dashboards.ts    # Données de démo
└── components/generated/
    └── PortfolioSite.tsx             # Intégration dans le portfolio
```

### Composants clés

#### 1. **PowerBILibrary** (Composant principal)
- Gestion du state des filtres
- Filtrage et tri des dashboards
- Vue grille/liste
- Responsive mobile avec sheet

#### 2. **FiltersSidebar**
- Filtres par Topic (Finance, Comptabilité, Sales, Marketing, Supply Chain)
- Filtres par Persona (CFO, Expert-Comptable, etc.)
- Sous-topics dynamiques selon le topic sélectionné
- Filtres additionnels: Complexité, Type de visualisation, Date, Popularité

#### 3. **DashboardCard**
- Thumbnail avec badge topic
- Métadonnées: vues, téléchargements, rating
- Tags de sous-topics
- Actions: Voir plus / Télécharger

---

## 📊 Taxonomie

### Topics disponibles

| Topic | Icon | Couleur | Personas |
|-------|------|---------|----------|
| **Finance** | 📊 | #8B5CF6 (Violet) | CFO, Directeur Financier, Contrôleur de Gestion |
| **Comptabilité** | 💼 | #3B82F6 (Bleu) | Expert-Comptable, Comptable, DAF |
| **Sales** | 📈 | #10B981 (Vert) | Directeur Commercial, Sales Manager |
| **Marketing** | 🎯 | #F59E0B (Orange) | CMO, Marketing Manager, Growth Hacker |
| **Supply Chain** | 📦 | #EF4444 (Rouge) | Supply Chain Manager, Logisticien |

### Sous-topics par topic

**Finance:**
- Valorisation d'entreprise
- Analyse de rentabilité
- Budget vs Réalisé
- Cash Flow Management
- Analyse des coûts

**Comptabilité:**
- Analyse des stocks
- Balance âgée
- Grand livre & Balance générale
- Rapprochement bancaire
- Immobilisations

**Sales:**
- Pipeline commercial
- Performance par vendeur
- Analyse géographique
- Customer Lifetime Value
- Win/Loss Analysis

**Marketing:**
- Performance des campagnes
- Analyse du funnel
- SEO & Analytics
- Social Media Performance
- Email Marketing

**Supply Chain:**
- Gestion des stocks
- Performance fournisseurs
- Analyse des achats
- Prévisions de demande
- Logistique & Transport

---

## 🎨 Design System

### Couleurs

```css
/* Primary */
--primary: #00A99D;         /* Turquoise (brand) */
--primary-dark: #008A7E;
--primary-light: #E6F7F5;

/* Topics */
--finance: #8B5CF6;         /* Violet */
--comptabilite: #3B82F6;    /* Blue */
--sales: #10B981;           /* Green */
--marketing: #F59E0B;       /* Orange */
--supply-chain: #EF4444;    /* Red */

/* Complexity */
--debutant: #10B981;        /* Green */
--intermediaire: #F59E0B;   /* Orange */
--avance: #EF4444;          /* Red */
```

### Typography
- **Headings:** Inter / Plus Jakarta Sans
- **Body:** Inter
- **Code:** Fira Code

---

## 🚀 Les 5 Dashboards disponibles

### 1. 📊 Analyse des Stocks (Comptabilité)
**Complexité:** Intermédiaire
**KPIs:**
- Valeur totale du stock
- Rotation des stocks (jours)
- Stock mort (> 180 jours)
- Couverture stock (mois)

**Mesures DAX clés:**
```dax
Rotation Stock = DIVIDE([Coût des ventes], [Stock moyen], 0)
Jours de Stock = 365 / [Rotation Stock]
Stock Mort = CALCULATE([Valeur Stock], FILTER(Stocks, Stocks[DernierMouvement] < TODAY() - 180))
```

---

### 2. 💰 Valorisation d'Entreprise (Finance)
**Complexité:** Avancé
**KPIs:**
- Valeur d'entreprise (EV)
- Multiple EV/EBITDA
- DCF (Discounted Cash Flow)
- Comparables sectoriels

**Mesures DAX clés:**
```dax
EV = [Market Cap] + [Dette nette] - [Trésorerie]
Multiple EBITDA = DIVIDE([EV], [EBITDA], BLANK())
DCF = SUMX(Periodes, DIVIDE([Free Cash Flow], POWER(1 + [WACC], Periodes[Année]))) + [Terminal Value]
```

---

### 3. 🎯 Pipeline Commercial (Sales)
**Complexité:** Intermédiaire
**KPIs:**
- Pipeline total
- Taux de conversion
- Durée moyenne du cycle
- Forecast vs Quota

**Mesures DAX clés:**
```dax
Win Rate = DIVIDE(CALCULATE(COUNT(Opportunités[ID]), Opportunités[Statut] = "Won"), COUNT(Opportunités[ID]), 0)
Forecast Pondéré = SUMX(Opportunités, Opportunités[Montant] * Opportunités[Probabilité %])
```

---

### 4. 📣 Performance Campagnes Marketing
**Complexité:** Intermédiaire
**KPIs:**
- ROAS (Return on Ad Spend)
- CAC (Customer Acquisition Cost)
- Conversion Rate par canal
- ROI Marketing

**Mesures DAX clés:**
```dax
ROAS = DIVIDE([Revenus générés], [Dépenses publicitaires], 0)
CAC = DIVIDE([Coûts Marketing totaux], [Nouveaux clients], 0)
Conversion Rate = DIVIDE([Nombre de conversions], [Nombre de visiteurs], 0) * 100
```

---

### 5. 💵 Tableau de Bord CFO (Finance)
**Complexité:** Avancé
**KPIs:**
- Chiffre d'affaires
- EBITDA & Marge
- Cash Flow
- Working Capital

**Mesures DAX clés:**
```dax
EBITDA = [Revenus] - [Coûts opérationnels]
Marge EBITDA % = DIVIDE([EBITDA], [Revenus], 0)
Working Capital = [Actif circulant] - [Passif circulant]
Free Cash Flow = [EBITDA] - [Capex] - [Variation Working Capital] - [Impôts]
```

---

## 🔧 Utilisation

### Intégration dans le Portfolio

Le composant est intégré dans `PortfolioSite.tsx`:

```tsx
import { PowerBILibrary } from "@/components/powerbi/PowerBILibrary";
import { mockDashboards } from "@/data/mock-powerbi-dashboards";

// Dans la section Bibliothèque
<PowerBILibrary dashboards={mockDashboards} />
```

### Filtrage

Les filtres sont automatiquement appliqués via l'interface `DashboardFilters`:

```typescript
interface DashboardFilters {
  search?: string;
  topics?: DashboardTopic[];
  personas?: string[];
  sub_topics?: string[];
  complexity?: DashboardComplexity[];
  visualization_types?: string[];
  date_added?: 'week' | 'month' | 'quarter';
  sort_by?: 'recent' | 'popular' | 'downloads' | 'rating';
}
```

### Ajout d'un nouveau dashboard

1. Créer l'entrée dans Supabase ou `mock-powerbi-dashboards.ts`
2. Respecter l'interface `PowerBIDashboard`
3. Ajouter les KPIs, mesures DAX, screenshots
4. Publier (`published: true`)

---

## 📈 Métriques & Analytics

### Tracking automatique

- **Vues:** Incrémentées lors de l'ouverture d'une page détail
- **Téléchargements:** Tracés dans `dashboard_downloads`
- **Ratings:** Moyenne calculée automatiquement via trigger SQL

### Functions Supabase

```sql
-- Incrémenter les vues
SELECT increment_dashboard_views('uuid-du-dashboard');

-- Incrémenter les téléchargements
SELECT increment_dashboard_downloads('uuid-du-dashboard');
```

---

## 🎯 Prochaines étapes (Roadmap)

### Phase 2 - Enhancements
- [ ] Page détaillée d'un dashboard (route `/bibliotheque/[slug]`)
- [ ] Système de notation/reviews
- [ ] Recherche full-text avec highlight
- [ ] Preview interactif embedded (Power BI Embedded)
- [ ] Système de téléchargement avec email opt-in

### Phase 3 - Scale
- [ ] CMS headless pour gestion contenu (Strapi/Payload)
- [ ] 20+ dashboards supplémentaires
- [ ] Système de suggestions ML
- [ ] Analytics avancés (heatmaps, user journey)
- [ ] Export en PDF de la documentation

---

## 🐛 Troubleshooting

### Les images ne s'affichent pas
- Vérifier que les URLs dans `thumbnail_url` et `screenshots` sont valides
- S'assurer que les assets sont dans `/public/images/dashboards/`

### Les filtres ne fonctionnent pas
- Vérifier que les dashboards ont bien les champs `topic`, `sub_topics`, `personas` remplis
- S'assurer que les valeurs correspondent aux enums définis dans les types

### Erreur de build TypeScript
- Vérifier que tous les imports sont corrects
- S'assurer que `powerbi-dashboard.ts` est bien dans `src/types/`

---

## 📚 Ressources

### Documentation Power BI
- [Microsoft Power BI Docs](https://learn.microsoft.com/power-bi/)
- [DAX Guide](https://dax.guide/)
- [SQLBI.com](https://www.sqlbi.com/) - Best practices

### Inspiration Design
- [Envato Elements](https://elements.envato.com/) - Filtrage et layout
- [Dribbble](https://dribbble.com/tags/power-bi) - UI/UX dashboards
- [Behance](https://www.behance.net/search/projects/power%20bi) - Showcases

---

## 🤝 Contribution

Pour ajouter un nouveau dashboard ou améliorer la bibliothèque:

1. Créer une branche `feature/powerbi-dashboard-[nom]`
2. Ajouter les données dans `mock-powerbi-dashboards.ts`
3. Ajouter les assets (images) dans `/public/images/dashboards/`
4. Tester le filtrage et l'affichage
5. Créer une PR avec screenshots

---

## 📧 Contact

Pour toute question sur la bibliothèque Power BI:
**Email:** contact@mmadimohamed.fr

---

**Dernière mise à jour:** 2024-10-07
**Version:** 1.0.0 (MVP)
