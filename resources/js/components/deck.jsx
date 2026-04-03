export default function Deck({
    deckSize,
    discardPile,
    showDiscard = true,
    inline = false,
}) {
    const topDiscard =
    discardPile && discardPile.length > 0
    ? discardPile[discardPile.length - 1]
    : null;
    
    return (
        <div
        className={
            inline
            ? "inline-block align-top mx-2"
            : "flex gap-6 items-center justify-center"
        }
        >
        {/* Draw pile */}
        <div
        className={
            inline
            ? "inline-block align-top text-center"
            : "flex flex-col items-center gap-1"
        }
        >
        <div
        className="deck-pile"
        style={{ width: "5rem", height: "7rem", position: 'relative', overflow: 'hidden', borderRadius: '10px' }}
        >
        <img
        src="/images/doomlings_basegame_images/Traitback.jpg"
        alt="Deck"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span style={{
            position: 'absolute',
            bottom: '4px',
            right: '6px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '1px 5px',
            borderRadius: '4px',
        }}>
        {deckSize}
        </span>
        </div>
        <p className="text-xs opacity-60">Draw Pile</p>
        </div>
        
        {/* Discard pile  replace when discard.jsx is functional*/}
        {showDiscard && (
            <div
            className={
                inline
                ? "inline-block align-top text-center"
                : "flex flex-col items-center gap-1"
            }
            >
            {topDiscard ? (
                <div
                className="game-card"
                style={{ width: "5rem", height: "7rem" }}
                >
                <img
                src={
                    topDiscard.img
                    ? `/${topDiscard.img}`
                    : "/images/card_not_found.png"
                }
                alt={topDiscard.card_name}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
                />
                </div>
            ) : (
                <div
                className="discard-pile"
                style={{ width: "5rem", height: "7rem" }}
                >
                <span className="text-xs">Empty</span>
                </div>
            )}
            <p className="text-xs opacity-60">Discard Pile</p>
            </div>
        )}
        </div>
    );
}