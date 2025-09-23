import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wand2, Target, Lightbulb, CheckCircle, Zap, Hash } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: 'rewrite' | 'optimize' | 'suggest' | 'check';
}

interface AIAssistantProps {
  content: {
    title: string;
    slug: string;
    excerpt: string;
    content_md: string;
    keywords: string[];
  };
  onContentSuggestion: (suggestion: string) => void;
}

const QUICK_ACTIONS = [
  {
    id: 'rewrite',
    label: 'Réécrire',
    icon: Wand2,
    prompt: 'Réécrire ce paragraphe pour le rendre plus engageant',
    description: 'Améliore le style et l\'engagement'
  },
  {
    id: 'optimize-seo',
    label: 'Optimiser SEO',
    icon: Target,
    prompt: 'Optimiser ce contenu pour le SEO',
    description: 'Améliore le référencement'
  },
  {
    id: 'suggest',
    label: 'Suggérer',
    icon: Lightbulb,
    prompt: 'Suggérer des améliorations pour cette section',
    description: 'Propose des idées d\'amélioration'
  },
  {
    id: 'check',
    label: 'Vérifier',
    icon: CheckCircle,
    prompt: 'Vérifier la qualité et cohérence de ce texte',
    description: 'Analyse la qualité du contenu'
  }
];

const SLASH_COMMANDS = [
  {
    command: '/seo',
    description: 'Analyse SEO du paragraphe sélectionné',
    example: '/seo analyser ce titre'
  },
  {
    command: '/geo',
    description: 'Optimisation pour moteurs génératifs',
    example: '/geo optimiser pour featured snippet'
  },
  {
    command: '/expand',
    description: 'Développer une idée',
    example: '/expand ajouter des exemples'
  },
  {
    command: '/summarize',
    description: 'Résumer une section',
    example: '/summarize cette partie'
  },
  {
    command: '/tone',
    description: 'Ajuster le ton',
    example: '/tone plus professionnel'
  },
  {
    command: '/keywords',
    description: 'Suggérer des mots-clés LSI',
    example: '/keywords pour "marketing digital"'
  }
];

const PREDEFINED_PROMPTS = [
  "Rendre ce paragraphe plus engageant",
  "Ajouter des données et statistiques",
  "Optimiser pour la position 0",
  "Créer une meta description accrocheuse",
  "Générer des questions FAQ pertinentes",
  "Améliorer la lisibilité du texte",
  "Ajouter des transitions entre sections",
  "Créer un appel à l'action efficace"
];

