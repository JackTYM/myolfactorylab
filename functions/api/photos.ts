interface Env {
  PHOTOS: R2Bucket;
  NEON_JWKS_URL: string;
}

async function verifyUserId(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);

  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  // Any malformed base64/JSON/key material below (e.g. a token-shaped but
  // garbage value) must resolve to "invalid" (null -> 401), never throw
  // and surface as an uncaught 500.
  try {
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const jwksRes = await fetch(env.NEON_JWKS_URL);
    const jwks = await jwksRes.json<{ keys: JsonWebKey[] }>();
    const jwk = (jwks.keys as any[]).find((k) => k.kid === header.kid);
    if (!jwk) return null;

    // Neon Auth (Better Auth) signs JWTs with EdDSA (Ed25519), not RS256 —
    // verified against the live JWKS endpoint before implementing this.
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['verify']);
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('Ed25519', key, signature, data);
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await verifyUserId(request, env);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const comboId = url.searchParams.get('comboId') ?? 'combo';
  const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream';
  const ext = contentType.split('/')[1]?.split('+')[0] ?? 'bin';
  const key = `photos/${userId}/${comboId}-${crypto.randomUUID()}.${ext}`;

  await env.PHOTOS.put(key, request.body, { httpMetadata: { contentType } });
  return Response.json({ key });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await verifyUserId(request, env);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const key = new URL(request.url).searchParams.get('key');
  if (!key) return new Response('Missing key', { status: 400 });
  if (!key.startsWith(`photos/${userId}/`)) return new Response('Forbidden', { status: 403 });

  await env.PHOTOS.delete(key);
  return new Response(null, { status: 204 });
};
