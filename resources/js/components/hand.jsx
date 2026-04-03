import Card from "./card";

export default function Hand({ cards, gameId, playerId, onPlay }) {
    const playCard = (cardId) => {
        window.Echo.private(`game.${gameId}`).whisper("playCard", {
            cardId: cardId,
            playerId: playerId,
        });
        if (onPlay) onPlay(cardId);
    };

    return (
        <div className="hand-area">
            {cards && cards.length > 0 ? (
                cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        onClick={() => playCard(card.id)}
                    />
                ))
            ) : (
                <p className="opacity-50 italic text-sm">No cards in hand</p>
            )}
        </div>
    );
}
