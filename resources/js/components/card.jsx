export default function Card({ card, onPlay }) {
    return (
        <div className="card" onClick={() => onPlay(card)}>
            <h3>{card.name}</h3>
<<<<<<< HEAD
            <p>{card.points}</p>
            <p>{card.text}</p>

            <img src={card.image_url} alt={card.name} />
=======
            <p>{card.description}</p>
>>>>>>> 52b1dc2 (rebase)
        </div>
    );
}
