# Configuration des Credentials n8n

## 🔐 Credentials nécessaires pour le workflow complet

### 1. Anthropic (Claude Sonnet 4.5)

**Utilisé dans:**
- STEP 1 - Research
- STEP 3 - Review

**Configuration:**
1. Dans n8n: **Credentials** → **Add Credential** → **Anthropic**
2. Remplissez:
   - **Name**: `Anthropic account` (ou personnalisé)
   - **API Key**: Votre clé Anthropic (`sk-ant-...`)
   - **Base URL**: `https://api.anthropic.com` (défaut)
3. **Test** puis **Save**

---

### 2. OpenAI (GPT-5.1)

**Utilisé dans:**
- STEP 2 - Draft (GPT-5.1)
- STEP 5 - Rewrite (GPT-5.1)

**Configuration:**
1. Dans n8n: **Credentials** → **Add Credential** → **OpenAI**
2. Remplissez:
   - **Name**: `OpenAI account`
   - **API Key**: Votre clé OpenAI (`sk-proj-...`)
   - **Base URL**: `https://api.openai.com/v1` (défaut)
3. **Test** puis **Save**

**⚠️ Important pour GPT-5:**
- Le workflow utilise l'endpoint `/v1/responses` (pas `/v1/chat/completions`)
- Format: JSON Schema strict pour garantir du JSON valide
- Max tokens: 8000 pour articles longs

---

### 3. Perplexity (Sonar)

**Utilisé dans:**
- STEP 4 - Score (évaluation SEO/GEO)

**Configuration:**
1. Dans n8n: **Credentials** → **Add Credential** → **Header Auth**
2. Remplissez:
   - **Name**: `Perplexity API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer VOTRE_CLE_PERPLEXITY`
3. **Save**

**Où trouver la clé:**
- Dashboard Perplexity: https://www.perplexity.ai/settings/api
- Format: `pplx-...`

---

### 4. Supabase (déjà configuré)

**Utilisé dans:**
- Get Internal Articles (recherche d'articles publiés)
- Save to Supabase (sauvegarde article final)

**Configuration:**
Les headers sont **déjà intégrés** dans le workflow JSON:
```json
{
  "apikey": "eyJhbGciOiJI...",
  "Authorization": "Bearer eyJhbGciOiJI..."
}
```

**Si vous voulez utiliser un credential:**
1. Créez: **Header Auth** → `Supabase Service Role`
2. Headers:
   - `apikey`: Votre Service Role Key
   - `Authorization`: `Bearer [Service Role Key]`

---

## ✅ Vérification rapide

### Test des credentials

```bash
# Test Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-5-20250929","max_tokens":100,"messages":[{"role":"user","content":"Test"}]}'

# Test OpenAI (GPT-5)
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-5-pro-preview","input":[{"role":"user","content":[{"type":"input_text","text":"Test"}]}],"reasoning":{"effort":"low"},"max_output_tokens":100}'

# Test Perplexity
curl https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"sonar","messages":[{"role":"user","content":"Test"}],"max_tokens":100}'

# Test Supabase
curl https://xroduivvgnviqjdvehuw.supabase.co/rest/v1/articles \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  | jq '.[] | .title' | head -5
```

---

## 🔄 Configuration dans le workflow

Une fois les credentials créés dans n8n:

1. **Ouvrez** le workflow importé
2. **Pour chaque HTTP Request node**:
   - Cliquez sur le node
   - Dans **Authentication**, sélectionnez le credential correspondant:
     - `STEP 1 - Research` → **Anthropic account**
     - `STEP 2 - Draft` → **OpenAI account**
     - `STEP 3 - Review` → **Anthropic account**
     - `STEP 4 - Score` → **Perplexity API** (Header Auth)
     - `STEP 5 - Rewrite` → **OpenAI account**
3. **Sauvegardez** le workflow

---

## 🆘 Troubleshooting

### "Credential not found"
→ Vérifiez que le nom du credential correspond exactement
→ Ou recréez le credential avec le nom attendu

### "Invalid API key" (401)
→ Vérifiez que la clé API est active et valide
→ Testez la clé avec curl (voir ci-dessus)

### "Rate limit exceeded" (429)
→ Attendez quelques secondes
→ Vérifiez vos quotas API
→ Ajoutez des délais entre les nodes si nécessaire

### GPT-5 renvoie "Model not found"
→ Vérifiez que vous avez accès à GPT-5.1
→ Le modèle s'appelle `gpt-5-pro-preview`
→ Utilisez l'endpoint `/v1/responses` (pas `/chat/completions`)

---

## 📊 Coûts estimés par article

**Workflow complet (1 itération):**
- Research (Claude): ~$0.015
- Draft (GPT-5.1): ~$0.25
- Review (Claude): ~$0.02
- Score (Perplexity): ~$0.01
- **Total: ~$0.30 par article**

**Avec 3 itérations (si score < 95%):**
- Rewrite x2: ~$0.50
- Review x2: ~$0.04
- Score x2: ~$0.02
- **Total: ~$0.90 par article**

---

## 🎯 Recommandations

1. **Testez d'abord** le workflow simple avant le complet
2. **Vérifiez les quotas** de vos APIs avant de lancer en production
3. **Activez le monitoring** dans n8n pour voir les erreurs
4. **Gardez des backups** de vos credentials (fichier `.env` sécurisé)

