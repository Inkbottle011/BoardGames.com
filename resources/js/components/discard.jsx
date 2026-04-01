import { Card } from "../Deck";
import { discardCard, discardCardMultiple, GameState } from "../Doomlings";
import { discardPile } from "../Doomlings";
import { GameState } from "../Doomlings";
function discard({ cards }) {
    return (
        <div className="deck">
            {/* <h2>Deck</h2>
            <p>{cards.length} cards remaining</p> */}
        </div>
    );
}

function cards() {
    return (
        <div>
            {cards.map((card) => (
                <button key={cards.id} onClick={() => handleClick(cards.id)}>
                    {cards.name}
                    {cards.value}
                </button>
            ))}
        </div>
    );
}