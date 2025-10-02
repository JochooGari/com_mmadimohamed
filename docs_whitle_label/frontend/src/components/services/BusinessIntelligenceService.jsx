/**
 * Service pour la Business Intelligence et la monétisation de contenu
 */

import { InvokeLLM } from '@/api/integrations';

class BusinessIntelligenceService {
  async generateBusinessInsights(videos) {
    const contentContext = this.prepareContentContext(videos);

    try {
      const prompt = `En tant qu'expert en stratégie business et marketing, analyse le contenu suivant et génère des insights pour la monétisation et la croissance.

Contenu source :
${contentContext}

Je veux une analyse complète au format JSON, incluant :
1.  **ProductOpportunities**: 3 idées de produits ou services (cours, ebook, service, SaaS) basées sur le contenu. Pour chaque idée, fournis une description, le marché cible, et une estimation de revenu mensuel potentiel.
2.  **LeadMagnets**: 2 idées de lead magnets (checklist, template, mini-guide PDF) pour capturer des prospects.
3.  **AffiliateProducts**: 3 suggestions de produits d'affiliation pertinents à promouvoir.
4.  **PerformancePrediction**: Une prédiction de performance pour un contenu "best-of" créé à partir de ces vidéos. Inclus un score de viralité (sur 10), une estimation de portée, le meilleur moment pour publier, et des suggestions d'amélioration.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            productOpportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ['Cours en ligne', 'Ebook', 'Service de Coaching', 'SaaS'] },
                  title: { type: "string" },
                  description: { type: "string" },
                  targetMarket: { type: "string" },
                  estimatedRevenue: { type: "string" }
                }
              }
            },
            leadMagnets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ['Checklist PDF', 'Template Notion', 'Mini-Guide'] },
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            performancePrediction: {
              type: "object",
              properties: {
                viralScore: { type: "number" },
                estimatedReach: { type: "string" },
                bestPublishTime: { type: "string" },
                suggestions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });
      return result;

    } catch (error) {
      console.error("Erreur lors de la génération d'insights business:", error);
      throw error;
    }
  }

  prepareContentContext(videos) {
    return videos.map(video => {
      return `
        Titre: ${video.title}
        Résumé: ${video.ai_summary || video.transcript.substring(0, 300)}
        Thèmes: ${video.tags?.join(', ') || 'N/A'}
      `;
    }).join('\n\n---\n\n');
  }
}

export const businessIntelligenceService = new BusinessIntelligenceService();


