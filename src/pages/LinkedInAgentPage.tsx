import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Upload, 
  Globe, 
  Users, 
  Target, 
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Play,
  Pause,
  Eye,
  TrendingUp,
  FileText,
  Hash,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Save,
  Download,
  Edit3,
  RefreshCw,
  Database,
  Cpu
} from 'lucide-react';
import { aiService, AI_PROVIDERS } from '@/lib/aiProviders';
import AgentTester from '@/components/AgentTester';
import KnowledgeChat from '@/components/KnowledgeChat';
import SkillsKB from '@/components/SkillsKB';
import VeilleSystem from '@/components/VeilleSystem';
import PostGenerator from '@/components/PostGenerator';
import Connectors from '@/components/Connectors';
import mammoth from 'mammoth';
import { BrowserFileStorage } from '@/lib/browserStorage';
import { WebFileStorage } from '@/lib/webStorage';

interface LinkedInCampaign {
  id: string;
  name: string;
  objective: 'reach' | 'meetings' | 'recruitment';
  status: 'draft' | 'active' | 'paused' | 'completed';
  kpis: {
    likes: number;
    comments: number;
    shares: number;
    bookings: number;
  };
}

interface Persona {
  id: string;
  name: string;
  type: 'ESN' | 'DAF' | 'Executive';
  painPoints: string[];
  objections: string[];
  kpis: string[];
  lexicon: string[];
}

interface ContentSource {
  id: string;
  name: string;
  title?: string;
  type: 'document' | 'transcript' | 'url' | 'article';
  fileType?: string;
  status: 'processing' | 'ready' | 'error';
  tags: string[];
  lastUpdated: string;
  addedDate: string;
  fileSize?: number;
  description?: string;
  storageUsed?: number;
}

