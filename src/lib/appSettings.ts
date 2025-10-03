export type ProviderId = 'openai' | 'anthropic' | 'perplexity' | 'google' | 'mistral' | 'local';

const LS_PROVIDER = 'app:default_provider';
const LS_MODEL = 'app:default_model';
const LS_TEMP = 'app:default_temperature';
const LS_MAXTOK = 'app:default_max_tokens';

export function setDefaultProviderModel(provider: ProviderId, model: string) {
  try {
    localStorage.setItem(LS_PROVIDER, provider);
    localStorage.setItem(LS_MODEL, model);
  } catch {}
}

export function getDefaultProvider(): ProviderId | null {
  try { return (localStorage.getItem(LS_PROVIDER) as ProviderId) || null; } catch { return null; }
}

export function getDefaultModel(): string | null {
  try { return localStorage.getItem(LS_MODEL) || null; } catch { return null; }
}

export function setDefaultParams(temperature?: number, maxTokens?: number) {
  try {
    if (typeof temperature === 'number') localStorage.setItem(LS_TEMP, String(temperature));
    if (typeof maxTokens === 'number') localStorage.setItem(LS_MAXTOK, String(maxTokens));
  } catch {}
}

export function getDefaultParams(): { temperature?: number; maxTokens?: number } {
  try {
    const tRaw = localStorage.getItem(LS_TEMP);
    const mRaw = localStorage.getItem(LS_MAXTOK);
    const out: { temperature?: number; maxTokens?: number } = {};
    if (tRaw != null && tRaw !== '') {
      const n = parseFloat(tRaw);
      if (!isNaN(n)) out.temperature = n;
    }
    if (mRaw != null && mRaw !== '') {
      const n = parseInt(mRaw);
      if (!isNaN(n)) out.maxTokens = n;
    }
    return out;
  } catch { return {}; }
}


