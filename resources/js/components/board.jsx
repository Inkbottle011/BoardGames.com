console.log("BOARD RENDERING");

import Card from "./card";
import PlayerArea from "./playerArea";

export default function Board({ gameState }) {
    if (!gameState) {
        return <div>Loading...</div>;
    }
    return (
        <div className="h-screen w-screen bg-green-300 p-4 grid grid-cols-3 grid-rows-3 gap-4">
            {/* Top Player */}
            <div className="col-start-2 row-start-1 flex justify-center items-center">
                <PlayerArea player={gameState.players[1]} label="Player 2" />
            </div>

            {/* Left Player */}
            <div className="col-start-1 row-start-2 flex justify-center items-center">
                <PlayerArea player={gameState.players[0]} label="Player 1" />
            </div>

            {/* Center */}
            <div className="col-start-2 row-start-2 flex justify-center items-center">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                    <h2 className="text-xl font-bold">Age {gameState.age}</h2>
                    <p>Event Phase</p>
                </div>
            </div>

            {/* Right Player */}
            <div className="col-start-3 row-start-2 flex justify-center items-center">
                <PlayerArea player={gameState.players[2]} label="Player 3" />
            </div>

            {/* Bottom Player */}
            <div className="col-start-2 row-start-3 flex flex-col items-center">
                <PlayerArea player={gameState.players[3]} label="You" />

                <div className="flex gap-2 mt-2">
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
