const API_KEYS = (process.env.OPENDOTA_API_KEYS || '').split(',').filter(Boolean);
let keyIndex = 0;

function getNextKey(): string | null {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
}

export async function opendotaFetch(endpoint: string, options?: RequestInit) {
  const key = getNextKey();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `https://api.opendota.com/api${endpoint}${key ? `${separator}api_key=${key}` : ''}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options?.headers,
    },
  });

  if (res.status === 429) {
    // Rate limited, try next key
    const retryKey = getNextKey();
    const retryUrl = `https://api.opendota.com/api${endpoint}${retryKey ? `${separator}api_key=${retryKey}` : ''}`;
    return fetch(retryUrl, options);
  }

  return res;
}

export { API_KEYS };
