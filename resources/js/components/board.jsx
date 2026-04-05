import Hand from "./hand";
import Scoreboard from "./scoreboard";
import TraitPool from "./TraitPool";
import { useState } from "react";

export default function Board({ gameState, gameId, playerId, onPlay, prompt, gameLog}) {
    if (!gameState || !gameState.players) {
        return <div>Loading...</div>;
    }
    
    const currentPlayer = gameState.players.find((p) => p.id === playerId);
    const opponents = gameState.players.filter((p) => p.id !== playerId);
    const [hoveredCard, setHoveredCard] = useState(null);
    
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridTemplateRows: '1fr auto',
            background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #1a2e1a 100%)',
            color: 'white',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}>
        
        {/* LEFT COLUMN */}
        <div style={{
            gridColumn: '1',
            gridRow: '1 / 3',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(0,0,0,0.25)',
            borderRight: '1px solid rgba(74,124,74,0.3)',
            overflowY: 'hidden',
            width: 'fit-content',
        }}>
        
        {/* Age Deck */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
        <div style={{ width: '7rem', height: '9.8rem', overflow: 'hidden', borderRadius: '10px', position: 'relative' }}>
        <img src="/images/doomlings_basegame_images/Ageback.jpg" alt="Age Deck"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <span style={{
            position: 'absolute', bottom: '5px', right: '6px',
            background: 'rgba(0,0,0,0.8)', color: 'white',
            fontSize: '0.85rem', fontWeight: 'bold',
            padding: '2px 6px', borderRadius: '4px',
        }}>{gameState.ageDeckSize ?? 0}</span>
        </div>
        <p style={{ fontSize: '0.65rem', opacity: 0.6 }}>Age Deck</p>
        </div>
        
        <div style={{ width: '90%', height: '1px', background: 'rgba(74,124,74,0.4)' }} />
        
        {/* Draw Deck */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
        <div style={{ width: '7rem', height: '9.8rem', overflow: 'hidden', borderRadius: '10px', position: 'relative' }}>
        <img src="/images/doomlings_basegame_images/Traitback.jpg" alt="Deck"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <span style={{
            position: 'absolute', bottom: '5px', right: '6px',
            background: 'rgba(0,0,0,0.8)', color: 'white',
            fontSize: '0.85rem', fontWeight: 'bold',
            padding: '2px 6px', borderRadius: '4px',
        }}>{gameState.deckSize ?? 0}</span>
        </div>
        <p style={{ fontSize: '0.65rem', opacity: 0.6 }}>Draw</p>
        </div>
        
        <div style={{ width: '90%', height: '1px', background: 'rgba(74,124,74,0.4)' }} />
        
        {/* Discard */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
        <div className="discard-pile" style={{ width: '7rem', height: '9.8rem' }}>
        <span style={{ fontSize: '0.65rem' }}>Empty</span>
        </div>
        <p style={{ fontSize: '0.65rem', opacity: 0.6 }}>Discard</p>
        </div>
        
        <div style={{ width: '90%', height: '1px', background: 'rgba(74,124,74,0.4)' }} />
        
        {/* Catastrophe counter */}
        <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>
        💀 {gameState.catastrophe_count ?? 0} / 3
        </p>
        {gameState.age?.catastrophe && (
            <p className="catastrophe-warning" style={{ fontSize: '0.7rem' }}>⚠ Catastrophe!</p>
        )}
        
        <div style={{ width: '90%', height: '1px', background: 'rgba(74,124,74,0.4)' }} />
        
        {/* Scoreboard */}
        <Scoreboard players={gameState.players} currentTurn={gameState.current_turn} />
        
        </div>
        
        <div style={{
    gridColumn: '2',
    gridRow: '1',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '0.75rem 1rem',
    overflow: 'hidden',
    minHeight: 0,
}}>
        
        {/* Age piles + reader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
        <div style={{
            display: 'inline-flex',
            flexDirection: 'row',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
        }}>
        {[1, 2, 3].map(n => {
            const pile = gameState[`agePile${n}`] ?? [];
            const isActive = pile.length > 0 && (gameState[`agePile${n + 1}`] ?? []).length === 0;
            return (
                <div key={n}>
                <div
                className="age-pile"
                style={{
                    width: '7rem',
                    height: '9.8rem',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    cursor: pile.length > 0 ? 'pointer' : 'default',
                    border: isActive ? '3px solid var(--nature-yellow)' : '2px dashed rgba(74,124,74,0.5)',
                    boxShadow: isActive ? '0 0 12px rgba(249,202,36,0.5)' : 'none',
                    transition: 'border 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={() => { if (pile.length > 0) setHoveredCard(pile[pile.length - 1]); }}
                onMouseLeave={() => setHoveredCard(null)}
                >
                {pile.length > 0 ? (
                    <img
                    src={`/${pile[pile.length - 1].img}.png`}
                    alt={`Age ${n}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/card_not_found.png'; }}
                    />
                ) : (
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>—</span>
                )}
                </div>
                </div>
            );
        })}
        </div>
        
        {/* Card hover reader */}
        <div style={{
            width: '17rem',
            height: '24rem',
            background: 'rgba(26,46,26,0.95)',
            border: '2px solid var(--nature-light)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}>
        {hoveredCard ? (
            <img
            src={hoveredCard.img
                ? `/${hoveredCard.img}${hoveredCard.age_name ? '.png' : ''}`
                : '/images/card_not_found.png'}
                alt={hoveredCard.card_name ?? hoveredCard.age_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = '/images/card_not_found.png'; }}
                />
            ) : (
                <p style={{ fontSize: '0.7rem', opacity: 0.35, textAlign: 'center', padding: '1rem' }}>
                Hover a card to preview
                </p>
            )}
            </div>
            </div>
            
            {/* All trait pools */}
<div style={{
    flex: 1,
    display: 'grid',
    gridTemplateRows: `repeat(${opponents.length + 1}, 1fr)`,
    gap: '0.5rem',
    overflowY: 'auto',
    height: '100%',
    minHeight: 0,
}}>
{opponents.map(opponent => (
    <div key={opponent.id} style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '0.5rem',
        overflow: 'hidden',
        minHeight: 0,
    }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0, width: '5rem' }}>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--nature-yellow)' }}>
                {opponent.name ?? `Player ${opponent.id}`}
            </p>
            <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                🃏 {opponent.hand?.length ?? 0} 🧬 {opponent.genepool}
            </span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <TraitPool traitpool={opponent.traitpool} size={80} onHover={setHoveredCard} isActive={opponent.id === gameState.current_turn} />
        </div>
    </div>
))}


