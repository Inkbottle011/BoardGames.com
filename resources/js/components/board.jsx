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
    
    const gridStyle = {
        height: '100vh',
        width: '100vw',
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gridTemplateRows: 'auto 1fr auto',
        gap: '0.5rem',
        position: 'relative',
        background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #1a2e1a 100%)',
        color: 'white',
        overflow: 'hidden',
        boxSizing: 'border-box',
    };
    
    return (
        <div style={gridStyle}>
        
        {/* TOP-LEFT — scoreboard */}
        <div style={{ gridColumn: '1', gridRow: '1', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Scoreboard
        players={gameState.players}
        currentTurn={gameState.current_turn}
        />
        </div>
        
        {/* TOP-CENTER — top opponent */}
        <div style={{ gridColumn: '2', gridRow: '1', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {topPlayer && <PlayerArea player={topPlayer} />}
        </div>
        
        {/* TOP-RIGHT — empty or right opponent */}
        <div style={{ gridColumn: '3', gridRow: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        {rightPlayer && <PlayerArea player={rightPlayer} />}
        </div>
        
        {/* CENTER ROW */}
        <div style={{
            gridColumn: '1 / 4',
            gridRow: '2',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'nowrap',
        }}>
        {/* Draw + discard */}
        <Deck
        deckSize={gameState.deckSize}
        discardPile={gameState.discardPile}
        showDiscard={true}
        inline={false}
        />
        
        {/* Current Age */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <div className="center-panel" style={{ minWidth: '9rem', maxWidth: '12rem', padding: '0.75rem', textAlign: 'center' }}>
        {gameState.age ? (
            <>
            <p style={{ color: 'var(--nature-yellow)', fontFamily: 'var(--font-title)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {gameState.age.age_name}
            </p>
            <p style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem' }}>
            {gameState.age.text}
            </p>
            {gameState.age.catastrophe && (
                <p className="catastrophe-warning" style={{ fontSize: '0.75rem' }}>⚠ Catastrophe!</p>
            )}
            </>
        ) : (
            <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>No Age</p>
        )}
        <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem' }}>
        💀 {gameState.catastrophe_count ?? 0} / 3
        </p>
        </div>
        </div>
        
        {/* Age Deck */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <div className="age-deck" style={{ width: '5rem', height: '7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>AGE</span>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Age Deck</p>
        </div>
        
        {/* Age pile slots */}
        {[1, 2, 3].map(n => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div className="age-pile" style={{ width: '5rem', height: '7rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gameState[`agePile${n}`]?.length > 0 ? (
                <img
                src={`/${gameState[`agePile${n}`][gameState[`agePile${n}`].length - 1].img}.png`}
                alt="age"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Age {n}</span>
            )}
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Age {n}</p>
            </div>
        ))}
        </div>
        
        {/* BOTTOM-LEFT — left opponent */}
        <div style={{ gridColumn: '1', gridRow: '3', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
        {leftPlayer && <PlayerArea player={leftPlayer} />}
        </div>
        
        {/* BOTTOM-CENTER — you */}
        <div style={{ gridColumn: '2', gridRow: '3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <PlayerArea player={currentPlayer} isYou />
        <Hand cards={currentPlayer?.hand || []} onPlay={onPlay} />
        </div>
        
        {/* BOTTOM-RIGHT — empty */}
        <div style={{ gridColumn: '3', gridRow: '3' }} />
        
        </div>
    );
}