export default function LinkedInAgentPage() {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [campaigns, setCampaigns] = useState<LinkedInCampaign[]>([
    {
      id: '1',
      name: 'Campagne ESN Recrutement',
      objective: 'recruitment',
      status: 'active',
      kpis: { likes: 245, comments: 67, shares: 23, bookings: 8 }
    }
  ]);

  const [personas, setPersonas] = useState<Persona[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:personas');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'Directeur ESN',
          type: 'ESN',
          painPoints: ['Pénurie de talents', 'Marges sous pression', 'Concurrence féroce'],
          objections: ['Prix trop élevé', 'Pas le bon moment', 'Solution trop complexe'],
          kpis: ['TJM moyen', 'Taux d\'intercontrat', 'CA par consultant'],
          lexicon: ['Régie', 'Forfait', 'TJM', 'Intercontrat', 'Staffing']
        }
      ];
    } catch {
      return [
        {
          id: '1',
          name: 'Directeur ESN',
          type: 'ESN',
          painPoints: ['Pénurie de talents', 'Marges sous pression', 'Concurrence féroce'],
          objections: ['Prix trop élevé', 'Pas le bon moment', 'Solution trop complexe'],
          kpis: ['TJM moyen', 'Taux d\'intercontrat', 'CA par consultant'],
          lexicon: ['Régie', 'Forfait', 'TJM', 'Intercontrat', 'Staffing']
        }
      ];
    }
  });

  const [sources, setSources] = useState<ContentSource[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:sources');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'Transcript Webinar ESN 2024',
          title: 'Webinar ESN Tendances 2024',
          type: 'transcript',
          fileType: 'PDF',
          status: 'ready',
          tags: ['ESN', 'Recrutement', 'Marché'],
          lastUpdated: '2024-01-15',
          addedDate: '2024-01-10',
          fileSize: 2.5,
          description: 'Analyse des tendances du marché ESN pour 2024',
          storageUsed: 2.5
        }
      ];
    } catch {
      return [
        {
          id: '1',
          name: 'Transcript Webinar ESN 2024',
          title: 'Webinar ESN Tendances 2024',
          type: 'transcript',
          fileType: 'PDF',
          status: 'ready',
          tags: ['ESN', 'Recrutement', 'Marché'],
          lastUpdated: '2024-01-15',
          addedDate: '2024-01-10',
          fileSize: 2.5,
          description: 'Analyse des tendances du marché ESN pour 2024',
          storageUsed: 2.5
        }
      ];
    }
  });
  
  // Charger les sources persistées depuis IndexedDB au montage
  React.useEffect(() => {
    (async () => {
      try {
        const persisted = await BrowserFileStorage.getContentSources('linkedin');
        if (Array.isArray(persisted) && persisted.length > 0) {
          setSources(prev => {
            // Si des sources existent déjà en mémoire, privilégier celles persistées
            return persisted as unknown as ContentSource[];
          });
        }
      } catch (error) {
        console.error('Erreur chargement sources persistées:', error);
      }
    })();
  }, []);
  
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [personaForm, setPersonaForm] = useState({
    name: '',
    type: 'ESN' as 'ESN' | 'DAF' | 'Executive',
    painPoints: [''],
    objections: [''],
    kpis: [''],
    lexicon: ['']
  });
  const [aiGeneratingPersona, setAiGeneratingPersona] = useState(false);

  const [brandVoice, setBrandVoice] = useState({
    clarity: 8,
    humor: 2,
    aggressiveness: 1,
    bannedExpressions: ['synergies', 'disruption'],
    preferredCTAs: ['Réservez un audit gratuit', 'Échangeons 15min']
  });

  const [webSources, setWebSources] = useState({
    domains: ['linkedin.com/pulse', 'lesechos.fr', 'frenchweb.fr'],
    queries: ['LinkedIn algorithm update', 'ESN staffing bench', 'Recrutement IT France'],
    frequency: 'daily',
    language: 'fr'
  });

  const [engagementRules, setEngagementRules] = useState([
    {
      id: '1',
      trigger: 'question + sentiment_positive',
      action: 'respond_helpful',
      delay: '15min',
      template: 'Excellente question ! Voici 3 points clés...'
    },
    {
      id: '2',
      trigger: 'objection_prix',
      action: 'value_response',
      delay: 'immediate',
      template: 'Je comprends votre préoccupation. Nos clients voient un ROI de...'
    }
  ]);

  const [currentCampaign, setCurrentCampaign] = useState({
    name: '',
    objective: 'reach',
    targetKPIs: { likes: 100, comments: 20, bookings: 5 },
    format: 'list',
    length: '120-180',
    hooks: ['🚨 Attention dirigeants ESN', '📊 Étude exclusive'],
    hashtags: ['#ESN', '#Recrutement', '#IT'],
    schedule: { frequency: '3/week', times: ['09:00', '14:00', '17:00'] }
  });

  const generateContent = async (step: number) => {
    console.log(`Generating content - Step ${step}`);
    // Simulation du pipeline en 3 étapes
  };

  // useEffect pour sauvegarder en localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('linkedin:personas', JSON.stringify(personas));
    } catch {}
  }, [personas]);

  React.useEffect(() => {
    try {
      localStorage.setItem('linkedin:sources', JSON.stringify(sources));
    } catch {}
  }, [sources]);

  const processFileForAI = async (file: File, sourceId: string) => {
    try {
      // Simulation du traitement IA optimisé
      const content = await extractFileContent(file);
      const processedData = await optimizeForAI(content, file.type);
      
      // Mise à jour du statut + enrichissement avec le contenu extrait
      let nextSources: ContentSource[] = [];
      setSources(prev => {
        nextSources = prev.map(source => 
          source.id === sourceId 
            ? { 
                ...source, 
                status: 'ready' as const,
                description: `Traité par IA - ${processedData.chunks} chunks, ${processedData.keywords} mots-clés`,
                tags: processedData.suggestedTags,
                // Enregistrer le contenu réel pour une persistance fiable
                // (utilisé par KnowledgeChat et pour la sauvegarde disque)
                content,
                // Quelques métadonnées utiles
                extractedData: {
                  wordCount: content.split(/\s+/).length,
                  lineCount: content.split(/\n/).length,
                  size: file.size,
                  language: 'fr',
                  type: file.type || 'text/plain',
                  processedAt: new Date().toISOString()
                }
              }
            : source
        );
        return nextSources;
      });
      
      // Persister immédiatement dans IndexedDB (navigateur)
      try {
        await BrowserFileStorage.saveContentSources('linkedin', nextSources as any);
      } catch (e) {
        console.warn('Persist IndexedDB échoué:', e);
      }
      
      // Persister également côté fichiers via l’API (si disponible)
      try {
        await WebFileStorage.saveContentSources('linkedin', nextSources as any);
      } catch (e) {
        // non bloquant en dev
        console.warn('Persist fichiers (API) échoué:', e);
      }
      
      // Sauvegarde optimisée pour migration future
      const optimizedStorage = {
        sourceId,
        fileName: file.name,
        processedAt: new Date().toISOString(),
        aiData: processedData,
        migrationReady: true
      };
      
      // Stockage local optimisé pour future migration web
      const existingOptimized = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
      existingOptimized.push(optimizedStorage);
      localStorage.setItem('linkedin:ai-processed', JSON.stringify(existingOptimized));
      
    } catch (error) {
      console.error('Erreur traitement IA:', error);
      setSources(prev => prev.map(source => 
        source.id === sourceId ? { ...source, status: 'error' as const } : source
      ));
    }
  };

  const extractFileContent = async (file: File): Promise<string> => {
    if (file.type.includes('word') || file.name.endsWith('.docx')) {
      // Utiliser mammoth pour les fichiers .docx
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value.trim();
        
        if (text && text.length > 10) {
          return text;
        } else {
          return `Document Word: ${file.name} - Contenu extrait mais vide ou très court.`;
        }
      } catch (error) {
        console.error('Erreur extraction mammoth:', error);
        return `Document Word: ${file.name} - Erreur lors de l'extraction du contenu.`;
      }
    } else if (file.name.endsWith('.doc')) {
      // Les fichiers .doc (ancien format) ne sont pas supportés par mammoth
      return `Document Word (.doc): ${file.name} - Format non supporté. Veuillez convertir en .docx ou utiliser un fichier .txt`;
    } else if (file.type.includes('pdf')) {
      // Pour les PDFs, on indique que c'est un format complexe
      return `Document PDF: ${file.name} - Pour une extraction optimale, convertissez en .txt ou .docx`;
    } else {
      // Pour les autres fichiers (txt, etc.), lecture classique
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text || `Contenu de ${file.name}`);
        };
        
        reader.onerror = () => {
          reject(new Error(`Erreur lecture fichier ${file.name}`));
        };
        
        reader.readAsText(file, 'utf-8');
      });
    }
  };

  const optimizeForAI = async (content: string, fileType: string) => {
    // Simulation de traitement IA optimisé - plus rapide
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const chunks = Math.ceil(content.length / 1000); // Chunks de 1000 caractères
    const keywords = content.split(' ').filter(word => word.length > 3).length;
    
    // Extraction de mots-clés et tags intelligents
    const suggestedTags = extractKeywordsAndTags(content);
    
    return {
      chunks,
      keywords,
      suggestedTags,
      embeddingVector: generateEmbeddingSimulation(content),
      summary: generateSummary(content),
      keyInsights: extractKeyInsights(content),
      originalContent: content // Sauvegarder le contenu original
    };
  };

  const extractKeywordsAndTags = (content: string): string[] => {
    // Simulation d'extraction de mots-clés intelligente
    const businessTerms = ['ESN', 'TJM', 'recrutement', 'staffing', 'consultant', 'SSII', 'transformation', 'digital'];
    const found = businessTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
    return found.slice(0, 5); // Max 5 tags
  };

  const generateEmbeddingSimulation = (content: string) => {
    // Simulation de génération d'embeddings pour recherche sémantique
    return Array.from({length: 384}, () => Math.random() * 2 - 1); // Vector 384D
  };

  const generateSummary = (content: string): string => {
    // Génération de résumé basé sur le contenu réel
    const sentences = content.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .filter(s => /[a-zA-ZÀ-ÿ]/.test(s));
    
    if (sentences.length === 0) {
      return "Document traité - contenu disponible pour analyse IA";
    }
    
    // Prendre les 3 premières phrases significatives
    const summary = sentences.slice(0, 3).join('. ');
    return summary.length > 10 ? summary + '.' : "Résumé du document généré automatiquement";
  };

  const extractKeyInsights = (content: string): string[] => {
    // Extraction d'insights basée sur le contenu réel
    const sentences = content.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 150)
      .filter(s => /[a-zA-ZÀ-ÿ]/.test(s));
    
    // Prendre les phrases les plus informatives (contiennent des mots-clés business)
    const businessKeywords = [
      'croissance', 'stratégie', 'innovation', 'transformation', 'performance',
      'efficacité', 'optimisation', 'développement', 'amélioration', 'solution',
      'marché', 'client', 'équipe', 'projet', 'résultat', 'objectif', 'enjeu',
      'défi', 'opportunité', 'avantage', 'bénéfice', 'valeur', 'impact'
    ];
    
    const relevantSentences = sentences
      .filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return businessKeywords.some(keyword => lowerSentence.includes(keyword));
      })
      .slice(0, 5); // Top 5 insights
    
    if (relevantSentences.length > 0) {
      return relevantSentences;
    }
    
    // Fallback: prendre les premières phrases substantielles
    const fallbackInsights = sentences.slice(0, 3);
    return fallbackInsights.length > 0 ? fallbackInsights : [
      'Document analysé avec succès',
      'Contenu disponible pour génération LinkedIn',
      'Expertise identifiée dans le domaine'
    ];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
        const fileSizeMB = file.size / (1024 * 1024);
        const sourceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newSource: ContentSource = {
          id: sourceId,
          name: file.name,
          title: file.name.replace(/\.[^/.]+$/, ""), // nom sans extension
          type: file.type.includes('pdf') ? 'document' : 
                file.type.includes('audio') ? 'transcript' : 'document',
          fileType: fileExtension,
          status: 'processing',
          tags: [],
          lastUpdated: new Date().toISOString().split('T')[0],
          addedDate: new Date().toISOString().split('T')[0],
          fileSize: Math.round(fileSizeMB * 100) / 100,
          description: `Traitement IA en cours...`,
          storageUsed: Math.round(fileSizeMB * 100) / 100
        };
        
        setSources(prev => [...prev, newSource]);
        
        // Lancement du traitement IA asynchrone - avec gestion d'erreur
        setTimeout(() => {
          processFileForAI(file, sourceId).catch((error) => {
            console.error('Erreur traitement fichier:', error);
            setSources(prev => prev.map(source => 
              source.id === sourceId 
                ? { ...source, status: 'error' as const, description: 'Erreur lors du traitement' }
                : source
            ));
          });
        }, 100); // Petit délai pour éviter les conflits
      });
    }
  };

  const generatePersonaWithAI = async (description: string) => {
    setAiGeneratingPersona(true);
    try {
      // Simulation d'un appel IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiPersona = {
        name: `${description} - Client Idéal`,
        type: 'Executive' as const,
        painPoints: [
          'Budget serré pour la transformation digitale',
          'Équipes résistantes au changement',
          'ROI difficile à mesurer'
        ],
        objections: [
          'Coût trop important',
          'Timing pas adapté',
          'Ressources internes insuffisantes'
        ],
        kpis: [
          'Réduction des coûts opérationnels',
          'Time-to-market',
          'Satisfaction client'
        ],
        lexicon: [
          'ROI',
          'Transformation digitale',
          'Efficacité opérationnelle',
          'KPI'
        ]
      };
      
      setPersonaForm(aiPersona);
    } finally {
      setAiGeneratingPersona(false);
    }
  };

  const savePersona = () => {
    if (!personaForm.name.trim()) return;
    
    const newPersona: Persona = {
      id: editingPersona?.id || Date.now().toString(),
      name: personaForm.name,
      type: personaForm.type,
      painPoints: personaForm.painPoints.filter(p => p.trim()),
      objections: personaForm.objections.filter(o => o.trim()),
      kpis: personaForm.kpis.filter(k => k.trim()),
      lexicon: personaForm.lexicon.filter(l => l.trim())
    };

    if (editingPersona) {
      setPersonas(prev => prev.map(p => p.id === editingPersona.id ? newPersona : p));
    } else {
      if (personas.length >= 4) {
        alert('Limite de 4 personas atteinte');
        return;
      }
      setPersonas(prev => [...prev, newPersona]);
    }

    resetPersonaForm();
  };

  const editPersona = (persona: Persona) => {
    setEditingPersona(persona);
    setPersonaForm({
      name: persona.name,
      type: persona.type,
      painPoints: [...persona.painPoints],
      objections: [...persona.objections],
      kpis: [...persona.kpis],
      lexicon: [...persona.lexicon]
    });
    setShowPersonaForm(true);
  };

  const deletePersona = (id: string) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  const resetPersonaForm = () => {
    setPersonaForm({
      name: '',
      type: 'ESN',
      painPoints: [''],
      objections: [''],
      kpis: [''],
      lexicon: ['']
    });
    setEditingPersona(null);
    setShowPersonaForm(false);
  };

  const updatePersonaFormArray = (field: keyof typeof personaForm, index: number, value: string) => {
    setPersonaForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addPersonaFormArrayItem = (field: keyof typeof personaForm) => {
    setPersonaForm(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removePersonaFormArrayItem = (field: keyof typeof personaForm, index: number) => {
    setPersonaForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const viewProcessedData = (sourceId: string) => {
    try {
      const processed = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
      const sourceData = processed.find((p: any) => p.sourceId === sourceId);
      
      if (sourceData) {
        alert(`Données traitées IA:\n\n` +
          `Chunks: ${sourceData.aiData.chunks}\n` +
          `Mots-clés: ${sourceData.aiData.keywords}\n` +
          `Tags: ${sourceData.aiData.suggestedTags.join(', ')}\n` +
          `Résumé: ${sourceData.aiData.summary}\n` +
          `Insights: ${sourceData.aiData.keyInsights.join(' | ')}\n` +
          `Traité le: ${new Date(sourceData.processedAt).toLocaleString('fr-FR')}`
        );
      } else {
        alert('Aucune donnée IA traitée trouvée pour ce fichier.');
      }
    } catch (error) {
      console.error('Erreur lecture données IA:', error);
      alert('Erreur lors de la lecture des données traitées.');
    }
  };

  const deleteSource = (sourceId: string) => {
    setSources(prev => prev.filter(s => s.id !== sourceId));
    
    // Suppression des données IA associées
    try {
      const processed = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
      const filtered = processed.filter((p: any) => p.sourceId !== sourceId);
      localStorage.setItem('linkedin:ai-processed', JSON.stringify(filtered));
    } catch (error) {
      console.error('Erreur suppression données IA:', error);
    }
  };

  const reprocessFile = (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, status: 'processing' as const, description: 'Retraitement IA en cours...' }
        : source
    ));
    
    // Traitement plus rapide et fiable
    setTimeout(() => {
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              status: 'ready' as const,
              description: 'Retraité par IA - Données mises à jour',
              lastUpdated: new Date().toISOString().split('T')[0],
              tags: ['retraité', 'optimisé']
            }
          : source
      ));
      
      // Ajouter également aux données IA processed
      try {
        const processed = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
        processed.push({
          sourceId,
          fileName: `reprocessed-${sourceId}`,
          processedAt: new Date().toISOString(),
          aiData: {
            chunks: 5,
            keywords: 150,
            suggestedTags: ['retraité', 'optimisé'],
            embeddingVector: Array.from({length: 384}, () => Math.random() * 2 - 1),
            summary: 'Fichier retraité avec succès',
            keyInsights: ['Retraitement réussi', 'Données optimisées']
          },
          migrationReady: true
        });
        localStorage.setItem('linkedin:ai-processed', JSON.stringify(processed));
      } catch (error) {
        console.error('Erreur sauvegarde retraitement:', error);
      }
    }, 1000); // Plus rapide : 1 seconde
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Agent Ghostwriting LinkedIn</h1>
            <p className="text-gray-600">Création automatisée de posts et gestion des commentaires</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Mode Co-pilot
          </Button>
          <Button className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Mode Auto-pilot
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Connaissance
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat IA
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Skills KB
          </TabsTrigger>
          <TabsTrigger value="veille" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Veille
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Générateur
          </TabsTrigger>
          <TabsTrigger value="connectors">Connecteurs</TabsTrigger>
          <TabsTrigger value="campaign" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campagne
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Génération
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Test Réel
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Onglet Connaissance */}
        <TabsContent value="knowledge">
          <div className="space-y-6">
            {/* Sources internes - Affichage complet sur une ligne */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Sources internes
                </CardTitle>
                <CardDescription>Documents, transcripts et contenus propriétaires</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Glissez vos fichiers ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, TXT, MP3, WAV - Max 10MB
                    </p>
                  </label>
                </div>

                {/* Tableau détaillé des sources */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Titre/Requête</th>
                        <th className="text-left p-3 font-medium">Type de contenu</th>
                        <th className="text-left p-3 font-medium">Type de fichier</th>
                        <th className="text-left p-3 font-medium">Date d'ajout</th>
                        <th className="text-left p-3 font-medium">Taille</th>
                        <th className="text-left p-3 font-medium">Statut IA</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map(source => (
                        <tr key={source.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{source.title || source.name}</div>
                              <div className="text-sm text-gray-500">{source.description}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {source.type}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">
                              {source.fileType}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(source.addedDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-3 text-sm">
                            {source.fileSize ? `${source.fileSize} MB` : '-'}
                          </td>
                          <td className="p-3">
                            <Badge variant={
                              source.status === 'ready' ? 'default' : 
                              source.status === 'processing' ? 'outline' : 'destructive'
                            }>
                              {source.status === 'ready' ? '✓ Prêt' : 
                               source.status === 'processing' ? '⏳ Traitement' : '❌ Erreur'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewProcessedData(source.id)}
                                title="Voir les données IA"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {source.status === 'ready' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => reprocessFile(source.id)}
                                  title="Retraiter avec l'IA"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteSource(source.id)}
                                title="Supprimer"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {sources.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Aucune source interne ajoutée
                    </div>
                  )}
                </div>

                {/* Statistiques de stockage */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold flex items-center justify-center gap-1">
                        <Database className="h-4 w-4" />
                        {sources.length}
                      </div>
                      <div className="text-sm text-gray-600">Fichiers</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {Math.round((sources.reduce((acc, s) => acc + (s.storageUsed || 0), 0)) * 100) / 100} MB
                      </div>
                      <div className="text-sm text-gray-600">Stockage utilisé</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold flex items-center justify-center gap-1">
                        <Cpu className="h-4 w-4 text-green-600" />
                        {sources.filter(s => s.status === 'ready').length}/{sources.length}
                      </div>
                      <div className="text-sm text-gray-600">Prêts pour l'IA</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold flex items-center justify-center gap-1">
                        {sources.filter(s => s.status === 'processing').length > 0 && (
                          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                        )}
                        {sources.filter(s => s.status === 'processing').length}
                      </div>
                      <div className="text-sm text-gray-600">En traitement</div>
                    </div>
                  </div>
                  
                  {/* Barre de progression globale */}
                  {sources.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression IA</span>
                        <span>{Math.round((sources.filter(s => s.status === 'ready').length / sources.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(sources.filter(s => s.status === 'ready').length / sources.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions rapides */}
                  {sources.filter(s => s.status === 'processing').length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <RefreshCw className="h-4 w-4" />
                          <span>{sources.filter(s => s.status === 'processing').length} fichier(s) en traitement depuis plus de 30s</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Forcer le traitement des fichiers bloqués
                            sources.filter(s => s.status === 'processing').forEach(source => {
                              reprocessFile(source.id);
                            });
                          }}
                        >
                          Forcer le traitement
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Indication de migration ready */}
                  {sources.filter(s => s.status === 'ready').length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Migration Ready:</span>
                        <span>{sources.filter(s => s.status === 'ready').length} fichier(s) optimisé(s) pour transfert web</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Fréquence de ré-indexation</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Veille web - Affichage complet sur une ligne */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Veille web
                </CardTitle>
                <CardDescription>Sources externes et requêtes automatisées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Domaines autorisés</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {webSources.domains.map(domain => (
                      <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                        {domain}
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="linkedin.com/pulse" />
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Requêtes sauvegardées</Label>
                  <div className="space-y-2">
                    {webSources.queries.map((query, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="flex-1">{query}</span>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="LinkedIn algorithm update" />
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cadence de veille</Label>
                    <Select value={webSources.frequency} onValueChange={(value) => 
                      setWebSources(prev => ({ ...prev, frequency: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select value={webSources.language} onValueChange={(value) => 
                      setWebSources(prev => ({ ...prev, language: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="all">Toutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affichage 1/2 Personas et 2/2 Voix de marque */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personas */}
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bibliothèque Personas
                </CardTitle>
                <CardDescription>Profils cibles avec douleurs et objections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compteur et limitation */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="font-medium">Personas: {personas.length}/4</span>
                    <p className="text-sm text-gray-600">Limite de 4 personas actifs</p>
                  </div>
                  <Badge variant={personas.length >= 4 ? 'destructive' : 'default'}>
                    {personas.length >= 4 ? 'Limite atteinte' : 'Disponible'}
                  </Badge>
                </div>

                {personas.map(persona => (
                  <div key={persona.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{persona.name}</h3>
                        <Badge className="mt-1">{persona.type} - Client Idéal</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editPersona(persona)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deletePersona(persona.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-red-600">Pain Points</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.painPoints.map((pain, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">{pain}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-orange-600">Objections</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.objections.map((objection, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{objection}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-blue-600">Lexique</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.lexicon.map((term, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {personas.length < 4 && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => setShowPersonaForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un persona
                  </Button>
                )}
                
                {personas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun persona configuré</p>
                    <p className="text-sm">Créez votre premier client idéal</p>
                  </div>
                )}
              </CardContent>
            </Card>

              {/* Voix de marque */}
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Voix de marque
                </CardTitle>
                <CardDescription>Ton et style de communication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Clarté / Direct (1-10)</Label>
                    <div className="px-3 py-2 border rounded-lg">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={brandVoice.clarity}
                        onChange={(e) => setBrandVoice(prev => ({ ...prev, clarity: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtil</span>
                        <span className="font-medium">{brandVoice.clarity}</span>
                        <span>Direct</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Humour (0-3)</Label>
                    <div className="px-3 py-2 border rounded-lg">
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={brandVoice.humor}
                        onChange={(e) => setBrandVoice(prev => ({ ...prev, humor: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Sérieux</span>
                        <span className="font-medium">{brandVoice.humor}</span>
                        <span>Drôle</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Expressions bannies</Label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {brandVoice.bannedExpressions.map(expr => (
                        <Badge key={expr} variant="destructive" className="flex items-center gap-1">
                          {expr}
                          <X className="h-3 w-3 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                    <Input placeholder="ex: synergies, disruption" />
                  </div>

                  <div className="space-y-2">
                    <Label>CTAs préférés</Label>
                    <div className="space-y-1">
                      {brandVoice.preferredCTAs.map(cta => (
                        <div key={cta} className="flex items-center gap-2 p-2 border rounded">
                          <span className="flex-1">{cta}</span>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>

            {/* Formulaire de persona avec IA */}
            {showPersonaForm && (
              <Card className="border-teal-200 bg-teal-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{editingPersona ? 'Modifier le persona' : 'Nouveau persona client idéal'}</span>
                    <Button variant="ghost" size="sm" onClick={resetPersonaForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Créez un profil détaillé de votre client idéal avec l'aide de l'IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Assistant IA */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">🤖 Assistant IA</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Décrivez votre client idéal et l'IA générera automatiquement les pain points, objections et lexique.
                    </p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ex: Directeur financier d'une PME de 50-200 employés"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            generatePersonaWithAI(e.currentTarget.value);
                          }
                        }}
                      />
                      <Button 
                        disabled={aiGeneratingPersona}
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          generatePersonaWithAI(input.value);
                        }}
                      >
                        {aiGeneratingPersona ? '⏳' : '✨'} Générer avec IA
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations de base */}
                    <div className="space-y-4">
                      <div>
                        <Label>Nom du persona</Label>
                        <Input 
                          value={personaForm.name}
                          onChange={(e) => setPersonaForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Directeur ESN Innovant"
                        />
                      </div>
                      
                      <div>
                        <Label>Type de client</Label>
                        <Select 
                          value={personaForm.type}
                          onValueChange={(value) => setPersonaForm(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ESN">Directeur ESN</SelectItem>
                            <SelectItem value="DAF">Directeur Financier</SelectItem>
                            <SelectItem value="Executive">Dirigeant/Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Pain Points */}
                      <div>
                        <Label className="text-red-600">Pain Points (douleurs)</Label>
                        {personaForm.painPoints.map((pain, index) => (
                          <div key={index} className="flex gap-2 mt-1">
                            <Input 
                              value={pain}
                              onChange={(e) => updatePersonaFormArray('painPoints', index, e.target.value)}
                              placeholder="Ex: Difficultés de recrutement"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePersonaFormArrayItem('painPoints', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => addPersonaFormArrayItem('painPoints')}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Ajouter
                        </Button>
                      </div>

                      {/* Objections */}
                      <div>
                        <Label className="text-orange-600">Objections communes</Label>
                        {personaForm.objections.map((objection, index) => (
                          <div key={index} className="flex gap-2 mt-1">
                            <Input 
                              value={objection}
                              onChange={(e) => updatePersonaFormArray('objections', index, e.target.value)}
                              placeholder="Ex: Trop cher"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePersonaFormArrayItem('objections', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => addPersonaFormArrayItem('objections')}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Ajouter
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* KPIs */}
                      <div>
                        <Label className="text-green-600">KPIs importants</Label>
                        {personaForm.kpis.map((kpi, index) => (
                          <div key={index} className="flex gap-2 mt-1">
                            <Input 
                              value={kpi}
                              onChange={(e) => updatePersonaFormArray('kpis', index, e.target.value)}
                              placeholder="Ex: ROI des projets"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePersonaFormArrayItem('kpis', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => addPersonaFormArrayItem('kpis')}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Ajouter
                        </Button>
                      </div>

                      {/* Lexique */}
                      <div>
                        <Label className="text-blue-600">Lexique métier</Label>
                        {personaForm.lexicon.map((term, index) => (
                          <div key={index} className="flex gap-2 mt-1">
                            <Input 
                              value={term}
                              onChange={(e) => updatePersonaFormArray('lexicon', index, e.target.value)}
                              placeholder="Ex: TJM, SSII"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePersonaFormArrayItem('lexicon', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => addPersonaFormArrayItem('lexicon')}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={savePersona} className="bg-teal-500 hover:bg-teal-600">
                      {editingPersona ? 'Mettre à jour' : 'Créer le persona'}
                    </Button>
                    <Button variant="outline" onClick={resetPersonaForm}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Onglet Chat IA */}
        <TabsContent value="chat">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Chat de Vérification IA</h2>
                <p className="text-gray-600">
                  Testez la compréhension de vos sources de connaissances par l'IA
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {sources.filter(s => s.status === 'ready').length} sources disponibles
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat principal */}
              <div className="lg:col-span-2">
                <KnowledgeChat className="h-[600px]" />
              </div>
              
              {/* Panneau d'informations */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Sources Actives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sources.filter(s => s.status === 'ready').slice(0, 5).map(source => (
                        <div key={source.id} className="flex items-center gap-3 p-2 border rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{source.title || source.name}</div>
                            <div className="text-xs text-gray-500">{source.fileType} • {source.fileSize}MB</div>
                          </div>
                        </div>
                      ))}
                      
                      {sources.filter(s => s.status === 'ready').length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          <Upload className="h-8 w-8 mx-auto mb-2" />
                          <p>Aucune source prête</p>
                          <p className="text-xs">Ajoutez des fichiers dans l'onglet Connaissance</p>
                        </div>
                      )}
                      
                      {sources.filter(s => s.status === 'ready').length > 5 && (
                        <div className="text-center text-sm text-gray-500">
                          +{sources.filter(s => s.status === 'ready').length - 5} autres sources
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Statistiques IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Fichiers traités</span>
                      <Badge variant="outline">
                        {sources.filter(s => s.status === 'ready').length}/{sources.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Chunks disponibles</span>
                      <Badge variant="outline">
                        {sources.reduce((acc, s) => {
                          try {
                            const processed = JSON.parse(localStorage.getItem('linkedin:ai-processed') || '[]');
                            const data = processed.find((p: any) => p.sourceId === s.id);
                            return acc + (data?.aiData?.chunks || 0);
                          } catch {
                            return acc;
                          }
                        }, 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Historique chat</span>
                      <Badge variant="outline">
                        {(() => {
                          try {
                            const history = JSON.parse(localStorage.getItem('linkedin:chat-history') || '[]');
                            return history.length;
                          } catch {
                            return 0;
                          }
                        })()} messages
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">💡 Suggestions de Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full text-left justify-start h-auto p-2">
                      <div>
                        <div className="font-medium text-xs">Analyse sectorielle</div>
                        <div className="text-xs text-gray-500">"Quelles tendances ESN dans mes docs ?"</div>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-left justify-start h-auto p-2">
                      <div>
                        <div className="font-medium text-xs">Synthèse contenu</div>
                        <div className="text-xs text-gray-500">"Résume mes 3 derniers documents"</div>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-left justify-start h-auto p-2">
                      <div>
                        <div className="font-medium text-xs">Génération d'idées</div>
                        <div className="text-xs text-gray-500">"5 sujets de posts LinkedIn basés sur mes sources"</div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Skills KB */}
        <TabsContent value="skills">
          <SkillsKB />
        </TabsContent>

        {/* Onglet Veille */}
        <TabsContent value="veille">
          <VeilleSystem />
        </TabsContent>

        {/* Onglet Générateur de Posts */}
        <TabsContent value="generator">
          <PostGenerator />
        </TabsContent>

        {/* Onglet Connecteurs */}
        <TabsContent value="connectors">
          <Connectors />
        </TabsContent>

        {/* Onglet Campagne */}
        <TabsContent value="campaign">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brief de campagne</CardTitle>
                  <CardDescription>Configurez votre série de posts LinkedIn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom de la campagne</Label>
                      <Input 
                        value={currentCampaign.name}
                        onChange={(e) => setCurrentCampaign(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Campagne Recrutement ESN Q1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Objectif principal</Label>
                      <Select 
                        value={currentCampaign.objective}
                        onValueChange={(value) => setCurrentCampaign(prev => ({ ...prev, objective: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reach">Reach & Visibilité</SelectItem>
                          <SelectItem value="meetings">Génération RDV</SelectItem>
                          <SelectItem value="recruitment">Recrutement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>KPI Likes cible</Label>
                      <Input 
                        type="number"
                        value={currentCampaign.targetKPIs.likes}
                        onChange={(e) => setCurrentCampaign(prev => ({ 
                          ...prev, 
                          targetKPIs: { ...prev.targetKPIs, likes: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>KPI Commentaires</Label>
                      <Input 
                        type="number"
                        value={currentCampaign.targetKPIs.comments}
                        onChange={(e) => setCurrentCampaign(prev => ({ 
                          ...prev, 
                          targetKPIs: { ...prev.targetKPIs, comments: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>KPI RDV/Bookings</Label>
                      <Input 
                        type="number"
                        value={currentCampaign.targetKPIs.bookings}
                        onChange={(e) => setCurrentCampaign(prev => ({ 
                          ...prev, 
                          targetKPIs: { ...prev.targetKPIs, bookings: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Format de post</Label>
                      <Select 
                        value={currentCampaign.format}
                        onValueChange={(value) => setCurrentCampaign(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="list">Liste à puces</SelectItem>
                          <SelectItem value="what-how-why">What-How-Why</SelectItem>
                          <SelectItem value="ppp">Problème-Promesse-Preuve</SelectItem>
                          <SelectItem value="story">Storytelling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Longueur (mots)</Label>
                      <Select 
                        value={currentCampaign.length}
                        onValueChange={(value) => setCurrentCampaign(prev => ({ ...prev, length: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="120-180">120-180 mots (Court)</SelectItem>
                          <SelectItem value="180-250">180-250 mots (Moyen)</SelectItem>
                          <SelectItem value="250-350">250-350 mots (Long)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hooks favoris</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentCampaign.hooks.map(hook => (
                        <Badge key={hook} variant="secondary" className="flex items-center gap-1">
                          {hook}
                          <X className="h-3 w-3 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                    <Input placeholder="🚨 Attention dirigeants..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Hashtags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentCampaign.hashtags.map(tag => (
                        <Badge key={tag} variant="outline" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                    <Input placeholder="#ESN #Recrutement" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendrier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Planification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cadence</Label>
                  <Select defaultValue="3/week">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/day">1 post/jour</SelectItem>
                      <SelectItem value="3/week">3 posts/semaine</SelectItem>
                      <SelectItem value="2/week">2 posts/semaine</SelectItem>
                      <SelectItem value="1/week">1 post/semaine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heures optimales</Label>
                  <div className="space-y-1">
                    {currentCampaign.schedule.times.map(time => (
                      <div key={time} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{time}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          +15% engagement
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>A/B Test hooks</Label>
                  <Switch defaultChecked />
                  <p className="text-xs text-gray-500">
                    Tester 2 versions de hooks automatiquement
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Réutilisation multi-canal</Label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Adaptation Twitter/X</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Newsletter monthly</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Génération */}
        <TabsContent value="generation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline de génération */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de génération</CardTitle>
                <CardDescription>Processus automatisé en 3 étapes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-4"
                    onClick={() => generateContent(1)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Générer (Étape 1→2→3)
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                      <h3 className="font-semibold">Analyse</h3>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Ingestion des transcripts/docs → extraction thèmes, problèmes, preuves
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">2</span>
                      </div>
                      <h3 className="font-semibold">Stratégie</h3>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Génération de 6-12 angles par persona + briefs par format
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">3</span>
                      </div>
                      <h3 className="font-semibold">Rédaction</h3>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Génération posts LinkedIn (120-180 mots) avec QA automatique
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QA et Score */}
            <Card>
              <CardHeader>
                <CardTitle>QA automatique & Score</CardTitle>
                <CardDescription>Vérification qualité avant publication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Longueur respectée
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Jargon technique
                    </span>
                    <Badge variant="outline">2 termes</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Promesse mesurable
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Preuves chiffrées
                    </span>
                    <Badge variant="outline">Manque 1</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      CTA présent
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">87/100</div>
                  <p className="text-sm text-gray-600">Score de publication</p>
                  <Badge variant="default" className="mt-2">Recommandé</Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Suggestions d'amélioration:</Label>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Ajouter un chiffre dans le hook (ex: "47% des ESN...")</li>
                    <li>• Simplifier "staffing bench" → "consultants disponibles"</li>
                    <li>• Renforcer la promesse avec un cas client</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Engagement */}
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Boîte de réception */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Boîte de réception unifiée
                </CardTitle>
                <CardDescription>Comments & DMs à traiter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">@jean.martin</span>
                      <Badge variant="default">Question</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Comment gérez-vous le staffing en période creuse ?"
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Répondre auto</Button>
                      <Button size="sm" variant="outline">→ DM</Button>
                      <Button size="sm" variant="ghost">Ignorer</Button>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">@marie.dubois</span>
                      <Badge variant="secondary">Félicitations</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Excellent post ! Très pertinent pour notre contexte ESN"
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Remercier</Button>
                      <Button size="sm" variant="ghost">Liker seulement</Button>
                    </div>
                  </div>

                  <div className="p-3 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">@critique.pro</span>
                      <Badge variant="destructive">Objection prix</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Encore un consultant qui vend du rêve à prix d'or..."
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Valeur + Cas</Button>
                      <Button size="sm" variant="outline">Escalader</Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Traiter automatiquement (3 messages)
                </Button>
              </CardContent>
            </Card>

            {/* Règles d'engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Règles d'auto-réponse</CardTitle>
                <CardDescription>Configuration des réponses automatiques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagementRules.map(rule => (
                  <div key={rule.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{rule.trigger}</Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Action:</strong> {rule.action}</p>
                      <p><strong>Délai:</strong> {rule.delay}</p>
                      <p><strong>Template:</strong> {rule.template}</p>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une règle
                </Button>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-semibold">Blacklist (mots/comptes)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input placeholder="spam, inappropriate..." className="flex-1" />
                      <Button size="sm">+</Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">VIP (réponse prioritaire)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input placeholder="@influenceur, @client..." className="flex-1" />
                      <Button size="sm">+</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Analytics */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Vues totales</p>
                      <p className="text-2xl font-bold">24,567</p>
                      <p className="text-xs text-green-600">+12% vs semaine dernière</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold">8.4%</p>
                      <p className="text-xs text-green-600">+2.1% vs moy. secteur</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Commentaires qualifiés</p>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-xs text-green-600">73% du total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">RDV générés</p>
                      <p className="text-2xl font-bold">23</p>
                      <p className="text-xs text-green-600">Show rate: 87%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top performing content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Hooks performants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"🚨 47% des ESN perdent..."</span>
                      <Badge>1,234 vues</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"📊 Étude exclusive sur le staffing"</span>
                      <Badge>987 vues</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"💡 3 erreurs fatales en recrutement"</span>
                      <Badge>856 vues</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Apprentissage automatique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border-green-200 border rounded-lg">
                      <p className="text-sm font-medium text-green-800">📈 Pattern détecté</p>
                      <p className="text-sm text-green-700">
                        Les posts avec chiffres dans le hook obtiennent +34% d'engagement
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border-blue-200 border rounded-lg">
                      <p className="text-sm font-medium text-blue-800">⏰ Timing optimal</p>
                      <p className="text-sm text-blue-700">
                        Meilleur engagement: Mardi 14h (+23% vs moyenne)
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 border-purple-200 border rounded-lg">
                      <p className="text-sm font-medium text-purple-800">🎯 CTA gagnant</p>
                      <p className="text-sm text-purple-700">
                        "Échangeons 15min" génère 2x plus de DMs que "Contactez-moi"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funnel conversion */}
            <Card>
              <CardHeader>
                <CardTitle>Funnel de conversion</CardTitle>
                <CardDescription>De la vue à l'opportunité business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold">24,567</p>
                    <p className="text-sm text-gray-600">Vues</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-sm text-gray-600">Clics CTA</p>
                    <Badge variant="outline" className="mt-1">5.0%</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold">87</p>
                    <p className="text-sm text-gray-600">Opt-ins EEC</p>
                    <Badge variant="outline" className="mt-1">7.1%</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-gray-600">RDV pris</p>
                    <Badge variant="outline" className="mt-1">26.4%</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-gray-600">Opportunités</p>
                    <Badge variant="outline" className="mt-1">34.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Test Réel */}
        <TabsContent value="test">
          <AgentTester 
            agentType="linkedin"
            defaultPrompts={{
              system: `Tu es un expert en ghostwriting LinkedIn B2B. Tu crées des posts engageants de 120-180 mots avec:
- Hook accrocheur en première ligne
- 3-5 points de valeur concrets
- CTA clair pour générer des RDV
- Ton professionnel mais humain
- Preuves chiffrées quand possible`,
              user: `Crée un post LinkedIn sur le thème "{input}" pour un dirigeant d'ESN qui veut attirer des clients.

Inclus:
- Un hook qui interpelle
- 3 bénéfices concrets avec des chiffres
- Un CTA pour un audit gratuit de 20min

Format: Post de 150 mots maximum.`
            }}
            onConfigSave={(config) => {
              console.log('Configuration LinkedIn sauvegardée:', config);
              // Ici vous pouvez sauvegarder la config dans votre backend
            }}
          />
        </TabsContent>

        {/* Onglet Configuration */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Garde-fous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Garde-fous & Conformité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sujets interdits</Label>
                  <Textarea 
                    placeholder="Politique, religion, concurrents directs..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Clients à ne pas nommer (NDA)</Label>
                  <Textarea 
                    placeholder="Client A, Client B (projet confidentiel)..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mentions légales obligatoires</Label>
                  <Input placeholder="ex: Organisme de formation certifié..." />
                </div>

                <div className="space-y-2">
                  <Label>Promesses interdites ("do/don't claim")</Label>
                  <div className="space-y-2">
                    <Input placeholder="ex: Garantie de résultat, ROI immédiat..." />
                    <p className="text-xs text-gray-500">
                      L'agent évitera ces promesses dans tous les contenus
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bibliothèque d'assets */}
            <Card>
              <CardHeader>
                <CardTitle>Bibliothèque d'assets</CardTitle>
                <CardDescription>Éléments réutilisables pour les contenus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hooks gagnants sauvegardés</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    <div className="text-xs p-2 border rounded">🚨 47% des ESN perdent...</div>
                    <div className="text-xs p-2 border rounded">📊 Étude exclusive sur...</div>
                    <div className="text-xs p-2 border rounded">💡 3 erreurs fatales...</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CTAs performants</Label>
                  <div className="space-y-1">
                    <div className="text-xs p-2 border rounded">Échangeons 15min (87% conversion)</div>
                    <div className="text-xs p-2 border rounded">Audit gratuit de vos processus</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Métriques autorisées</Label>
                  <div className="space-y-1">
                    <div className="text-xs p-2 border rounded">+34% de productivité moyenne</div>
                    <div className="text-xs p-2 border rounded">ROI de 3:1 sur 12 mois</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Analogies & Métaphores</Label>
                  <Textarea 
                    placeholder="Staffing = orchestre (chaque consultant = musicien)..."
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuration technique */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration technique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Détecteur de répétition</Label>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Ne pas reposter le même hook &lt; 60 jours</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mode conformité</Label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Vérifier promesses chiffrées</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Check NDA automatique</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Validation droits visuels</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>UTM Builder intégré</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Source campaign" className="flex-1" />
                    <Button size="sm">Générer</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Traduction auto FR/EN</Label>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Garder termes techniques en VO</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter bibliothèque d'assets
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer configuration
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder template campagne
                </Button>

                <Separator />

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Appliquer toute la configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}