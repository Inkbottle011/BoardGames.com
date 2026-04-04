function getCardImg(img, cardName) {
    if (!img && !cardName) return '/images/card_not_found.png';
    if (img) return `/${img}`;
    // Derive from card name
    const filename = cardName.replace(/ /g, '_').replace(/'/g, '') + '.png';
    return `/images/doomlings_basegame_images/cards/${filename}`;
}

export default function Card({ card, onPlay, onHover }) {
    return (
        <div
            className="game-card"
            style={{ width: "7rem", height: "10rem" }}
            onClick={() => onPlay && onPlay(card.id)}
            onMouseEnter={() => onHover && onHover(card)}
            onMouseLeave={() => onHover && onHover(null)}
        >
            <img
                src={getCardImg(card.img, card.card_name)}
                alt={card.card_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                    e.target.src = "/images/card_not_found.png";
                }}
            />
        </div>
    );
}