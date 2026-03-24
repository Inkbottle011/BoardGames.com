export default function Board({ gameState }) {
    if (!gameState) {
        return <div>Loading...</div>;
    }
    return (
        <div className="board">
            <h4>Game Board </h4>
            <h2>{gameState.age}</h2>
            <div className="traits">
                {gameState.currentPlayer?.traits.map((trait) => (
                    <div key={trait.id}>{trait.name}</div>
                ))}
            </div>
        </div>
    );
}
