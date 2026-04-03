import Hand from "./hand";
import Deck from "./deck";
import PlayerArea from "./playerArea";
import Scoreboard from "./scoreboard";

export default function Board({ gameState, gameId, playerId, onPlay }) {
    if (!gameState || !gameState.players) {
        return <div>Loading...</div>;
    }
    
    const currentPlayer = gameState.players.find((p) => p.id === playerId);
    const opponents = gameState.players.filter((p) => p.id !== playerId);
    
    const topPlayer = opponents[0];
    const leftPlayer = opponents[1];
    const rightPlayer = opponents[2];
    
    return (
        <div className="h-screen w-screen p-6 grid grid-cols-3 grid-rows-3 gap-16 bg-gradient-to-br from-green-900 to-green-700 text-white relative">
        
        {/* TOP PLAYER */}
        <div className="col-start-2 row-start-1 flex justify-center">
        {topPlayer && <PlayerArea player={topPlayer} />}
        </div>
        
        {/* TOP-RIGHT CORNER - Scoreboard */}
        <div className="absolute top-6 right-6">
        <Scoreboard
        players={gameState.players}
        currentTurn={gameState.current_turn}
        />
        </div>
        
        {/* LEFT PLAYER */}
        <div className="col-start-1 row-start-1 flex justify-center">
        {leftPlayer && <PlayerArea player={leftPlayer} />}
        </div>
        
        {/* CENTER GAME AREA */}
        <div className="col-start-1 col-end-4 row-start-2 center-piles">
        <Deck
        deckSize={gameState.deckSize}
        discardPile={gameState.discardPile}
        showDiscard={true}
        inline={false}
        />
        
        {/* Current Age display */}
        <div className="flex flex-col items-center gap-1">
        <div className="center-panel text-center p-2" style={{ minWidth: '8rem' }}>
        {gameState.age ? (
            <>
            <p className="text-xs font-bold">{gameState.age.age_name}</p>
            <p className="text-xs opacity-70">{gameState.age.text}</p>
            {gameState.age.catastrophe && (
                <p className="catastrophe-warning text-xs">⚠ Catastrophe!</p>
            )}
            </>
        ) : (
            <p className="text-xs opacity-50">No Age</p>
        )}
        <p className="text-xs opacity-40 mt-1">
        💀 {gameState.catastrophe_count ?? 0} / 3
        </p>
        </div>
        </div>
        
        {/* Age Deck backside */}
        <div className="flex flex-col items-center gap-1">
        <div className="age-deck" style={{ width: "5rem", height: "7rem" }}>
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        AGE
        </div>
        </div>
        <p className="text-xs opacity-60">Age Deck</p>
        </div>
        
        {/* Age pile slots */}
        {[1, 2, 3].map(n => (
            <div key={n} className="flex flex-col items-center gap-1">
            <div className="age-pile" style={{ width: "5rem", height: "7rem", overflow: "hidden" }}>
            {gameState[`agePile${n}`]?.length > 0 ? (
                <img
                src={`/${gameState[`agePile${n}`][gameState[`agePile${n}`].length - 1].img}`}
                alt="age"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <span className="text-xs opacity-50">Age {n}</span>
            )}
            </div>
            <p className="text-xs opacity-60">Age {n}</p>
            </div>
        ))}
        </div>
        
        {/* RIGHT PLAYER */}
        <div className="col-start-3 row-start-3 flex items-center justify-center">
        {rightPlayer && <PlayerArea player={rightPlayer} />}
        </div>
        
        {/* YOU (BOTTOM) */}
        <div className="col-start-2 row-start-3 flex flex-col items-center gap-2">
        <div className="scale-110">
        <PlayerArea player={currentPlayer} isYou />
        </div>
        <Hand cards={currentPlayer?.hand || []} onPlay={onPlay} />
        </div>
        
        </div>
    );
}