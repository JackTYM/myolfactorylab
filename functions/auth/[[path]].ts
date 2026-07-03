// Same-origin proxy for Neon Auth. The browser talking directly to Neon's
// auth host (a different domain) makes the session cookie cross-site, which
// iOS Safari's WebClip storage partitioning silently drops — logins never
// persist once the app is added to the Home Screen. Proxying through our
// own domain makes the cookie first-party and sidesteps that entirely.
const NEON_AUTH_BASE = 'https://ep-dark-meadow-atpy3tcm.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth';

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const upstreamUrl = `${NEON_AUTH_BASE}${url.pathname.slice('/auth'.length)}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const upstreamRes = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstreamRes.headers);
  responseHeaders.delete('set-cookie');
  for (const cookie of upstreamRes.headers.getSetCookie()) {
    // Strip any Domain attribute so the cookie defaults to the host that
    // actually served this response (our domain), not the upstream one —
    // the browser would otherwise reject a Domain that doesn't match.
    responseHeaders.append('set-cookie', cookie.replace(/;\s*Domain=[^;]+/i, ''));
  }

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: responseHeaders,
  });
};
