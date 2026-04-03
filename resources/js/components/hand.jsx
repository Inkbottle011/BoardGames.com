import Card from "./card";

export default function Hand({ cards, onPlay }) {
    return (
        <div className="hand-area flex gap-3 overflow-x-auto p-2">
        {cards && cards.length > 0 ? (
            cards.map((card, index) => (
                <Card key={`${card.id}-${index}`} card={card} onPlay={onPlay} />
            ))
        ) : (
            <p className="opacity-50 italic text-sm">No cards in hand</p>
        )}
        </div>
    );
}
