import { createClient } from '@neondatabase/neon-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  // neonAuthUrl is the relative "/auth" (proxied same-origin, see functions/auth/[[path]].ts)
  // so the session cookie is first-party — but the SDK requires an absolute URL, so resolve it
  // against the current origin here rather than baking a fixed domain in at build time.
  const authUrl = new URL(config.public.neonAuthUrl, window.location.origin).toString();
  const client = createClient({
    auth: { url: authUrl },
    dataApi: { url: config.public.neonDataApiUrl },
  });
  return { provide: { neon: client } };
});
