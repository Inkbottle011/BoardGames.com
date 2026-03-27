export default function Scoreboard({ players, currentTurn }) {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Scoreboard</h3>
        
        {/* One row per player */}
        {players.map((player, i) => (
            <div
            key={player.id}
            className={`flex items-center justify-between p-2 rounded-xl ${
                // Highlight the current player's turn
                player.id === currentTurn
                ? "bg-green-100 border border-green-400"
                : "bg-gray-50"
            }`}
            >
            {/* Player name and turn indicator */}
            <div className="flex items-center gap-2">
            {player.id === currentTurn && (
                // Pulsing dot to show whose turn it is
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
            <p className="text-sm font-semibold text-gray-700">
            Player {i + 1}
            </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4 text-xs text-gray-500">
            {/* Gene pool count */}
            <span>🧬 {player.genepool}</span>
            {/* Points */}
            <span className="font-bold text-gray-800">{player.points} pts</span>
            </div>
            </div>
        ))}
        </div>
    );
}