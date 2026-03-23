import React, { useState } from "react";
<<<<<<< HEAD
<<<<<<< HEAD
//import Hand from "./Hand";
import Board from "./components/board";
import { useEffect } from "react";

export default function Doom() {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        fetch("/cards")
            .then((response) => response.json())
            .then((data) => setCards(data));
    }, []);
    const testState = {
        age: 1,
        currentPlayer: {
            traits: [
                { id: 1, name: "Spiky" },
                { id: 2, name: "Swift" },
            ],
        },
    };

    return (
        <div>
            <h1>Doom Mfkr</h1>
            <Board gameState={testState} />

            <h2>Cards</h2>
            {cards.map((card) => (
                <div key={card.id} card={card} />
            ))}
        </div>
    );
=======
import Hand from "./Hand";
import Board from "./Board";

export default function Doom() {
    // const [hand, setHand] = useState([
    // ]);
>>>>>>> 52b1dc2 (rebase)
=======
//import Hand from "./Hand";
import Board from "./components/board";
import { useEffect } from "react";

export default function Doom() {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        fetch("/cards")
            .then((response) => response.json())
            .then((data) => setCards(data));
    }, []);
    const testState = {
        age: 1,
        currentPlayer: {
            traits: [
                { id: 1, name: "Spiky" },
                { id: 2, name: "Swift" },
            ],
        },
    };

    return (
        <div>
            <h1>Doom Mfkr</h1>
            <Board gameState={testState} />

            <h2>Cards</h2>
            {cards.map((card) => (
                <div key={card.id} card={card} />
            ))}
        </div>
    );
>>>>>>> df8ac1f (test)
}
