import { useEffect } from 'react';

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
  useEffect(() => {
    if (lang) {
      document.documentElement.lang = lang;
    }
    if (title) {
      document.title = title;
    }
    const ensureMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        const tagName = selector.startsWith('meta') ? 'meta' : selector.startsWith('link') ? 'link' : 'meta';
        el = document.createElement(tagName) as any;
        document.head.appendChild(el!);
      }
      Object.entries(attrs).forEach(([k, v]) => (el as any).setAttribute(k, v));
      return el;
    };
    if (description) ensureMeta('meta[name="description"]', { name: 'description', content: description });
    if (canonical) ensureMeta('link[rel="canonical"]', { rel: 'canonical', href: canonical });
    if (ogImage) ensureMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    if (title) ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    if (description) ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    if (noIndex) ensureMeta('meta[name="robots"]', { name: 'robots', content: 'noindex,nofollow' });
    // JSON-LD: nettoyer précédents puis réinjecter
    const previous = Array.from(document.head.querySelectorAll('script[data-seo-jsonld="1"]'));
    previous.forEach((n) => n.remove());
    const items = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
    items.forEach((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '1');
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }, [title, description, canonical, ogImage, noIndex, jsonLd, lang]);

  return null;
}