export default function AIAssistant({ content, onContentSuggestion }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: `👋 Salut ! Je suis ton assistant IA pour l'écriture.

Je peux t'aider à :
• Optimiser ton contenu SEO/GEO
• Réécrire et améliorer des sections
• Suggérer des idées et structures
• Vérifier la qualité de ton texte

Utilise les commandes slash (ex: /seo, /expand) ou sélectionne du texte pour commencer !`,
      timestamp: new Date()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect slash commands
  useEffect(() => {
    setShowCommands(inputText.startsWith('/'));
  }, [inputText]);

  const handleSendMessage = async (text?: string, action?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      action: action as any
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simuler réponse IA (à remplacer par vraie API)
      const response = await simulateAIResponse(messageText, action, content, selectedText);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "Désolé, une erreur s'est produite. Peux-tu réessayer ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (selectedText) {
      handleSendMessage(`${action.prompt}: "${selectedText}"`, action.id);
    } else {
      handleSendMessage(action.prompt, action.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSlashCommand = (command: string) => {
    setInputText(command + ' ');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          <Bot className="w-4 h-4 inline mr-2" />
          Assistant IA
        </h3>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="flex items-center gap-2 px-2 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              title={action.description}
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div className={`flex-1 max-w-xs ${message.type === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Action buttons for assistant messages */}
              {message.type === 'assistant' && message.content.length > 50 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onContentSuggestion(message.content)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Appliquer
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    Copier
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Slash Commands Popup */}
      {showCommands && (
        <div className="mx-4 mb-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Commandes disponibles</div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {SLASH_COMMANDS
              .filter(cmd => cmd.command.toLowerCase().includes(inputText.toLowerCase()))
              .map(cmd => (
                <button
                  key={cmd.command}
                  onClick={() => handleSlashCommand(cmd.command)}
                  className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
                >
                  <div className="font-medium text-purple-600 dark:text-purple-400">{cmd.command}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{cmd.description}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Predefined Prompts */}
      {!showCommands && inputText === '' && (
        <div className="mx-4 mb-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">💡 Suggestions rapides :</div>
          <div className="flex flex-wrap gap-1">
            {PREDEFINED_PROMPTS.slice(0, 3).map(prompt => (
              <button
                key={prompt}
                onClick={() => setInputText(prompt)}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écris ton message ou utilise / pour les commandes..."
            rows={2}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Ctrl+Entrée pour envoyer • Utilise / pour les commandes
        </div>
      </div>
    </div>
  );
}

// Simuler réponse IA (à remplacer par vraie intégration)
async function simulateAIResponse(
  prompt: string,
  action: string | undefined,
  content: any,
  selectedText: string
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simule latence API

  if (prompt.startsWith('/seo')) {
    return `📊 **Analyse SEO :**

${selectedText ? `Pour le texte sélectionné "${selectedText.substring(0, 50)}..." :` : 'Pour votre contenu :'}

✅ **Points forts :**
• Bonne structure avec des titres H2/H3
• Présence de mots-clés pertinents

⚠️ **À améliorer :**
• Densité de mots-clés à optimiser (actuellement ~1.2%)
• Ajouter des mots-clés LSI : "stratégie digitale", "performance"
• Meta description manquante ou trop courte

🎯 **Recommandations :**
1. Intégrer 2-3 variations du mot-clé principal
2. Ajouter des sous-titres descriptifs
3. Créer des liens internes vers contenus complémentaires`;
  }

  if (prompt.startsWith('/geo')) {
    return `🎯 **Optimisation GEO (Moteurs Génératifs) :**

Pour optimiser ce contenu pour les IA et featured snippets :

📋 **Structure recommandée :**
• Format question-réponse direct
• Listes numérotées et à puces
• Définitions claires et concises

📊 **Données structurées :**
• Ajouter des tableaux comparatifs
• Inclure des statistiques récentes
• Créer une section FAQ

💡 **Suggestions spécifiques :**
1. Commencer par une définition claire en 1-2 phrases
2. Utiliser des sous-titres sous forme de questions
3. Ajouter une section "Points clés à retenir"`;
  }

  if (prompt.startsWith('/expand')) {
    return `💡 **Développement de contenu :**

Voici comment enrichir cette section :

🔍 **Exemples concrets à ajouter :**
• Cas d'usage pratique avec chiffres
• Témoignage client ou étude de cas
• Screenshots ou visuels explicatifs

📈 **Données et statistiques :**
• Rechercher des stats récentes (2024)
• Comparer "avant/après"
• Benchmarks sectoriels

🎯 **Approfondissements :**
• Méthodologie étape par étape
• Erreurs courantes à éviter
• Outils recommandés avec liens`;
  }

  if (action === 'rewrite') {
    return `✨ **Version réécrite plus engageante :**

${selectedText ?
  `"${selectedText}" devient :

"Imaginez pouvoir transformer vos résultats en seulement 30 jours. C'est exactement ce que permet cette approche innovante utilisée par plus de 10 000 entreprises."` :

  `Voici une version plus engageante de votre introduction :

"Et si vous pouviez doubler votre efficacité en changeant juste une habitude ? C'est ce que nous allons découvrir ensemble dans cet article basé sur 3 ans de recherches et plus de 1000 témoignages."`}

🎯 **Améliorations apportées :**
• Accroche avec question ou statistique frappante
• Ton plus conversationnel et direct
• Promesse de valeur claire
• Crédibilité renforcée avec données`;
  }

  // Réponse générale
  return `Merci pour votre question !

${selectedText ? `À propos du texte sélectionné : "${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"` : ''}

Voici mes suggestions pour améliorer votre contenu :

💡 **Recommandations principales :**
• Améliorer l'accroche pour captiver dès les premières lignes
• Structurer avec des sous-titres plus descriptifs
• Ajouter des exemples concrets et des données chiffrées
• Renforcer l'appel à l'action en fin d'article

Souhaitez-vous que je développe l'une de ces suggestions ?`;
}