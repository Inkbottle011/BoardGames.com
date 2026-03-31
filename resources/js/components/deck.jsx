export default function Deck({ deckSize, discardPile }) {
    const topDiscard = discardPile && discardPile.length > 0
        ? discardPile[discardPile.length - 1]
        : null;

    return (
        <div className="flex gap-6 items-center justify-center">
            {/* Draw pile */}
            <div className="flex flex-col items-center gap-1">
                <div className="deck-pile" style={{ width: '5rem', height: '7rem' }}>
                    {deckSize}
                </div>
                <p className="text-xs opacity-60">Draw Pile</p>
            </div>

            {/* Discard pile */}
            <div className="flex flex-col items-center gap-1">
                {topDiscard ? (
                    <div className="game-card" style={{ width: '5rem', height: '7rem' }}>
                        <img
                            src={topDiscard.img ? `/${topDiscard.img}` : '/images/card_not_found.png'}
                            alt={topDiscard.card_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                ) : (
                    <div className="discard-pile" style={{ width: '5rem', height: '7rem' }}>
                        <span className="text-xs">Empty</span>
                    </div>
                )}
                <p className="text-xs opacity-60">Discard Pile</p>
            </div>
        </div>
    );
}