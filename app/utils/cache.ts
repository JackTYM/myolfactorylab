const PREFIX = 'olab:cache:';

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded or private-browsing — cache is a nice-to-have, not required
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