{/* Your trait pool */}
<div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '0.5rem',
    overflow: 'hidden',
    minHeight: 0,
}}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0, width: '5rem' }}>
        <p style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--nature-yellow)' }}>
            {currentPlayer?.name ?? 'You'}
        </p>
        <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>
            🃏 {currentPlayer?.hand?.length ?? 0} 🧬 {currentPlayer?.genepool}
        </span>
    </div>
    <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <TraitPool traitpool={currentPlayer?.traitpool} size={80} onHover={setHoveredCard} isActive={currentPlayer?.id === gameState.current_turn} />
    </div>
</div>
</div>

</div>
{/* RIGHT BOTTOM */}
<div style={{
    gridColumn: '2',
    gridRow: '2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: '1rem',
    padding: '0.5rem 1rem',
    borderTop: '1px solid rgba(74,124,74,0.3)',
    background: 'rgba(0,0,0,0.15)',
    maxHeight: '16rem',
    overflow: 'hidden',
}}>
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
    <p style={{
        fontFamily: 'var(--font-title)',
        fontSize: '0.8rem',
        color: 'var(--nature-yellow)',
        textAlign: 'center',
    }}>
        {currentPlayer?.name ?? 'You'}
        <span style={{ fontSize: '0.65rem', opacity: 0.6, marginLeft: '0.5rem' }}>
            🧬 {currentPlayer?.genepool}
        </span>
    </p>
    <Hand
        cards={currentPlayer?.hand || []}
        onPlay={onPlay}
        onHover={setHoveredCard}
    />
</div>

{/* Right side — log + prompt stacked */}
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0, overflow: 'hidden' }}>
    {/* Game log */}
    <div style={{
        flex: 1,
        minHeight: 0,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '10px',
        border: '1px solid rgba(74,124,74,0.2)',
        padding: '0.5rem',
        fontSize: '0.7rem',
        opacity: 0.7,
        overflowY: 'auto',
    }}>
        {gameLog.length === 0 ? (
            <p style={{ opacity: 0.4 }}>Game events will appear here</p>
        ) : (
            gameLog.map((entry, i) => (
                <p key={i} style={{ margin: '0.1rem 0' }}>⚡ <span dangerouslySetInnerHTML={{ __html: entry }} /></p>
            ))
        )}
    </div>

    {/* Prompt area */}
    <div style={{
        flexShrink: 0,
        minHeight: '4rem',
        maxHeight: '5rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '10px',
        border: '1px solid rgba(74,124,74,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden',
    }}>
    {prompt ? (
        <p style={{ color: 'var(--nature-yellow)', fontSize: '0.85rem', textAlign: 'center' }}>
            {prompt}
        </p>
    ) : (
        <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Action prompts will appear here</p>
    )}
    </div>
</div>
</div>

</div>
    );
}