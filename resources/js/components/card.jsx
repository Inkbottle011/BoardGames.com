export default function Card({ card, onPlay }) {
    return (
        <div className="card" onClick={() => onPlay(card)}>
            <h3>{card.name}</h3>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> df8ac1f (test)
            <p>{card.points}</p>
            <p>{card.text}</p>

            <img src={card.image_url} alt={card.name} />
<<<<<<< HEAD
=======
            <p>{card.description}</p>
>>>>>>> 52b1dc2 (rebase)
=======
>>>>>>> df8ac1f (test)
        </div>
    );
}
