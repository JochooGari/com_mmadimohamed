/**
 * Configuration des ports pour le frontend
 * Système de basculement automatique entre ports disponibles
 */

// Plage de ports supportés
const FRONTEND_PORTS = [5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 5185, 5186, 5187, 5188, 5189, 5190];
const BACKEND_PORTS = [3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020];

// Plage de ports pour validation
const FRONTEND_PORT_RANGE = { min: 5173, max: 5190 };
const BACKEND_PORT_RANGE = { min: 3003, max: 3020 };

class PortManager {
  constructor() {
    this.currentFrontendPort = null;
    this.currentBackendPort = null;
    this.portStatus = new Map();
  }

  /**
   * Détecte le port frontend actuel
   */
  detectFrontendPort() {
    // Vérifier si on est dans le navigateur
    if (typeof window !== 'undefined') {
      const currentPort = window.location.port;
      if (currentPort) {
        const port = parseInt(currentPort);
        this.currentFrontendPort = port;
        
        // Vérifier si le port est dans notre plage supportée
        if (port >= FRONTEND_PORT_RANGE.min && port <= FRONTEND_PORT_RANGE.max) {
          console.log(`🌐 Port frontend détecté: ${port} (dans la plage supportée)`);
        } else {
          console.warn(`⚠️ Port frontend détecté: ${port} (hors de la plage supportée ${FRONTEND_PORT_RANGE.min}-${FRONTEND_PORT_RANGE.max})`);
        }
        
        return port;
      }
    }

    // Fallback vers le premier port disponible
    this.currentFrontendPort = FRONTEND_PORTS[0];
    console.log(`🌐 Port frontend par défaut: ${this.currentFrontendPort}`);
    return this.currentFrontendPort;
  }

  /**
   * Teste la disponibilité d'un port backend
   */
  async testBackendPort(port) {
    try {
      const response = await fetch(`http://localhost:${port}/api/agents/health`, {
        method: 'GET',
        timeout: 2000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Trouve un port backend disponible
   */
  async findAvailableBackendPort() {
    console.log('🔍 Recherche d\'un port backend disponible...');
    
    for (const port of BACKEND_PORTS) {
      const isAvailable = await this.testBackendPort(port);
      if (isAvailable) {
        this.currentBackendPort = port;
        console.log(`✅ Port backend trouvé: ${port}`);
        return port;
      }
      console.log(`❌ Port ${port} non disponible`);
    }

    // Si aucun port n'est disponible, utiliser le premier
    this.currentBackendPort = BACKEND_PORTS[0];
    console.log(`⚠️ Aucun port backend disponible, utilisation du port par défaut: ${this.currentBackendPort}`);
    return this.currentBackendPort;
  }

  /**
   * Obtient l'URL du backend
   */
  getBackendUrl() {
    const port = this.currentBackendPort || BACKEND_PORTS[0];
    return `http://localhost:${port}`;
  }

  /**
   * Obtient l'URL de l'API backend
   */
  getBackendApiUrl() {
    return `${this.getBackendUrl()}/api`;
  }

  /**
   * Obtient l'URL des agents
   */
  getAgentsUrl() {
    return `${this.getBackendApiUrl()}/agents`;
  }

  /**
   * Initialise la configuration des ports
   */
  async initialize() {
    this.detectFrontendPort();
    await this.findAvailableBackendPort();
    
    console.log('🚀 Configuration des ports initialisée:');
    console.log(`   Frontend: ${this.currentFrontendPort}`);
    console.log(`   Backend: ${this.currentBackendPort}`);
    
    return {
      frontend: this.currentFrontendPort,
      backend: this.currentBackendPort
    };
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig() {
    const isFrontendPortInRange = this.currentFrontendPort >= FRONTEND_PORT_RANGE.min && this.currentFrontendPort <= FRONTEND_PORT_RANGE.max;
    const isBackendPortInRange = this.currentBackendPort >= BACKEND_PORT_RANGE.min && this.currentBackendPort <= BACKEND_PORT_RANGE.max;
    
    return {
      frontend: this.currentFrontendPort,
      backend: this.currentBackendPort,
      frontendUrl: `http://localhost:${this.currentFrontendPort}`,
      backendUrl: this.getBackendUrl(),
      backendApiUrl: this.getBackendApiUrl(),
      portStatus: {
        frontendInRange: isFrontendPortInRange,
        backendInRange: isBackendPortInRange,
        frontendRange: FRONTEND_PORT_RANGE,
        backendRange: BACKEND_PORT_RANGE
      }
    };
  }
}

// Instance singleton
const portManager = new PortManager();

export default portManager;


