export default function Board({ gameState }) {
<<<<<<< HEAD
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
=======
    if (!gameState) {
        return <div>Loading...</div>;
    }
>>>>>>> df8ac1f (test)
    return (
        <div className="board">
            <h4>Game Board </h4>
            <h2>{gameState.age}</h2>
            <div className="traits">
<<<<<<< HEAD
                {gameState.currentPlayer.traits.map((trait) => (
>>>>>>> 52b1dc2 (rebase)
=======
                {gameState.currentPlayer?.traits.map((trait) => (
>>>>>>> df8ac1f (test)
                    <div key={trait.id}>{trait.name}</div>
                ))}
            </div>
        </div>
    );
}
