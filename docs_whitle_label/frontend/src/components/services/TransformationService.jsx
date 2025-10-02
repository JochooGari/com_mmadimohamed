/**
 * Service de transformation de contenu avec Intelligence IA
 */

import { InvokeLLM } from '@/api/integrations';

export class TransformationService {
  async generateContent({ format, videos, contentIntelligence, options = {} }) {
    const { 
      includeVideoMetadata = true,
      optimizeForSEO = false,
      maxTweetCount = 10,
      useViralQuotes = [],
      useKeyMoments = []
    } = options;

    try {
      // Préparer le contenu source avec intelligence
      const sourceContent = this.prepareIntelligentSourceContent(
        videos, 
        contentIntelligence, 
        includeVideoMetadata
      );
      
      // Générer selon le format avec intelligence
      switch (format) {
        case 'blog':
          return await this.generateIntelligentBlogArticle(sourceContent, contentIntelligence, optimizeForSEO);
        case 'twitter':
          return await this.generateIntelligentTwitterThread(sourceContent, contentIntelligence, maxTweetCount);
        case 'newsletter':
          return await this.generateIntelligentNewsletter(sourceContent, contentIntelligence);
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
    } catch (error) {
      console.error(`Erreur génération ${format}:`, error);
      throw error;
    }
  }

  prepareIntelligentSourceContent(videos, intelligence, includeMetadata) {
    let content = videos.map(video => {
      let videoContent = `Titre: ${video.title}\n`;
      
      if (includeMetadata) {
        videoContent += `Chaîne: ${video.channel_title}\n`;
        videoContent += `Vues: ${video.view_count?.toLocaleString() || 0}\n`;
        videoContent += `Date: ${new Date(video.published_at).toLocaleDateString()}\n`;
      }
      
      if (video.ai_summary) {
        videoContent += `Résumé: ${video.ai_summary}\n`;
      }
      
      if (video.key_points && video.key_points.length > 0) {
        videoContent += `Points clés: ${video.key_points.join(', ')}\n`;
      }
      
      videoContent += `\nTranscription:\n${video.transcript}\n`;
      
      return videoContent;
    }).join('\n---\n\n');

    // Ajouter l'intelligence de contenu
    if (intelligence) {
      content += '\n\n=== INTELLIGENCE DE CONTENU ===\n';
      
      if (intelligence.viralQuotes && intelligence.viralQuotes.length > 0) {
        content += '\nCitations virales identifiées:\n';
        intelligence.viralQuotes.forEach((quote, i) => {
          content += `${i+1}. "${quote.text}" (Score: ${quote.viralScore}/10)\n`;
        });
      }
      
      if (intelligence.keyMoments && intelligence.keyMoments.length > 0) {
        content += '\nMoments clés pour clips courts:\n';
        intelligence.keyMoments.forEach((moment, i) => {
          content += `${i+1}. ${moment.title} (${moment.startTime}-${moment.endTime})\n`;
        });
      }
      
      if (intelligence.contentAnalysis) {
        content += `\nAnalyse globale:\n`;
        content += `- Score viral moyen: ${intelligence.contentAnalysis.avgViralScore}/10\n`;
        content += `- Sentiment: ${intelligence.contentAnalysis.sentiment}\n`;
        content += `- Sujets principaux: ${intelligence.contentAnalysis.topTopics.join(', ')}\n`;
      }
    }
    
    return content;
  }

  async generateIntelligentBlogArticle(sourceContent, intelligence, optimizeForSEO) {
    const viralQuotesContext = intelligence?.viralQuotes 
      ? `Utilise ces citations à fort potentiel viral dans l'article: ${intelligence.viralQuotes.map(q => `"${q.text}"`).join(', ')}` 
      : '';

    const prompt = `Transforme ce contenu YouTube en article de blog professionnel ${optimizeForSEO ? 'optimisé SEO' : ''} en utilisant l'intelligence de contenu fournie.

Source avec intelligence:
${sourceContent}

Instructions:
- Crée un titre accrocheur ${optimizeForSEO ? 'et optimisé SEO' : ''}
- Utilise les citations virales identifiées comme hooks et points d'attention
- Structure avec des sous-titres H2 et H3
- Intègre les moments clés comme exemples concrets
- Rédige une introduction captivante basée sur les insights
- Développe le contenu en utilisant l'intelligence fournie
- Conclusion avec call-to-action fort
- Ton professionnel mais accessible
- ${viralQuotesContext}
- 1000-1500 mots

Format: Markdown avec structure claire`;

    const result = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          seo_keywords: { type: "array", items: { type: "string" } },
          meta_description: { type: "string" },
          viral_elements_used: { type: "array", items: { type: "string" } }
        }
      }
    });

    return {
      format: 'blog',
      content: result.content,
      metadata: {
        title: result.title,
        wordCount: result.content.split(' ').length,
        estimatedReadTime: Math.ceil(result.content.split(' ').length / 200),
        seoKeywords: result.seo_keywords,
        metaDescription: result.meta_description,
        viralElementsUsed: result.viral_elements_used,
        intelligenceEnhanced: true
      },
      generatedAt: new Date()
    };
  }

  async generateIntelligentTwitterThread(sourceContent, intelligence, maxTweetCount) {
    const viralQuotesContext = intelligence?.viralQuotes 
      ? `Utilise prioritairement ces citations virales: ${intelligence.viralQuotes.slice(0, 3).map(q => `"${q.text}"`).join(', ')}` 
      : '';

    const prompt = `Transforme ce contenu YouTube en thread Twitter viral et engageant en utilisant l'intelligence de contenu.

Source avec intelligence:
${sourceContent}

Instructions:
- Crée un thread de ${maxTweetCount} tweets maximum
- Tweet d'ouverture ultra-accrocheur utilisant les éléments viraux identifiés
- ${viralQuotesContext}
- Intègre les citations à fort potentiel viral comme tweets principaux
- Chaque tweet = 280 caractères maximum
- Utilise des émojis pertinents
- Numérotation claire (1/X, 2/X...)
- Ton conversationnel et punchy
- Call-to-action final basé sur les insights
- Thread optimisé pour le retweet et l'engagement

Format: Un tweet par ligne, séparés par une ligne vide`;

    const result = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          thread: { type: "string" },
          tweet_count: { type: "number" },
          hashtags: { type: "array", items: { type: "string" } },
          viral_quotes_used: { type: "array", items: { type: "string" } },
          estimated_engagement_score: { type: "number" }
        }
      }
    });

    return {
      format: 'twitter',
      content: result.thread,
      metadata: {
        tweetCount: result.tweet_count,
        hashtags: result.hashtags,
        totalCharacters: result.thread.length,
        viralQuotesUsed: result.viral_quotes_used,
        estimatedEngagementScore: result.estimated_engagement_score,
        intelligenceEnhanced: true
      },
      generatedAt: new Date()
    };
  }

  async generateIntelligentNewsletter(sourceContent, intelligence) {
    const keyMomentsContext = intelligence?.keyMoments 
      ? `Highlights à inclure: ${intelligence.keyMoments.map(m => m.title).join(', ')}` 
      : '';

    const prompt = `Transforme ce contenu YouTube en newsletter email marketing professionnelle en utilisant l'intelligence de contenu.

Source avec intelligence:
${sourceContent}

Instructions:
- Objet email accrocheur basé sur les éléments viraux
- En-tête personnalisé et chaleureux
- Structure claire avec sections basées sur les insights
- ${keyMomentsContext}
- Intègre les citations virales comme highlights
- Contenu de valeur et actionnable
- Call-to-action clair et motivant
- Signature professionnelle
- Ton conversationnel et expert
- Format HTML simple et responsive
- 400-600 mots

Format: HTML avec styling basique inline`;

    const result = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          content: { type: "string" },
          preview_text: { type: "string" },
          cta_text: { type: "string" },
          key_highlights: { type: "array", items: { type: "string" } }
        }
      }
    });

    return {
      format: 'newsletter',
      content: result.content,
      metadata: {
        subject: result.subject,
        previewText: result.preview_text,
        ctaText: result.cta_text,
        keyHighlights: result.key_highlights,
        wordCount: result.content.replace(/<[^>]*>/g, '').split(' ').length,
        estimatedReadTime: Math.ceil(result.content.replace(/<[^>]*>/g, '').split(' ').length / 200),
        intelligenceEnhanced: true
      },
      generatedAt: new Date()
    };
  }
}

// Instance singleton
export const transformationService = new TransformationService();


