import { createClient } from '@neondatabase/neon-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const client = createClient({
    auth: { url: config.public.neonAuthUrl },
    dataApi: { url: config.public.neonDataApiUrl },
  });
  return { provide: { neon: client } };
});
