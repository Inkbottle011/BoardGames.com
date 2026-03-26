function Hand({ cards }) {
    const playCard = (id) => {
        socket.emit("playCard", { cardId: id });
    };

    return (
        <div className="flex gap-3 overflow-x-auto p-2">
            {cards.map((card) => (
                <Card key={card.id} card={card} onPlay={playCard} />
            ))}
        </div>
    );
}
//<Card card={card} onClick={() => playCard(card)} />
