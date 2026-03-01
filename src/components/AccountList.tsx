"use client";

import { Player } from "@/lib/players";
import { useState, useEffect } from "react";

interface MatchData {
  match_id: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  start_time: number;
}

interface ProfileData {
  profile: {
    profile: {
      personaname: string;
      avatarfull: string;
    };
    rank_tier: number | null;
    mmr_estimate: { estimate: number | null };
  };
  wl: { win: number; lose: number };
}

function isWin(match: MatchData): boolean {
  const isRadiant = match.player_slot < 128;
  return isRadiant ? match.radiant_win : !match.radiant_win;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export default function AccountList({ player }: { player: Player }) {
  const [accounts, setAccounts] = useState<
    Map<string, { profile: ProfileData | null; matches: MatchData[] | null; loading: boolean; error: string | null }>
  >(new Map());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const initial = new Map<string, { profile: ProfileData | null; matches: MatchData[] | null; loading: boolean; error: string | null }>();
    player.steamIds.forEach((id) => {
      initial.set(id, { profile: null, matches: null, loading: true, error: null });
    });
    setAccounts(initial);

    // Fetch all profiles with staggered requests
    player.steamIds.forEach((id, index) => {
      setTimeout(async () => {
        try {
          const [profileRes, matchesRes] = await Promise.all([
            fetch(`/api/players/${id}/profile`),
            fetch(`/api/players/${id}/matches`),
          ]);
          const profile = await profileRes.json();
          const matches = await matchesRes.json();

          setAccounts((prev) => {
            const next = new Map(prev);
            next.set(id, {
              profile: profile.error ? null : profile,
              matches: Array.isArray(matches) ? matches : null,
              loading: false,
              error: profile.error || null,
            });
            return next;
          });
        } catch {
          setAccounts((prev) => {
            const next = new Map(prev);
            next.set(id, { profile: null, matches: null, loading: false, error: "Failed to fetch" });
            return next;
          });
        }
      }, index * 500); // stagger 500ms apart
    });
  }, [player.steamIds]);

  return (
    <div className="space-y-3">
      {player.steamIds.map((steamId) => {
        const data = accounts.get(steamId);
        if (!data) return null;

        const name = data.profile?.profile?.profile?.personaname || steamId;
        const winRate = data.profile?.wl
          ? Math.round((data.profile.wl.win / (data.profile.wl.win + data.profile.wl.lose)) * 100)
          : null;
        const lastMatch = data.matches?.[0];
        const recentWins = data.matches?.slice(0, 5).filter(isWin).length ?? 0;

        return (
          <div key={steamId} className="bg-gray-800/50 rounded-lg p-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpanded(expanded === steamId ? null : steamId)}
            >
              <div className="flex items-center gap-3">
                {data.profile?.profile?.profile?.avatarfull && (
                  <img
                    src={data.profile.profile.profile.avatarfull}
                    alt={name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <span className="font-medium text-sm">
                    {data.loading ? "Loading..." : name}
                  </span>
                  {winRate !== null && (
                    <span className="text-gray-500 text-xs ml-2">
                      {winRate}% WR
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lastMatch && (
                  <span className="text-gray-500 text-xs">
                    {timeAgo(lastMatch.start_time)}
                  </span>
                )}
                <div className="flex gap-0.5">
                  {data.matches?.slice(0, 5).map((m, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${isWin(m) ? "bg-green-500" : "bg-red-500"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">▼</span>
              </div>
            </div>

            {expanded === steamId && data.matches && (
              <div className="mt-3 space-y-1">
                {data.matches.slice(0, 10).map((match) => (
                  <div
                    key={match.match_id}
                    className={`flex justify-between text-xs px-2 py-1 rounded ${
                      isWin(match) ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"
                    }`}
                  >
                    <span>{isWin(match) ? "W" : "L"}</span>
                    <span>
                      {match.kills}/{match.deaths}/{match.assists}
                    </span>
                    <span>{formatDuration(match.duration)}</span>
                    <span>{timeAgo(match.start_time)}</span>
                  </div>
                ))}
                <a
                  href={`https://www.opendota.com/players/${steamId}`}
                  target="_blank"
                  className="text-xs text-blue-400 hover:underline block mt-2"
                >
                  View on OpenDota →
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
