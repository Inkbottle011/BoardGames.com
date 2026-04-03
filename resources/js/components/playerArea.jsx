export default function PlayerArea({ player, isYou }) {
    if (!player) return null;
    
    return (
        <div className="player-panel" style={{ textAlign: 'center', minWidth: '8rem', maxWidth: '14rem' }}>
        <h3 style={{
            fontFamily: 'var(--font-title)',
            fontSize: isYou ? '1.1rem' : '0.9rem',
            color: 'var(--nature-yellow)',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
        }}>
        {isYou ? 'You' : player.name ?? `Player ${player.id}`}
        </h3>
        
        <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.15rem' }}>
        🃏 {player.hand?.length ?? 0} cards
        </p>
        
        <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.15rem' }}>
        🧬 {player.genepool ?? 0} gene pool
        </p>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--nature-yellow)', marginBottom: '0.25rem' }}>
        {player.points ?? 0} pts
        </p>
        
        {player.traitpool?.filter(t => t != null).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            {player.traitpool.filter(t => t != null).map((trait, i) => (
                <span key={i} className="trait-chip">{trait.card_name}</span>
            ))}
            </div>
        )}
        </div>
    );
}