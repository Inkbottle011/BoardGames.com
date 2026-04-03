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
        <div className="h-screen w-screen p-4 grid grid-cols-3 grid-rows-3 gap-4 relative" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #1a2e1a 100%)' }}>
        
        {/* TOP-LEFT — left opponent */}
        <div className="col-start-1 row-start-1 flex justify-center items-start pt-2">
        {leftPlayer && <PlayerArea player={leftPlayer} />}
        </div>
        
        {/* TOP-CENTER — top opponent */}
        <div className="col-start-2 row-start-1 flex justify-center items-start pt-2">
        {topPlayer && <PlayerArea player={topPlayer} />}
        </div>
        
        {/* TOP-RIGHT — scoreboard */}
        <div className="col-start-3 row-start-1 flex justify-end items-start pt-2">
        <Scoreboard
        players={gameState.players}
        currentTurn={gameState.current_turn}
        />
        </div>
        
        {/* CENTER ROW — game area */}
        <div className="col-start-1 col-end-4 row-start-2 center-piles">
        
        {/* Draw + discard */}
        <Deck
        deckSize={gameState.deckSize}
        discardPile={gameState.discardPile}
        showDiscard={true}
        inline={false}
        />
        
        {/* Current Age */}
        <div className="flex flex-col items-center gap-1">
        <div className="center-panel text-center p-2" style={{ minWidth: '9rem' }}>
        {gameState.age ? (
            <>
            <p className="text-xs font-bold" style={{ color: 'var(--nature-yellow)' }}>
            {gameState.age.age_name}
            </p>
            <p className="text-xs opacity-70 mt-1">{gameState.age.text}</p>
            {gameState.age.catastrophe && (
                <p className="catastrophe-warning text-xs mt-1">⚠ Catastrophe!</p>
            )}
            </>
        ) : (
            <p className="text-xs opacity-50">No Age</p>
        )}
        <p className="text-xs opacity-40 mt-2">
        💀 {gameState.catastrophe_count ?? 0} / 3
        </p>
        </div>
        </div>
        
        {/* Age Deck */}
        <div className="flex flex-col items-center gap-1">
        <div className="age-deck" style={{ width: '5rem', height: '7rem' }}>
        <span className="text-white font-bold text-sm">AGE</span>
        </div>
        <p className="text-xs opacity-60">Age Deck</p>
        </div>
        
        {/* Age pile slots */}
        {[1, 2, 3].map(n => (
            <div key={n} className="flex flex-col items-center gap-1">
            <div className="age-pile" style={{ width: '5rem', height: '7rem', overflow: 'hidden' }}>
            {gameState[`agePile${n}`]?.length > 0 ? (
                <img
                src={`/${gameState[`agePile${n}`][gameState[`agePile${n}`].length - 1].img}`}
                alt="age"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <span className="text-xs opacity-50">Age {n}</span>
            )}
            </div>
            <p className="text-xs opacity-60">Age {n}</p>
            </div>
        ))}
        
        {/* Right opponent in center row */}
        {rightPlayer && <PlayerArea player={rightPlayer} />}
        </div>
        
        {/* BOTTOM-LEFT — empty */}
        <div className="col-start-1 row-start-3" />
        
        {/* BOTTOM-CENTER — you */}
        <div className="col-start-2 row-start-3 flex flex-col items-center gap-2">
        <PlayerArea player={currentPlayer} isYou />
        <Hand cards={currentPlayer?.hand || []} onPlay={onPlay} />
        </div>
        
        {/* BOTTOM-RIGHT — empty */}
        <div className="col-start-3 row-start-3" />
        
        </div>
    );
}