import Hand from "./hand";
import Deck from "./deck";
import Scoreboard from "./scoreboard";

export default function Board({ gameState, gameId, playerId, onPlay }) {
    if (!gameState || !gameState.players) {
        return <div>Loading...</div>;
    }

    const opponents = gameState.players.filter((_, i) => i !== playerId);

    const getOpponentPosition = (index, total) => {
        if (total === 1) return "col-start-2 row-start-1";
        if (total === 2) return index === 0 ? "col-start-1 row-start-2" : "col-start-3 row-start-2";
        if (total === 3) {
            if (index === 0) return "col-start-1 row-start-2";
            if (index === 1) return "col-start-2 row-start-1";
            if (index === 2) return "col-start-3 row-start-2";
        }
        return "col-start-2 row-start-1";
    };

    return (
        <div className="h-screen w-screen p-4 grid grid-cols-3 grid-rows-3 gap-4">

            {/* Opponents */}
            {opponents.map((player, i) => (
                <div
                    key={player.id}
                    className={`${getOpponentPosition(i, opponents.length)} flex justify-center items-center`}
                >
                    <div className="player-panel text-center min-w-24">
                        <p className="player-name">Player {i + 1}</p>
                        <span className="card-count-badge">{player.hand?.length ?? 0} cards</span>
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                            {player.traitpool?.map((trait, j) => (
                                <span key={j} className="trait-chip">{trait.card_name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Center */}
            <div className="col-start-2 row-start-2 flex flex-col justify-center items-center gap-2">
                <div className="center-panel">
                    <h2 className="age-title">Age {gameState.age ?? '—'}</h2>
                    {gameState.catastrophe && (
                        <p className="catastrophe-warning">⚠ Catastrophe!</p>
                    )}
                    <p className="text-sm opacity-60">Event Phase</p>
                </div>

                <Deck
                    deckSize={gameState.deckSize}
                    discardPile={gameState.discardPile}
                />

                <Scoreboard
                    players={gameState.players}
                    currentTurn={gameState.current_turn}
                />
            </div>

            {/* Bottom — current player */}
            <div className="col-start-2 row-start-3 flex flex-col items-center gap-2">
                <p className="player-name">You</p>

                <div className="flex gap-2 flex-wrap justify-center">
                    {gameState.players[playerId]?.traitpool?.map((trait, i) => (
                        <span key={i} className="trait-chip">{trait.card_name}</span>
                    ))}
                </div>

                <Hand
                    cards={gameState.players[playerId]?.hand}
                    gameId={gameId}
                    playerId={playerId}
                    onPlay={onPlay}
                />
            </div>

        </div>
    );
}