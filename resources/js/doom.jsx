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
        players: [
            { traits: [{ id: 1, name: "Spiky" }] },
            { traits: [{ id: 2, name: "Swift" }] },
            { traits: [{ id: 3, name: "Heavy" }] },
            {
                traits: [{ id: 4, name: "Smart" }],
                hand: [
                    { id: 1, card_name: "Claw", points: 2, img: "/img1.png" },
                    { id: 2, card_name: "Wings", points: 3, img: "/img2.png" },
                ],
            },
        ],
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
}
