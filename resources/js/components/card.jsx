export default function Card({ card, onPlay }) {
    return (
        <div
            className="game-card"
            style={{ width: "7rem", height: "10rem" }}
            onClick={() => onPlay && onPlay(card.id)}
        >
            <img
                src={card.img ? `/${card.img}` : "/images/card_not_found.png"}
                alt={card.card_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                    e.target.src = "/images/card_not_found.png";
                }}
            />
        </div>
    );
}
