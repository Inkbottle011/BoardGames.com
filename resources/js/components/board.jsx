import Hand from "./hand";
import Deck from "./deck";
import PlayerArea from "./playerArea";
import Scoreboard from "./scoreboard";
import Card from "./card";

export default function Board({ gameState, gameId, playerId, onPlay }) {
    if (!gameState || !gameState.players) {
        return <div>Loading...</div>;
    }

    // Find current player by user ID not array index
    const currentPlayer = gameState.players.find((p) => p.id === playerId);

    // Filter out current player from opponents
    const opponents = gameState.players.filter((p) => p.id !== playerId);

    const topPlayer = opponents[0];
    const leftPlayer = opponents[1];
    const rightPlayer = opponents[2];

    return (
        <div className="h-screen w-screen p-6 grid grid-cols-3 grid-rows-3 gap-16 bg-gradient-to-br from-green-900 to-green-700 text-white relative">
            {/* Opponents */}
            {/* TOP PLAYER */}
            <div className="col-start-2 row-start-1 flex justify-center">
                {topPlayer && <PlayerArea player={topPlayer} />}
            </div>

            {/* TOP-RIGHT CORNER - Scoreboard */}
            <div className="absolute top-6 right-6">
                <Scoreboard
                    players={gameState.players}
                    currentTurn={gameState.current_turn}
                />
            </div>

            {/* LEFT PLAYER */}
            <div className="col-start-1 row-start-1 flex justify-center">
                {leftPlayer && <PlayerArea player={leftPlayer} />}
            </div>

            {/* CENTER GAME AREA */}
            <div className="col-start-1 col-end-4 row-start-2 center-piles">
                <Deck
                    deckSize={gameState.deckSize}
                    discardPile={gameState.discardPile}
                    showDiscard={true}
                    inline={false}
                />
                {/* Age Deck (backside) */}
                <div>
                    <div
                        className="age-deck"
                        style={{ width: "5rem", height: "7rem" }}
                    >
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            AGE
                        </div>
                    </div>
                    <p className="text-xs opacity-60">Age Deck</p>
                </div>
                {/* 3 piles for flipped age cards */}
                <div>
                    <div
                        className="age-pile"
                        style={{
                            width: "5rem",
                            height: "7rem",
                            overflow: "hidden",
                        }}
                    >
                        {gameState.agePile1 && gameState.agePile1.length > 0 ? (
                            <img
                                src={`/${gameState.agePile1[gameState.agePile1.length - 1].img}`}
                                alt={
                                    gameState.agePile1[
                                        gameState.agePile1.length - 1
                                    ].card_name
                                }
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <span className="text-xs opacity-50">Age 1</span>
                        )}
                    </div>
                    <p className="text-xs opacity-60">Age 1</p>
                </div>
                <div>
                    <div
                        className="age-pile"
                        style={{
                            width: "5rem",
                            height: "7rem",
                            overflow: "hidden",
                        }}
                    >
                        {gameState.agePile2 && gameState.agePile2.length > 0 ? (
                            <img
                                src={`/${gameState.agePile2[gameState.agePile2.length - 1].img}`}
                                alt={
                                    gameState.agePile2[
                                        gameState.agePile2.length - 1
                                    ].card_name
                                }
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <span className="text-xs opacity-50">Age 2</span>
                        )}
                    </div>
                    <p className="text-xs opacity-60">Age 2</p>
                </div>
                <div>
                    <div
                        className="age-pile"
                        style={{
                            width: "5rem",
                            height: "7rem",
                            overflow: "hidden",
                        }}
                    >
                        {gameState.agePile3 && gameState.agePile3.length > 0 ? (
                            <img
                                src={`/${gameState.agePile3[gameState.agePile3.length - 1].img}`}
                                alt={
                                    gameState.agePile3[
                                        gameState.agePile3.length - 1
                                    ].card_name
                                }
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <span className="text-xs opacity-50">Age 3</span>
                        )}
                    </div>
                    <p className="text-xs opacity-60">Age 3</p>
                </div>
            </div>

            {/* RIGHT PLAYER */}
            <div className="col-start-3 row-start-3 flex items-center justify-center">
                {rightPlayer && <PlayerArea player={rightPlayer} />}
            </div>

            {/* YOU (BOTTOM) */}
            <div className="col-start-2 row-start-3 flex flex-col items-center gap-2">
                <div className="scale-110">
                    <PlayerArea player={currentPlayer} isYou />
                </div>

                <Hand cards={currentPlayer?.hand || []} onPlay={onPlay} />
            </div>
        </div>
    );
}
