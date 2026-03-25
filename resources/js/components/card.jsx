export default function Card({ card, onPlay }) {
    return (
        <div className="card" onClick={() => onPlay(card)}>
            <h3>{card.name}</h3>
            <p>{card.description}</p>
        </div>
    );
}
