/**
 * Service de génération de stratégie de contenu
 */

import { InvokeLLM } from '@/api/integrations';

export class StrategyService {
  // ===================
  // ANALYSE DE CONTENU
  // ===================

  async analyzeContent(videos) {
    try {
      const contentText = videos.map(video => 
        `Titre: ${video.title}\nTranscription: ${video.transcript}`
      ).join('\n\n---\n\n');

      const prompt = `Analyse ce contenu vidéo pour identifier les thèmes principaux, le public cible et les opportunités de contenu:

${contentText}

Fournis une analyse détaillée incluant:
- Thèmes et sujets principaux
- Ton et style de communication
- Public cible probable
- Points forts du contenu
- Opportunités d'expansion`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            main_themes: { type: "array", items: { type: "string" } },
            communication_style: { type: "string" },
            target_audience: { type: "string" },
            content_strengths: { type: "array", items: { type: "string" } },
            expansion_opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Erreur analyse contenu:', error);
      throw error;
    }
  }

  // ===================
  // GÉNÉRATION D'ANGLES
  // ===================

  async generateAngles(videos, contentAnalysis) {
    try {
      const prompt = `Basé sur cette analyse de contenu, génère 25 angles différents pour recycler et étendre ce contenu:

Analyse: ${JSON.stringify(contentAnalysis)}

Pour chaque angle, fournis:
- Titre accrocheur
- Description détaillée (2-3 phrases)
- Catégorie (educational, controversial, behind-scenes, data-driven, personal, trending)
- Score de viralité (1-10)
- Plateformes recommandées
- Portée estimée
- Niveau d'effort (1-3)
- Public cible spécifique

Varie les formats: tutoriels, listes, controverses, analyses, témoignages, prédictions, etc.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            angles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  viralScore: { type: "number" },
                  platforms: { type: "array", items: { type: "string" } },
                  estimatedReach: { type: "number" },
                  effortLevel: { type: "number" },
                  targetAudience: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Ajouter des IDs uniques
      const anglesWithIds = result.angles?.map((angle, index) => ({
        ...angle,
        id: `angle_${Date.now()}_${index}`
      })) || [];

      return anglesWithIds;
    } catch (error) {
      console.error('Erreur génération angles:', error);
      return this.generateMockAngles();
    }
  }

  // ===================
  // GÉNÉRATION DE PERSONAS
  // ===================

  async generatePersonas(videos) {
    try {
      const contentText = videos.map(video => 
        `${video.title}: ${video.ai_summary || video.transcript?.substring(0, 500)}`
      ).join('\n\n');

      const prompt = `Basé sur ce contenu, identifie 3-4 personas d'audience principales:

${contentText}

Pour chaque persona, fournis:
- Nom et âge approximatif
- Situation professionnelle
- Points de douleur principaux
- Intérêts et hobbies
- Préférences de contenu
- Plateformes préférées
- Motivations principales`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            personas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "string" },
                  profession: { type: "string" },
                  painPoints: { type: "array", items: { type: "string" } },
                  interests: { type: "array", items: { type: "string" } },
                  contentPreferences: { type: "array", items: { type: "string" } },
                  preferredPlatforms: { type: "array", items: { type: "string" } },
                  motivations: { type: "array", items: { type: "string" } },
                  percentage: { type: "number" }
                }
              }
            }
          }
        }
      });

      return result.personas || this.generateMockPersonas();
    } catch (error) {
      console.error('Erreur génération personas:', error);
      return this.generateMockPersonas();
    }
  }

  // ===================
  // CALENDRIER ÉDITORIAL
  // ===================

  async generateCalendar(angles, personas) {
    try {
      const prompt = `Crée un calendrier éditorial de 30 jours basé sur ces angles de contenu et personas:

Angles: ${JSON.stringify(angles?.slice(0, 10))}
Personas: ${JSON.stringify(personas)}

Planification:
- Répartition équilibrée des formats
- Variation des plateformes
- Progression logique des sujets
- Pics d'engagement optimal
- Contenu adapté aux personas

Pour chaque entrée du calendrier:
- Date
- Titre du contenu
- Format (blog, video, social post, etc.)
- Plateforme(s)
- Persona cible
- Statut (idea/draft/scheduled/published)`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            calendar: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  title: { type: "string" },
                  format: { type: "string" },
                  platforms: { type: "array", items: { type: "string" } },
                  targetPersona: { type: "string" },
                  status: { type: "string" },
                  estimatedTime: { type: "number" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      return result.calendar || this.generateMockCalendar();
    } catch (error) {
      console.error('Erreur génération calendrier:', error);
      return this.generateMockCalendar();
    }
  }

  // ===================
  // ANALYSE DES GAPS
  // ===================

  async analyzeGaps(contentAnalysis) {
    try {
      const prompt = `Analyse les gaps et opportunités de contenu basés sur cette analyse:

${JSON.stringify(contentAnalysis)}

Identifie:
- Sujets manquants vs concurrents
- Formats sous-exploités
- Audiences non touchées
- Tendances émergentes à saisir
- Opportunités SEO
- Collaborations potentielles`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  effort: { type: "string" },
                  potentialImpact: { type: "number" }
                }
              }
            },
            missing_topics: { type: "array", items: { type: "string" } },
            underutilized_formats: { type: "array", items: { type: "string" } },
            competitor_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Erreur analyse gaps:', error);
      return this.generateMockGaps();
    }
  }

  // ===================
  // EXPORT CALENDRIER
  // ===================

  async exportToGoogleCalendar(calendarEntries) {
    // Implémentation future pour Google Calendar API
    console.log('Export vers Google Calendar:', calendarEntries);
    
    // Pour l'instant, créer un fichier .ics
    const icsContent = this.generateICSFile(calendarEntries);
    this.downloadFile(icsContent, 'content-calendar.ics', 'text/calendar');
  }

  generateICSFile(entries) {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Content Strategy//Calendar//EN\n';
    
    entries.forEach((entry, index) => {
      const date = new Date(entry.date);
      const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      ics += 'BEGIN:VEVENT\n';
      ics += `UID:content-${index}@strategy.app\n`;
      ics += `DTSTART:${dateStr}\n`;
      ics += `SUMMARY:${entry.title}\n`;
      ics += `DESCRIPTION:Format: ${entry.format}\\nPlateforme: ${entry.platforms?.join(', ')}\n`;
      ics += 'END:VEVENT\n';
    });
    
    ics += 'END:VCALENDAR';
    return ics;
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===================
  // DONNÉES MOCK POUR TESTS
  // ===================

  generateMockAngles() {
    return [
      {
        id: 'angle_1',
        title: '5 Erreurs que 99% des Entrepreneurs Font (et Comment les Éviter)',
        description: 'Version controversial qui met en avant les erreurs communes avec des statistiques choc pour maximiser l\'engagement.',
        category: 'controversial',
        viralScore: 9.2,
        platforms: ['youtube', 'linkedin', 'twitter'],
        estimatedReach: 50000,
        effortLevel: 2,
        targetAudience: 'Entrepreneurs débutants'
      },
      {
        id: 'angle_2',
        title: 'Behind the Scenes: Comment J\'ai Échoué 3 Fois Avant de Réussir',
        description: 'Approche personnelle et vulnérable qui humanise le parcours entrepreneurial avec des leçons concrètes.',
        category: 'behind-scenes',
        viralScore: 7.8,
        platforms: ['instagram', 'youtube', 'linkedin'],
        estimatedReach: 35000,
        effortLevel: 1,
        targetAudience: 'Entrepreneurs en devenir'
      },
      {
        id: 'angle_3',
        title: 'Data Breakdown: Les Vrais Chiffres du Marketing Digital en 2024',
        description: 'Analyse détaillée avec graphiques et données exclusives pour positionner l\'expertise et crédibilité.',
        category: 'data-driven',
        viralScore: 8.5,
        platforms: ['linkedin', 'youtube', 'twitter'],
        estimatedReach: 42000,
        effortLevel: 3,
        targetAudience: 'Marketeurs professionnels'
      }
    ];
  }

  generateMockPersonas() {
    return [
      {
        name: 'Entrepreneur Alex',
        age: '25-35 ans',
        profession: 'Fondateur de startup',
        painPoints: ['Manque de financement', 'Acquisition clients', 'Gestion équipe'],
        interests: ['Innovation', 'Croissance', 'Networking'],
        contentPreferences: ['Vidéos courtes', 'Cas pratiques', 'Témoignages'],
        preferredPlatforms: ['LinkedIn', 'YouTube', 'Twitter'],
        motivations: ['Réussir rapidement', 'Apprendre des experts', 'Éviter les erreurs'],
        percentage: 40
      },
      {
        name: 'Marketeur Sarah',
        age: '28-40 ans',
        profession: 'Responsable Marketing',
        painPoints: ['ROI marketing', 'Nouvelles plateformes', 'Budget limité'],
        interests: ['Analytics', 'Growth hacking', 'Automatisation'],
        contentPreferences: ['Études de cas', 'Données', 'Tutoriels'],
        preferredPlatforms: ['LinkedIn', 'YouTube'],
        motivations: ['Améliorer performances', 'Rester à jour', 'Prouver son ROI'],
        percentage: 35
      }
    ];
  }

  generateMockCalendar() {
    const startDate = new Date();
    const calendar = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      calendar.push({
        date: date.toISOString().split('T')[0],
        title: `Contenu jour ${i + 1}`,
        format: ['blog', 'video', 'social', 'newsletter'][i % 4],
        platforms: [['linkedin'], ['youtube'], ['twitter', 'instagram'], ['email']][i % 4],
        targetPersona: ['Entrepreneur Alex', 'Marketeur Sarah'][i % 2],
        status: ['idea', 'draft', 'scheduled'][i % 3],
        estimatedTime: Math.floor(Math.random() * 120) + 30,
        priority: ['high', 'medium', 'low'][i % 3]
      });
    }
    
    return calendar;
  }

  generateMockGaps() {
    return {
      opportunities: [
        {
          title: 'Contenu vidéo court (TikTok/Reels)',
          description: 'Format sous-exploité avec fort potentiel d\'engagement',
          priority: 'high',
          effort: 'medium',
          potentialImpact: 8.5
        },
        {
          title: 'Collaborations avec micro-influenceurs',
          description: 'Partenariats pour étendre la portée organiquement',
          priority: 'medium',
          effort: 'low',
          potentialImpact: 7.2
        }
      ],
      missing_topics: ['IA et automation', 'Durabilité business', 'Remote work'],
      underutilized_formats: ['Podcasts', 'Webinaires', 'Templates'],
      competitor_insights: ['Concurrent A fait 200% de vues avec format X', 'Trend émergent: contenu interactif']
    };
  }
}

// Instance singleton
export const strategyService = new StrategyService();


