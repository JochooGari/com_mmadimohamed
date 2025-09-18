import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  lang?: string;
}

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  noIndex,
  jsonLd,
  lang = 'fr-FR',
}: SEOHeadProps) {
  const json = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  return (
    <Helmet htmlAttributes={{ lang }}>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:title" content={title ?? ''} />
      <meta property="og:description" content={description ?? ''} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {json.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
      <link rel="alternate" hrefLang="fr-FR" href={canonical} />
    </Helmet>
  );
}


