import { Player } from "@/lib/players";
import AccountList from "./AccountList";

interface Props {
  player: Player;
}

export default function PlayerCard({ player }: Props) {
  return (
    <div
      className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-colors"
      style={{ borderTopColor: player.color, borderTopWidth: "3px" }}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: player.color }}>
          {player.name}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          {player.steamIds.length} accounts tracked
        </p>
        <AccountList player={player} />
      </div>
    </div>
  );
}
