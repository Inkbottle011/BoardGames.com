import Hand from "./hand";
import Deck from "./deck";
import Scoreboard from "./scoreboard";

export default function Board({ gameState, gameId, playerId, onPlay }) {
    if (!gameState || !gameState.players) {
        return <div>Loading...</div>;
    }
    
    const opponents = gameState.players.filter((_, i) => i !== playerId);
    
    // Position opponents around the board based on how many there are
    const getOpponentPosition = (index, total) => {
        if (total === 1) return "col-start-2 row-start-1"; // top center
        if (total === 2) {
            return index === 0
            ? "col-start-1 row-start-2" // left
            : "col-start-3 row-start-2"; // right
        }
        if (total === 3) {
            if (index === 0) return "col-start-1 row-start-2"; // left
            if (index === 1) return "col-start-2 row-start-1"; // top
            if (index === 2) return "col-start-3 row-start-2"; // right
        }
        return "col-start-2 row-start-1";
    };
    
    return (
        <div className="h-screen w-screen bg-green-300 p-4 grid grid-cols-3 grid-rows-3 gap-4">
        
        {/* Opponents — positioned dynamically around the board */}
        {opponents.map((player, i) => (
            <div
            key={player.id}
            className={`${getOpponentPosition(i, opponents.length)} flex justify-center items-center`}
            >
            <div className="bg-white rounded-2xl shadow p-3 text-center min-w-24">
            <p className="text-sm font-bold text-gray-700">Player {i + 1}</p>
            {/* Hide opponent hand size */}
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
            </div>
        ))}
        
        {/* Center — age info, deck, scoreboard */}
        <div className="col-start-2 row-start-2 flex flex-col justify-center items-center gap-2">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center border">
        <h2 className="text-2xl font-bold text-gray-800">Age {gameState.age}</h2>
        {gameState.catastrophe && (
            <p className="text-red-500 text-sm font-semibold">⚠ Catastrophe!</p>
        )}
        <p className="text-sm text-gray-500">Event Phase</p>
        </div>
        
        <Deck
        deckSize={gameState.deckSize}
        discardPile={gameState.discardPile}
        />
        
        <Scoreboard
        players={gameState.players}
        currentTurn={gameState.current_turn}
        />
        </div>
        
        {/* Bottom — current player */}
        <div className="col-start-2 row-start-3 flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-700">You</p>
        
        {/* Current player traits */}
        <div className="flex gap-2 flex-wrap justify-center">
        {gameState.players[playerId]?.traitpool?.map((trait, i) => (
            <span key={i} className="text-xs bg-white rounded-xl px-2 py-1 shadow">
            {trait.card_name}
            </span>
        ))}
        </div>
        
        {/* Current player hand */}
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