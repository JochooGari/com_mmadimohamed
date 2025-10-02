/**
 * Point d'entrée centralisé pour tous les services
 * Détection automatique de l'environnement (dev/prod)
 */

// Import de tous les services
import { aiService as aiServiceDev } from './AIService_dev.jsx';
import { aiService as aiServiceProd } from './AIService_prod.jsx';
// Si vous copiez également Data/YouTube services, importez-les ici
// import { dataService as dataServiceDev } from './DataService_dev.jsx';
// import { dataService as dataServiceProd } from './DataService_prod.jsx';
// import { youtubeService as youtubeServiceDev } from './YouTubeService_dev.jsx';
// import { youtubeService as youtubeServiceProd } from './YouTubeService_prod.jsx';

// Détection automatique de l'environnement
const detectEnvironment = () => {
  // 1. Vérifier l'URL pour détecter les pages dev/prod
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('_dev') || currentPath.includes('dev')) {
    console.log('🔧 Environnement détecté: DÉVELOPPEMENT');
    return 'development';
  }
  
  if (currentPath.includes('_prod') || currentPath.includes('prod')) {
    console.log('🚀 Environnement détecté: PRODUCTION');
    return 'production';
  }
  
  // 2. Vérifier les variables d'environnement
  if (import.meta.env.DEV) {
    console.log('🔧 Environnement détecté: DÉVELOPPEMENT (Vite DEV)');
    return 'development';
  }
  
  if (import.meta.env.PROD) {
    console.log('🚀 Environnement détecté: PRODUCTION (Vite PROD)');
    return 'production';
  }
  
  // 3. Fallback vers développement par défaut
  console.log('🔧 Environnement par défaut: DÉVELOPPEMENT');
  return 'development';
};

// Sélection des services selon l'environnement
const environment = detectEnvironment();

const aiService = environment === 'development' ? aiServiceDev : aiServiceProd;
// const dataService = environment === 'development' ? dataServiceDev : dataServiceProd;
// const youtubeService = environment === 'development' ? youtubeServiceDev : youtubeServiceProd;

console.log(`📦 Services ${environment.toUpperCase()} chargés`);

// Export des services sélectionnés
export { aiService };

// Export des services communs si copiés
export { transformationService } from './TransformationService';
export { strategyService } from './StrategyService';
export { businessIntelligenceService } from './BusinessIntelligenceService';

// Configuration centralisée des services (exemple minimal)
export const ServiceConfig = {
  environment: environment,
  
  api: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || (environment === 'development' ? 'http://localhost:3003' : 'https://api.your-domain.com'),
    timeout: environment === 'development' ? 45000 : 30000,
    retries: environment === 'development' ? 5 : 3
  },
  
  ai: {
    provider: 'openai',
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      enableExperimentalFeatures: environment === 'development',
      debugMode: environment === 'development'
    }
  }
};


