export default function Board({ gameState }) {
    if (!gameState) {
        return <div>Loading...</div>;
    }
    return (
        <div className="h-screen bg-gradient-to-br from-green-200 to-green-400 p-4 flex flex-col justify-between">
            {/* Top Player */}
            <div className="flex justify-center">
                <PlayerArea player={gameState.players[1]} label="Player 2" />
            </div>

            {/* Middle Row */}
            <div className="flex justify-between items-center">
                {/* Left Player */}
                <PlayerArea player={gameState.players[0]} label="Player 1" />

                {/* Center Age */}
                <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center border">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Age {gameState.age}
                    </h2>
                    <p className="text-sm text-gray-500">Event Phase</p>
                </div>

                {/* Right Player */}
                <PlayerArea player={gameState.players[2]} label="Player 3" />
            </div>

            {/* Bottom Player (YOU) */}
            <div className="flex flex-col items-center gap-2">
                <PlayerArea player={gameState.players[3]} label="You" isYou />

                {/* Player Hand */}
                <div className="flex gap-3 mt-2 overflow-x-auto p-2">
                    {gameState.players[3].hand?.map((card) => (
                        <Card key={card.id} card={card} />
                    ))}
                </div>
            </div>
        </div>
    );
}
//  <div className="h-screen bg-green-200 flex fle-col justify-between">
//             <h4>Game Board </h4>
//             <h2>{gameState.age}</h2>
//             <div className="traits">
//                 {gameState.currentPlayer?.traits.map((trait) => (
//                     <div key={trait.id}>{trait.name}</div>
//                 ))}
//             </div>
//         </div>
