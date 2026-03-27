import Hand from "./Hand";
import Deck from "./Deck";
import Scoreboard from "./Scoreboard";
export default function Board({ gameState, gameId, playerId, onPlay }) {
    if (!gameState || !gameState.players) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="h-screen bg-gradient-to-br from-green-200 to-green-400 p-4 flex flex-col justify-between">
        
        {/* Top — opponents */}
        <div className="flex justify-center gap-4">
        {gameState.players
            // Filter out the current player so we only show opponents
            .filter((_, i) => i !== playerId)
            .map((player, i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-3 text-center min-w-24">
                <p className="text-sm font-bold text-gray-700">Player {i + 1}</p>
                {/* Show card count without revealing opponent cards */}
                <p className="text-xs text-gray-500">{player.hand?.length ?? 0} cards</p>
                {/* Show opponent traits */}
                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                {player.traitpool?.map((trait, j) => (
                    <span key={j} className="text-xs bg-gray-100 rounded px-1">
                    {trait.card_name}
                    </span>
                ))}
                </div>
                </div>
            ))
        }
        </div>
        
        {/* Center — age info and deck */}
        <div className="flex justify-center items-center gap-8">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center border">
        <h2 className="text-2xl font-bold text-gray-800">
        Age {gameState.age}
        </h2>
        {/* Show catastrophe warning if applicable */}
        {gameState.catastrophe && (
            <p className="text-red-500 text-sm font-semibold">⚠ Catastrophe!</p>
        )}
        <p className="text-sm text-gray-500">Event Phase</p>
        </div>
        
        {/* Deck and discard pile */}
        <Deck
        deckSize={gameState.deckSize}
        discardPile={gameState.discardPile}
        />
        {/* Scoreboard */}
        <Scoreboard
        players={gameState.players}
        currentTurn={gameState.current_turn}
        />
        </div>
        
        {/* Bottom — current player */}
        <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-700">You</p>
        
        {/* Current player's traits */}
        <div className="flex gap-2 flex-wrap justify-center">
        {gameState.players[playerId]?.traitpool?.map((trait, i) => (
            <span key={i} className="text-xs bg-white rounded-xl px-2 py-1 shadow">
            {trait.card_name}
            </span>
        ))}
        </div>
        
        {/* Current player's hand wired to Reverb */}
        <Hand
        cards={gameState.players[playerId]?.hand}
        gameId={gameId}
        playerId={playerId}
        onPlay={onPlay}
        />
        </div>
        
        </div>
    );
}