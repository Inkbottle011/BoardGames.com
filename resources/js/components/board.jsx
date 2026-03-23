export default function Board({ gameState }) {
<<<<<<< HEAD
    if (!gameState) {
        return <div>Loading...</div>;
    }
    return (
        <div className="board">
            <h4>Game Board </h4>
            <h2>{gameState.age}</h2>
            <div className="traits">
                {gameState.currentPlayer?.traits.map((trait) => (
=======
    return (
        <div className="board">
            <h2>{gameState.age}</h2>
            <div className="traits">
                {gameState.currentPlayer.traits.map((trait) => (
>>>>>>> 52b1dc2 (rebase)
                    <div key={trait.id}>{trait.name}</div>
                ))}
            </div>
        </div>
    );
}
