import Card from "./Card";

export default function Hand({ cards, gameId, playerId, onPlay }) {
    const playCard = (cardId) => {
        // Broadcast the played card to all other players in this game
        // via Laravel Reverb on a private channel named e.g. "game.1"
        window.Echo.private(`game.${gameId}`)
            .whisper("playCard", {
                // Send which card was played and who played it
                cardId: cardId,
                playerId: playerId,
            });

        // Also update the local UI immediately without waiting for the server
        if (onPlay) onPlay(cardId);
    };

    return (
        // Horizontal scrolling row of cards
        <div className="flex gap-3 overflow-x-auto p-2">
            {cards && cards.length > 0 ? (
                // Render a Card component for each card in hand
                cards.map((card) => (
                    <Card key={card.id} card={card} onPlay={playCard} />
                ))
            ) : (
                // Show a message if the player has no cards
                <p className="text-gray-500 italic text-sm">No cards in hand</p>
            )}
        </div>
    );
}