declare global { interface Window { plausible?: (event: string, opts?: { props?: Record<string, any> }) => void } }

export function track(event: 'pageview' | 'download_resource' | 'contact_submit' | 'view_article' | 'view_resource', props?: Record<string, any>) {
  try { window.plausible?.(event, props ? { props } : undefined); } catch {}
}

export function trackPageview(path?: string) { track('pageview', { path: path ?? location.pathname }); }


