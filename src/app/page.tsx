import { PLAYERS } from "@/lib/players";
import PlayerCard from "@/components/PlayerCard";

export const revalidate = 300; // revalidate every 5 min

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            DotaWatch
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Monitoring the squad 👁️</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAYERS.map((player) => (
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
