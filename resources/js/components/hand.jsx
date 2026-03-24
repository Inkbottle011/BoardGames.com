function Hand({ cards }) {
    const playCard = (id) => {
        socket.emit("playCard", { cardId: id });
    };

    return (
        <div className="hand">
            {cards.map((card) => (
                <Card key={card.id} card={card} onPlay={playCard} />
            ))}
        </div>
    );
}
