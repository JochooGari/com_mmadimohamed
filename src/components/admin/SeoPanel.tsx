interface SeoValues {
  title?: string;
  excerpt?: string;
  content_md?: string;
  keywords?: string[];
}

function wordCount(text: string): number {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function scoreTitleLen(len: number) {
  if (len >= 35 && len <= 60) return 20;
  if (len >= 25 && len <= 70) return 15;
  return 8;
}

function scoreMetaLen(len: number) {
  if (len >= 120 && len <= 155) return 20;
  if (len >= 90 && len <= 180) return 15;
  return 8;
}

function scoreKeywordsPresence(text: string, kws: string[]) {
  if (!kws?.length) return 10;
  const hit = kws.filter(k => text.toLowerCase().includes(k.toLowerCase())).length;
  if (hit >= Math.min(3, kws.length)) return 20;
  if (hit >= 1) return 12;
  return 6;
}

function scoreLengthWords(n: number) {
  if (n >= 1200) return 20;
  if (n >= 800) return 15;
  if (n >= 500) return 10;
  return 6;
}

export default function SeoPanel({ values }: { values: SeoValues }) {
  const title = values.title || '';
  const meta = values.excerpt || '';
  const body = values.content_md || '';
  const kws = values.keywords || [];

  const sTitle = scoreTitleLen(title.length);
  const sMeta = scoreMetaLen(meta.length);
  const sKws = scoreKeywordsPresence((title + ' ' + meta + ' ' + body).slice(0, 5000), kws);
  const sLen = scoreLengthWords(wordCount(body));
  const total = sTitle + sMeta + sKws + sLen; // /80 then *100 but we keep /80
  const percent = Math.round((total / 80) * 100);

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="font-semibold">SEO Score</div>
      <div className="text-2xl font-bold">{percent}/100</div>
      <ul className="text-sm space-y-1 text-slate-700">
        <li>Titre: {title.length} caractères — {(sTitle>=20?'Excellent':sTitle>=15?'Bon':'À améliorer')}</li>
        <li>Méta desc.: {meta.length} caractères — {(sMeta>=20?'Excellent':sMeta>=15?'Bon':'À améliorer')}</li>
        <li>Mots-clés trouvés: {kws.length ? sKws>=20?'3+':'1+' : '0'} — {(sKws>=20?'OK':kws.length? 'Ajoutez 2-3 usages naturels':'Ajoutez 2-4 keywords')}</li>
        <li>Longueur: {wordCount(body)} mots — {(sLen>=20?'Très bien':sLen>=15?'Bien':'Court')}</li>
      </ul>
      {kws.length === 0 && (
        <div className="text-xs text-slate-500">Astuce: définissez vos keywords cibles dans le brief ou le titre pour améliorer la pertinence.</div>
      )}
    </div>
  );
}


