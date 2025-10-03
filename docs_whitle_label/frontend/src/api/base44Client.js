import { createClient } from '@base44/sdk';

// Crée un client Base44 (optionnel). Si vous n'utilisez pas Base44, remplacez les
// appels à InvokeLLM par aiService.invokeLLM ou aiService.openAIRequest.
export const base44 = createClient({
  appId: "your_base44_app_id",
  requiresAuth: false
});


