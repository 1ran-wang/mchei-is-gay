import { getPlayers } from "@/lib/players";
import PlayerCard from "@/components/PlayerCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const players = await getPlayers();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            DotaWatch
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Monitoring the squad 👁️</p>
          <a href="/accounts" className="text-gray-600 hover:text-gray-400 text-sm mt-2 inline-block">
            Manage Accounts →
          </a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.name} player={player} />
          ))}
        </div>

        <footer className="text-center text-gray-600 mt-16 text-sm">
          Powered by OpenDota API • Built with spite and love
        </footer>
      </div>
    </main>
  );
}
