export interface Player {
  name: string;
  steamIds: string[];
  color: string;
}

export const PLAYERS: Player[] = [
  {
    name: "WANGYIRAN",
    steamIds: ["1878038311", "1878035863", "1879169708", "1910871590", "832277664", "1921114845", "826956595", "1027781618", "800163903"],
    color: "#3b82f6", // blue
  },
  {
    name: "HUCAIRUI",
    steamIds: ["1877291958", "1878087395", "1877647328", "1918353556", "832312786", "1921671543", "826279909", "1026835324", "799952949"],
    color: "#ef4444", // red
  },
  {
    name: "JAY",
    steamIds: ["1876201730", "1878025274", "1884260188", "832304199", "1028175263", "799626335"],
    color: "#22c55e", // green
  },
];

export const ALL_STEAM_IDS = PLAYERS.flatMap(p => p.steamIds);
