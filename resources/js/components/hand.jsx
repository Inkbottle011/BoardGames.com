import Card from "./card";

export default function Hand({ cards, onPlay, onHover }) {
    return (
        <div className="hand-area flex gap-3 overflow-x-auto p-2">
        {cards && cards.length > 0 ? (
            cards.filter(c => c != null).map((card, index) => (
                <div
                
                key={`${card.id}-${index}`}
                onMouseEnter={() => onHover && onHover(card)}
                onMouseLeave={() => onHover && onHover(null)}
                >
                <Card card={card} onPlay={onPlay} />
                </div>
            ))
        ) : (
            <p className="opacity-50 italic text-sm">No cards in hand</p>
        )}
        </div>
    );
}