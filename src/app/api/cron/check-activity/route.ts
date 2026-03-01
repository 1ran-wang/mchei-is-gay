import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAllSteamIds } from "@/lib/players";

const BASE_URL = "https://api.opendota.com/api";

export async function GET() {
  try {
    const steamIds = await getAllSteamIds();
    const results = [];

    for (const steamId of steamIds) {
      // Get latest match from OpenDota
      const res = await fetch(`${BASE_URL}/players/${steamId}/recentMatches?limit=1`, { cache: "no-store" });
      if (!res.ok) continue;
      const matches = await res.json();
      if (!matches.length) continue;

      const latestMatch = matches[0];
      const matchAge = Date.now() / 1000 - latestMatch.start_time;

      // Check for open activity session
      const openSession = await prisma.activitySession.findFirst({
        where: { steamId, endedAt: null },
        orderBy: { startedAt: "desc" },
      });

      if (matchAge < 1800 && !openSession) {
        // Started playing (match < 30 min old, no open session)
        const isWin = (latestMatch.player_slot < 128) === latestMatch.radiant_win;
        await prisma.activitySession.create({
          data: { steamId, matchCount: 1, wins: isWin ? 1 : 0, losses: isWin ? 0 : 1 },
        });
        results.push({ steamId, action: "started" });
      } else if (openSession && matchAge > 3600) {
        // Stopped playing (no match in 1 hour)
        await prisma.activitySession.update({
          where: { id: openSession.id },
          data: { endedAt: new Date() },
        });
        results.push({ steamId, action: "stopped" });
      }
    }

    return NextResponse.json({ checked: steamIds.length, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
