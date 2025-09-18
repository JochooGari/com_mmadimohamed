import { StrictMode } from 'react';
// Force light mode by removing dark class and preventing it from being added
document.documentElement.classList.remove('dark');

// Override the system preference detection
const forceLightMode = () => {
  // Always set dark mode to false regardless of localStorage or system preference
  document.documentElement.classList.toggle(
    'dark',
    false // Force to false instead of checking localStorage or system preference
  );
};

// Run immediately
forceLightMode();

// Also run when the DOM is loaded to ensure it applies
document.addEventListener('DOMContentLoaded', forceLightMode);

// Override system preference changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', forceLightMode);

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trackPageview } from './lib/analytics';

// Importer et exposer les fonctions de migration
import { migrateTolocalStorage } from './lib/webStorage';
import { migrateToLocalStorageFixed, SimpleMigrator } from './lib/simpleMigration';
import { BrowserFileStorage } from './lib/browserStorage';
import { migrateRealDataToIndexedDB, verifyMigratedData } from './lib/migrateRealData';

// Exposer globalement pour utilisation depuis la console
(window as any).migrateTolocalStorage = migrateTolocalStorage;
(window as any).migrateToLocalStorageFixed = migrateToLocalStorageFixed;
(window as any).BrowserFileStorage = BrowserFileStorage;
(window as any).SimpleMigrator = SimpleMigrator;
(window as any).migrateRealDataToIndexedDB = migrateRealDataToIndexedDB;
(window as any).verifyMigratedData = verifyMigratedData;

const queryClient = new QueryClient();

// Inject analytics (Plausible) when configured
try {
  const domain = (import.meta as any).env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  if (domain && typeof document !== 'undefined') {
    const s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', domain);
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
    // record initial pageview when ready
    window.addEventListener('load', () => trackPageview());
  }
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
