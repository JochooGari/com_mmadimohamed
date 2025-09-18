## Documentation de la page web (Portfolio / Bibliothèque de ressources)

Cette documentation décrit la structure, le fonctionnement et les points d’extension de la page web du portfolio, à partir du code présent dans `src/`.

### Aperçu fonctionnel
- **Sections** affichées dans l’ordre (gérées par `src/App.tsx`) :
  - `Header` (navigation fixe)
  - `Hero` (accueil)
  - `Expertise`
  - `Blog`
  - `Resources` (section « Bibliothèque »)
  - `Contact`
  - `Footer`
- **Ancrages de navigation** utilisés par le menu: `#accueil`, `#expertise`, `#blog`, `#bibliotheque`, `#contact`.
- **Contenu éditable** en ligne via le contexte global (`ContentContext`) et le composant `EditableText`.

## Architecture et données

### Composition de la page
- Fichier: `src/App.tsx`
  - Enveloppe toute la page avec `ContentProvider` pour exposer le contenu et le mode édition.
  - Compose les sections: `Header`, `Hero`, `Expertise`, `Blog`, `Resources`, `Contact`, `Footer`.

### Gestion de contenu et édition
- Fichiers: `src/context/ContentContext.tsx`, `src/types/content.ts`, `src/data/defaultContent.ts`
  - `ContentProvider` fournit: `content`, `setContent`, `isEditing`, `setIsEditing`.
  - Le schéma des données est défini dans `src/types/content.ts` avec des interfaces fortement typées (`PortfolioContent`, `Resource`, etc.).
  - Les valeurs par défaut (textes, billets de blog, ressources) sont dans `src/data/defaultContent.ts`.
- Édition inline:
  - `EditableText` commute entre affichage en lecture et champs `input`/`textarea` quand `isEditing` est actif.
  - `EditorToggle` permet d’activer/désactiver le mode édition.

## En-tête et navigation

### `Header` (`src/components/Header.tsx`)
- Barre fixe en haut de l’écran avec opacité animée (Framer Motion).
- Menu basé sur `navigationItems` (ids/hrefs vers les sections).
- Mise en évidence de la section active via `IntersectionObserver` (seuil 0.3, `rootMargin` adapté) et mise à jour d’état `activeSection`.
- Défilement fluide vers les sections avec un **offset de 80 px** (`scrollToSection`).
- Version mobile: menu déroulant, bouton hamburger avec `aria-label`.
- Bouton d’action rapide « Me contacter » qui scrolle vers `#contact`.

## Section Bibliothèque de ressources

### `Resources` (`src/components/Resources.tsx`)
- Section HTML: `<section id="bibliotheque">`.
- En-tête éditable:
  - `resourcesTitle` (par défaut: « Bibliothèque de Ressources »)
  - `resourcesSubtitle` (par défaut: « Guides, templates et outils gratuits… »)
- Grille responsive (Tailwind) listant `content.resources`.
- Chaque carte (Shadcn UI `Card`) affiche:
  - `resource.category` en `Badge` (ex: PDF, PBIX, Excel, DAX)
  - `resource.type` (Guide, Template, Tool)
  - `resource.title`, `resource.description`
  - `resource.downloadCount` avec une icône `Users`
  - Un bouton « Télécharger » avec icône `Download` (action à brancher)
- Appel à l’action en pied de section: bouton « Voir toute la bibliothèque » avec icône `BookOpen`.
- Animations d’apparition avec `framer-motion` (délais progressifs par carte).

### Schéma d’une ressource (`src/types/content.ts`)
```ts
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'tool';
  fileUrl: string;
  downloadCount: number;
  featured: boolean;
  category: string;
}
```

### Exemples de ressources par défaut (`src/data/defaultContent.ts`)
```ts
{
  id: 'resource-1',
  title: 'Guide complet Power BI',
  description: 'Manuel de 50 pages couvrant toutes les fonctionnalités essentielles',
  type: 'guide',
  category: 'PDF',
  fileUrl: '#',
  downloadCount: 2300,
  featured: true
}
```

### Brancher le bouton « Télécharger »
- Actuellement, le bouton est visuel. Pour télécharger un fichier:
  - Renseigner `fileUrl` (lien vers le fichier ou endpoint).
  - Remplacer le `Button` par un lien ou gérer un `onClick`:
```tsx
<Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0">
  <a href={resource.fileUrl} download>
    <Download className="w-4 h-4 mr-1" /> Télécharger
  </a>
</Button>
```

## Design system, animations et icônes
- **UI**: composants Shadcn (boutons, cartes, badges) depuis `src/components/ui/*`.
- **Styles**: classes Tailwind (ex: `container`, `grid`, `text-slate-...`).
- **Animations**: `framer-motion` pour les entrées en vue (`whileInView`, `viewport.once`).
- **Icônes**: `lucide-react` (`Download`, `Users`, `BookOpen`).

## Accessibilité et UX
- Bouton hamburger avec `aria-label` (« Ouvrir le menu »).
- Contrastes et tailles de police cohérents.
- Navigation clavier conservée (les éléments interactifs sont des `button`/`a`).
- Sections balisées avec `id` pour un ancrage clair.

## Points d’extension
- **Ajouter une ressource**: étendre le tableau `resources` dans `defaultContent.ts` ou implémenter une source de données distante, puis mettre à jour le contexte.
- **Relier le téléchargement**: pointer `fileUrl` vers un CDN ou un fichier public et utiliser `download`.
- **Filtrer/chercher**: ajouter un état local et filtrer `content.resources` selon `type`/`category`.
- **Plein écran / page dédiée**: router vers une page « Bibliothèque » complète via un framework de routing si besoin.

## Dépendances majeures
- React, TypeScript
- Tailwind CSS
- framer-motion
- lucide-react

## Démarrage rapide (rappel)
- Installer les dépendances: `npm install` ou `yarn`.
- Lancer en local: `npm run dev` (Vite).
- Construire: `npm run build` puis servir le contenu de `dist/`.

## Résumé
- La page est pilotée par un **contexte de contenu** éditable, fortement typé.
- La **Bibliothèque** rend une grille animée de ressources avec badges, compteur de téléchargements et CTA.
- La **navigation** met en surbrillance la section courante et gère un défilement à offset.


