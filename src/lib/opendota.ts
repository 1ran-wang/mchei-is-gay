import { prisma } from "./db";

const BASE_URL = "https://api.opendota.com/api";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchJson(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { cache: "no-store" });
  if (res.status === 429) throw new Error("Rate limited");
  if (!res.ok) throw new Error(`OpenDota ${res.status}`);
  return res.json();
}

export async function getPlayerProfile(steamId: string) {
  const cached = await prisma.profileCache.findUnique({ where: { steamId } });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return {
      profile: { profile: { personaname: cached.personaName, avatarfull: cached.avatarUrl }, rank_tier: cached.rankTier, mmr_estimate: { estimate: cached.mmrEstimate } },
      wl: { win: cached.wins, lose: cached.losses },
    };
  }

  const [profile, wl] = await Promise.all([
    fetchJson(`/players/${steamId}`),
    fetchJson(`/players/${steamId}/wl`),
  ]);

  const mmr = profile?.mmr_estimate?.estimate || null;
  const rank = profile?.rank_tier || null;

  await prisma.profileCache.upsert({
    where: { steamId },
    update: {
      personaName: profile?.profile?.personaname,
      avatarUrl: profile?.profile?.avatarfull,
      rankTier: rank,
      mmrEstimate: mmr,
      wins: wl?.win || 0,
      losses: wl?.lose || 0,
      fetchedAt: new Date(),
    },
    create: {
      steamId,
      personaName: profile?.profile?.personaname,
      avatarUrl: profile?.profile?.avatarfull,
      rankTier: rank,
      mmrEstimate: mmr,
      wins: wl?.win || 0,
      losses: wl?.lose || 0,
    },
  });

  const lastMmr = await prisma.mmrHistory.findFirst({
    where: { steamId },
    orderBy: { recordedAt: "desc" },
  });
  if (!lastMmr || lastMmr.mmrEstimate !== mmr || lastMmr.rankTier !== rank) {
    await prisma.mmrHistory.create({ data: { steamId, mmrEstimate: mmr, rankTier: rank } });
  }

  return { profile, wl };
}

export async function getRecentMatches(steamId: string, limit = 20) {
  const cached = await prisma.matchCache.findMany({
    where: { steamId },
    orderBy: { startTime: "desc" },
    take: limit,
  });

  const cacheAge = cached.length > 0 ? Date.now() - cached[0].fetchedAt.getTime() : Infinity;
  if (cached.length > 0 && cacheAge < CACHE_TTL_MS) {
    return cached.map(m => ({
      match_id: Number(m.matchId),
      hero_id: m.heroId,
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
      player_slot: m.playerSlot,
      radiant_win: m.radiantWin,
      duration: m.duration,
      start_time: m.startTime,
    }));
  }

  const matches = await fetchJson(`/players/${steamId}/recentMatches?limit=${limit}`);

  if (Array.isArray(matches)) {
    for (const m of matches) {
      await prisma.matchCache.upsert({
        where: { matchId_steamId: { matchId: BigInt(m.match_id), steamId } },
        update: { fetchedAt: new Date() },
        create: {
          matchId: BigInt(m.match_id),
          steamId,
          heroId: m.hero_id,
          kills: m.kills,
          deaths: m.deaths,
          assists: m.assists,
          playerSlot: m.player_slot,
          radiantWin: m.radiant_win,
          duration: m.duration,
          startTime: m.start_time,
        },
      });
    }
  }

  return matches;
}
