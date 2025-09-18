// Système de stockage local pour les agents IA
import { ContentSource, Agent, Campaign } from './types';

export class LocalStorage {
  private static prefix = 'magicpath_';

  // Stockage des sources de contenu
  static saveContentSources(agentType: 'linkedin' | 'geo', sources: ContentSource[]) {
    const key = `${this.prefix}${agentType}_sources`;
    localStorage.setItem(key, JSON.stringify(sources));
    console.log(`✅ Sources sauvegardées pour ${agentType}:`, sources.length);
  }

  static getContentSources(agentType: 'linkedin' | 'geo'): ContentSource[] {
    const key = `${this.prefix}${agentType}_sources`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Stockage des configurations d'agents
  static saveAgentConfig(agentType: 'linkedin' | 'geo', config: any) {
    const key = `${this.prefix}${agentType}_config`;
    const configWithTimestamp = {
      ...config,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(configWithTimestamp));
    console.log(`✅ Configuration sauvegardée pour ${agentType}`);
  }

  static getAgentConfig(agentType: 'linkedin' | 'geo'): any {
    const key = `${this.prefix}${agentType}_config`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Stockage des campagnes
  static saveCampaigns(agentType: 'linkedin' | 'geo', campaigns: Campaign[]) {
    const key = `${this.prefix}${agentType}_campaigns`;
    localStorage.setItem(key, JSON.stringify(campaigns));
    console.log(`✅ Campagnes sauvegardées pour ${agentType}:`, campaigns.length);
  }

  static getCampaigns(agentType: 'linkedin' | 'geo'): Campaign[] {
    const key = `${this.prefix}${agentType}_campaigns`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Stockage des résultats de tests
  static saveTestResults(agentType: 'linkedin' | 'geo', results: any[]) {
    const key = `${this.prefix}${agentType}_test_results`;
    localStorage.setItem(key, JSON.stringify(results));
    console.log(`✅ Résultats de test sauvegardés pour ${agentType}:`, results.length);
  }

  static getTestResults(agentType: 'linkedin' | 'geo'): any[] {
    const key = `${this.prefix}${agentType}_test_results`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Utilitaires
  static getAllStoredData() {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = localStorage.getItem(key);
        allData[key] = data ? JSON.parse(data) : null;
      }
    }
    return allData;
  }

  static exportData(agentType?: 'linkedin' | 'geo') {
    const data = agentType 
      ? this.getAgentData(agentType)
      : this.getAllStoredData();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magicpath_${agentType || 'all'}_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static getAgentData(agentType: 'linkedin' | 'geo') {
    return {
      type: agentType,
      sources: this.getContentSources(agentType),
      config: this.getAgentConfig(agentType),
      campaigns: this.getCampaigns(agentType),
      testResults: this.getTestResults(agentType),
      exported: new Date().toISOString()
    };
  }

  static clearAgentData(agentType: 'linkedin' | 'geo') {
    const keys = [
      `${this.prefix}${agentType}_sources`,
      `${this.prefix}${agentType}_config`,
      `${this.prefix}${agentType}_campaigns`,
      `${this.prefix}${agentType}_test_results`
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Données effacées pour ${agentType}`);
  }
}

// (Les types sont importés depuis ./types pour éviter les conflits de déclarations)

// Hook React pour utiliser le stockage (à importer depuis React)
// import { useState } from 'react';
// export function useLocalStorage<T>(key: string, initialValue: T) {
//   const [value, setValue] = useState<T>(() => {
//     try {
//       const item = localStorage.getItem(key);
//       return item ? JSON.parse(item) : initialValue;
//     } catch (error) {
//       console.error(`Erreur lecture localStorage pour ${key}:`, error);
//       return initialValue;
//     }
//   });

//   const setStoredValue = (newValue: T) => {
//     try {
//       setValue(newValue);
//       localStorage.setItem(key, JSON.stringify(newValue));
//     } catch (error) {
//       console.error(`Erreur écriture localStorage pour ${key}:`, error);
//     }
//   };

//   return [value, setStoredValue] as const;
// }

// Système de fichiers simulé pour l'upload
export class FileManager {
  static processFile(file: File): Promise<ContentSource> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        const source: ContentSource = {
          id: Date.now().toString(),
          name: file.name,
          type: this.getFileType(file),
          status: 'ready',
          tags: this.extractTags(content, file.name),
          lastUpdated: new Date().toISOString(),
          content: content,
          extractedData: this.extractData(content, file.type)
        };

        resolve(source);
      };

      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsText(file);
    });
  }

  private static getFileType(file: File): 'document' | 'transcript' | 'url' {
    if (file.name.toLowerCase().includes('transcript')) return 'transcript';
    if (file.type.includes('text') || file.name.endsWith('.txt')) return 'transcript';
    return 'document';
  }

  private static extractTags(content: string, filename: string): string[] {
    const tags: string[] = [];
    
    // Tags basés sur le nom du fichier
    if (filename.toLowerCase().includes('linkedin')) tags.push('linkedin');
    if (filename.toLowerCase().includes('geo')) tags.push('geo');
    if (filename.toLowerCase().includes('prompt')) tags.push('prompting');
    
    // Tags basés sur le contenu
    if (content.toLowerCase().includes('modular prompting')) tags.push('modular_prompting');
    if (content.toLowerCase().includes('claude')) tags.push('claude');
    if (content.toLowerCase().includes('chatgpt')) tags.push('chatgpt');
    if (content.toLowerCase().includes('writing')) tags.push('writing');
    if (content.toLowerCase().includes('roi')) tags.push('roi');
    
    return tags.length > 0 ? tags : ['general'];
  }

  private static extractData(content: string, fileType: string): any {
    return {
      wordCount: content.split(' ').length,
      lineCount: content.split('\n').length,
      size: content.length,
      language: this.detectLanguage(content),
      type: fileType,
      processedAt: new Date().toISOString()
    };
  }

  private static detectLanguage(content: string): 'fr' | 'en' {
    const frWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'avec', 'pour'];
    const enWords = ['the', 'and', 'or', 'with', 'for', 'to', 'of', 'in', 'on', 'at'];
    
    const words = content.toLowerCase().split(' ');
    const frCount = words.filter(word => frWords.includes(word)).length;
    const enCount = words.filter(word => enWords.includes(word)).length;
    
    return frCount > enCount ? 'fr' : 'en';
  }
}