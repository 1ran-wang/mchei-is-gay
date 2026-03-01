import { prisma } from "./db";

export interface Player {
  name: string;
  steamIds: string[];
  color: string;
}

const COLORS: Record<string, string> = {
  WANGYIRAN: "#3b82f6",
  HUCAIRUI: "#ef4444",
  JAY: "#22c55e",
};

export async function getPlayers(): Promise<Player[]> {
  const accounts = await prisma.account.findMany({
    where: { usedBy: { not: null }, steamId: { not: null } },
    select: { usedBy: true, steamId: true },
  });

  const grouped: Record<string, string[]> = {};
  for (const acc of accounts) {
    if (!acc.usedBy || !acc.steamId) continue;
    if (!grouped[acc.usedBy]) grouped[acc.usedBy] = [];
    if (!grouped[acc.usedBy].includes(acc.steamId)) {
      grouped[acc.usedBy].push(acc.steamId);
    }
  }

  return Object.entries(grouped).map(([name, steamIds]) => ({
    name,
    steamIds,
    color: COLORS[name] || "#a855f7",
  }));
}

export async function getAllSteamIds(): Promise<string[]> {
  const accounts = await prisma.account.findMany({
    where: { steamId: { not: null } },
    select: { steamId: true },
  });
  return [...new Set(accounts.map(a => a.steamId!).filter(Boolean))];
}
