export default function Board({ gameState }) {
    return (
        <div className="board">
            <h2>{gameState.age}</h2>
            <div className="traits">
                {gameState.currentPlayer.traits.map((trait) => (
                    <div key={trait.id}>{trait.name}</div>
                ))}
            </div>
        </div>
    );
}
