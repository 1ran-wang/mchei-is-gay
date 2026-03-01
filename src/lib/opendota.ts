const BASE_URL = "https://api.opendota.com/api";

// Simple rate limiter: track calls
let callCount = 0;
let minuteStart = Date.now();

function checkRateLimit() {
  const now = Date.now();
  if (now - minuteStart > 60000) {
    callCount = 0;
    minuteStart = now;
  }
  if (callCount >= 55) { // leave some margin under 60/min
    throw new Error("Rate limit approaching, try again in a minute");
  }
  callCount++;
}

export async function opendotaFetch(endpoint: string) {
  checkRateLimit();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    next: { revalidate: 300 }, // cache 5 min
  });

  if (res.status === 429) {
    throw new Error("OpenDota rate limit hit");
  }

  if (!res.ok) {
    throw new Error(`OpenDota API error: ${res.status}`);
  }

  return res.json();
}

export async function getPlayerProfile(steamId: string) {
  return opendotaFetch(`/players/${steamId}`);
}

export async function getRecentMatches(steamId: string, limit = 20) {
  return opendotaFetch(`/players/${steamId}/recentMatches?limit=${limit}`);
}

export async function getWinLoss(steamId: string) {
  return opendotaFetch(`/players/${steamId}/wl`);
}

export async function getPlayerHeroes(steamId: string, limit = 10) {
  return opendotaFetch(`/players/${steamId}/heroes?limit=${limit}`);
}

export async function getMatch(matchId: string) {
  return opendotaFetch(`/matches/${matchId}`);
}
