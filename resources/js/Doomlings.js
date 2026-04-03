import * as CardEffects from "./CardEffects.js";
import * as Deck from "./Deck.js";
import * as AgeEffects from "./AgeEffects.js";
import axios from "axios";

//================================================
// DATA STRUCTURES
//================================================

let Age = {
    age_name: "",
    img: "",
    text: "",
    catastrophe: false,
};

let Ages = [];
export let discardPile = [];

class PlayerHand extends Deck.PlayerHand {
    constructor(id) {
        super(id);
        this.traitpool = [];
        this.worldsEndEffects = [];
        this.genepool = 0;
        this.points = 0;
    }
}

let GameState = {
    startindex: null,
    players: [],
    currentPlayer: null,
    currentAge: null,
    catastropheCount: 0,
    status: 'active',
    agePile1: [],
    agePile2: [],
    agePile3: [],
    deckSize: 0,
    discardPile: [],
};

//================================================
// GAME SETUP
//================================================
// async function gameloop(numplayers) {
//     gamestart(numplayers);
//     while (!checkGameOver) {
//         for (i = 0; i < numplayers; i++) {
//             play(index);
//         }
//         startNewAge();
//     }
// }

async function gamestart(numPlayers) {
    await Deck.loadAllCards();
    Deck.buildDeck();
    AgesDeck();
    GameState.currentAge = Ages[0];
    for (let i = 0; i < numPlayers; i++) {
        GameState.players.push(new PlayerHand(i));
    }
    let startIndex = Math.floor(Math.random() * numPlayers);
    GameState.startindex = startIndex;
    GameState.currentPlayer = GameState.players[startIndex];
    for (let player of GameState.players) {
        await Deck.drawMultiple(player, player.size);
    }
}

function startNewAge() {
    if (Ages.length === 0) return;
    GameState.currentAge = Ages.shift();
    if (GameState.currentAge.catastrophe) {
        GameState.catastropheCount++;
    }
    checkGameOver();
    if (GameState.currentAge.catastrophe || GameState.currentAge.age_name === "Birth of a Hero" || GameState.currentAge.age_name === "Northern Winds" || GameState.currentAge.age_name === "Awakening" || GameState.currentAge.age_name === "Flourish" || GameState.currentAge.age_name === "Age of Dracula" || GameState.currentAge.age_name === "Comet Showers" || GameState.currentAge.age_name === "The Messiah" || GameState.currentAge.age_name === "Age of Reason") {
        runAgeEffect(null, GameState.currentPlayer, GameState.players);
    }
}

// function AgesDeck() {
//     Ages.push(CreateAges(41));
//     for (i = 0; i < 3; i++) {
//         let randomIndex = 0;
//         for (k = 0; k < 3; k++) {
//             randomIndex = Math.round(Math.random() * 25 + 1);
//             Ages.push(CreateAges(randomIndex));
//         }
//         randomIndex = Math.round(Math.random() * 40 + 26);
//     }
// }

// async function CreateAges(ID) {
//     return new Promise((resolve, reject) => {
    //         con.query("SELECT * FROM doomlings_ages WHERE id = ?", [ID], (err, results) => {
        //             if (err) {
//                 reject(err);
//                 return;
//             }
//             if (results.length > 0) {
//                 const {
//                     age_name,
//                     text,
//                     card_name,
//                     img,
//                     catastrophe
//                 } = results[0];
//                 resolve(
//                     new Age(
//                         ID,
//                         age_name,
//                         text,
//                         card_name,
//                         img,
//                         catastrophe
//                     ),
//                 );
//             } else {
    //                 resolve(null);
//             }
//         });
//     });
// }

//================================================
// TURN MANAGEMENT
//================================================

async function endTurn() {
    let currentIndex = GameState.players.indexOf(GameState.currentPlayer);
    let nextIndex = (currentIndex + 1) % GameState.players.length;
    GameState.currentPlayer = GameState.players[nextIndex];
    if (GameState.currentAge && (
        GameState.currentAge.age_name === "Prosperity" ||
        GameState.currentAge.age_name === "Age of Nietzsche" ||
        GameState.currentAge.age_name === "Enlightenment" ||
        GameState.currentAge.age_name === "Coastal Formations" ||
        GameState.currentAge.age_name === "Age of Wonder"
    )) {
        runAgeEffect(null, GameState.currentPlayer, GameState.players);
    }
    stabilize();
}
export function stabilize() {
    Deck.drawMultiple(
        GameState.currentPlayer,
        GameState.currentPlayer.size - GameState.currentPlayer.cards.length,
    );
    discardCardMultiple(GameState.currentPlayer, GameState.currentPlayer.cards.length - GameState.currentPlayer.size);
    let lateIndex = handSearch("Late", GameState.currentPlayer)
    if (lateIndex != -1) {
        let card = GameState.currentPlayer.cards[lateIndex];
        GameState.currentPlayer.cards.splice(lateIndex, 1)
        GameState.currentPlayer.traitpool.push(card);
    }
}

function checkGameOver() {
    if (GameState.catastropheCount >= 3) {
        triggerWorldsEnd();
        return true;
    }
    return false;
}

//================================================
// CARD PLAYING
//================================================

export function play(index, player = null) {
    let currentPlayer = player ?? GameState.currentPlayer;
    let players = GameState.players;
    
    if (cardSearch("Echolocation_Effect", currentPlayer) != -1) {
        Deck.draw(currentPlayer);
    }
    
    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    
    // Run age effect if age exists and it's a per-card age
    if (GameState.currentAge) {
        const perCardAges = [
            "Age of Peace", "Glacial Drift", "Lunar Retreat", "High Tides",
            "Age of Wonder", "Galactic Drift", "Tectonic Shifts", "Tropical Lands",
            "Eclipse", "Arid Lands", "Age of Reason"
        ];
        if (perCardAges.includes(GameState.currentAge.age_name)) {
            runAgeEffect(card, currentPlayer, players);
        }
    }
    
    // Heroic requires 3+ green traits to play
    if (card.card_name === "Heroic") {
        let green = currentPlayer.traitpool.filter(c => c.color === "Green").length;
        if (green >= 3) {
            currentPlayer.cards.splice(index, 1);
            onCardPlayed(card, currentPlayer, players);
            resolveCard(card, currentPlayer, players);
            endTurn();
        } else {
            console.warn("Cannot play Heroic — need 3+ green traits");
        }
        return;
    }
    
    currentPlayer.cards.splice(index, 1);
    onCardPlayed(card, currentPlayer, players);
    resolveCard(card, currentPlayer, players);
    endTurn();
}
function cardSearch(card_name, currentPlayer) {
    for (let i = 0; i < currentPlayer.traitpool.length; i++) {
        if (currentPlayer.traitpool[i] && currentPlayer.traitpool[i].card_name === card_name) {
            return i;
        }
    }
    return -1;
}

function handSearch(card_name, currentPlayer) {
    for (let i = 0; i < currentPlayer.cards.length; i++) {
        if (currentPlayer.cards[i] && currentPlayer.cards[i].card_name === card_name) {
            return i;
        }
    }
    return -1;
}

function runAgeEffect(card, currentPlayer, players) {
    if (!GameState.currentAge) return;
    
    let functionName = GameState.currentAge.age_name.replace(/\s+/g, "").replace(/-/g, "") + "_effect";
    if (AgeEffects[functionName]) {
        AgeEffects[functionName](card, currentPlayer, players);
    } else {
        console.warn(`No function found for age: ${GameState.currentAge.age_name}`);
    }
}

function takeback(currentplayer, players, index) {
    let player = players[chooseOpponent(currentPlayer, players)]
    if (index < 0 || index >= player.traitpool.length) return;
    let card = player.traitpool[index];
    player.traitpool.splice(index, 1);
    player.cards.push(card);
}

function resolveCard(card, currentPlayer, players) {
    currentPlayer.traitpool.push(card);
    currentPlayer.points += card.points;
    runCardEffect(card, currentPlayer, players);
}

function runCardEffect(card, currentPlayer, players) {
    let functionName =
    card.card_name.replace(/\s+/g, "").replace(/-/g, "") + "_Effect";
    if (CardEffects[functionName]) {
        try {
            CardEffects[functionName](currentPlayer, players);
        } catch (e) {
            console.warn(`Effect failed for card: ${card.card_name} — ${e.message}`);
        }
    } else {
        console.warn(`No function found for card: ${card.card_name}`);
    }
}

export function discardCard(playerhand, index) {
    if (index < 0 || index >= playerhand.cards.length) return;
    let card = playerhand.cards[index];
    playerhand.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) != -1) {
            Deck.draw(playerhand);
            let card = playerhand.cards.pop();
            playerhand.traitpool.push(card);
            onCardPlayed(card, playerhand, GameState.players);
            resolveCard(card, playerhand, GameState.players);
        }
    }
    
}

export function discardRandomCard(playerhand) {
    let index = Math.floor(Math.random() * playerhand.cards.length);
    let card = playerhand.cards[index];
    playerhand.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) != -1) {
            Deck.draw(playerhand);
            let card = playerhand.cards.pop();
            playerhand.traitpool.push(card);
            onCardPlayed(card, playerhand, GameState.players);
            resolveCard(card, playerhand, GameState.players);
        }
    }
}

export function discardCardMultiple(playerhand, num, index) {
    for (let i = 0; i < num; i++) {
        if (index < 0 || index >= playerhand.cards.length) return;
        let card = playerhand.cards[index];
        playerhand.cards.splice(index, 1);
        if (card.card_name != "Endurance") {
            discardPile.push(card);
            if (cardSearch("Regenerative Tissue", playerhand) != -1) {
                Deck.draw(playerhand);
                let card = playerhand.cards.pop();
                playerhand.traitpool.push(card);
                onCardPlayed(card, playerhand, GameState.players);
                resolveCard(card, playerhand, GameState.players);
            }
        }
    }
}


export function discardColor(playerhand, color,index) {
    
    if (index < 0 || index >= playerhand.cards.length) return;
    let card = playerhand.cards[index];
    while (card.color != color) {
        if (index < 0 || index >= playerhand.cards.length) return;
        card = playerhand.cards[index];
    }
    playerhand.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) != -1) {
            Deck.draw(playerhand);
            let card = playerhand.cards.pop();
            playerhand.traitpool.push(card);
            onCardPlayed(card, playerhand, GameState.players);
            resolveCard(card, playerhand, GameState.players);
        }
    }
}

export function discardTrait(playerhand, index) {
    if (index < 0 || index >= playerhand.traitpool.length) return;
    let card = playerhand.traitpool[index];
    playerhand.traitpool.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) != -1) {
            Deck.draw(playerhand);
            let card = playerhand.cards.pop();
            playerhand.traitpool.push(card);
            onCardPlayed(card, playerhand, GameState.players);
            resolveCard(card, playerhand, GameState.players);
        }
    }
}

//================================================
// REACTIVE TRAITS
//================================================

const reactiveTraits = ["Automimicry", "Chromatophores", "Parasitic"];

function onCardPlayed(playedCard, playingPlayer, allPlayers) {
    for (let player of allPlayers) {
        if (player === playingPlayer) continue;
        for (let trait of player.cards) {
            if (reactiveTraits.includes(trait.card_name) && playedCard.action == true) {
                let functionName =
                trait.card_name.replace(/\s+/g, "") + "_Effect";
                if (CardEffects[functionName]) {
                    CardEffects[functionName](player, allPlayers, playedCard);
                }
            }
        }
    }
}

//================================================
// CARD ACTIONS (used by CardEffects.js)
//================================================

export function StealHandCard(fromHand, toHand) {
    if (fromHand.cards.length === 0) return;
    let randomIndex = Math.floor(Math.random() * fromHand.cards.length);
    toHand.cards.push(fromHand.cards[randomIndex]);
    fromHand.cards.splice(randomIndex, 1);
}


function StealTraitCard(fromHand, toHand) {
    if (fromHand.traitpool.length === 0) return;
    let randomIndex = Math.floor(Math.random() * fromHand.traitpool.length);
    toHand.traitpool.push(fromHand.traitpool[randomIndex]);
    fromHand.traitpool.splice(randomIndex, 1);
}

export function chooseOpponent(currentPlayer, players) {
    let opponents = Deck.getOpponents(currentPlayer, players);
    return opponents[0]; // replace with UI input later
}

function chooseCard(cards) {
    return cards[0]; // replace with UI input later
}

//================================================
// WORLDS END
//================================================
let isWorldsEnd = false;

export function triggerWorldsEnd() {
    isWorldsEnd = true;
    for (let player of GameState.players) {
        for (let effect of player.worldsEndEffects) {
            effect();
        }
    }
}

// Export the flag
export { isWorldsEnd };

//================================================
// larvel reading
//================================================

// Load game state from Laravel into doomlings.js
export function loadFromServer(serverState) {
    GameState.status = serverState.status ?? 'active';
    GameState.players = serverState.players.map(p => {
        let hand = new PlayerHand(p.id);
        hand.cards = p.hand ?? [];
        hand.traitpool = p.traitpool ?? [];
        hand.genepool = p.genepool ?? 0;
        hand.points = p.points ?? 0;
        hand.name = p.name ?? `Player ${p.id}`;
        return hand;
    });
    GameState.currentPlayer = GameState.players.find(
        p => p.id === serverState.current_turn
    ) ?? GameState.players[0];
    GameState.currentAge = serverState.age ?? null;
    GameState.catastropheCount = serverState.catastrophe_count ?? 0;
    GameState.agePile1 = serverState.agePile1 ?? [];
    GameState.agePile2 = serverState.agePile2 ?? [];
    GameState.agePile3 = serverState.agePile3 ?? [];
    GameState.deckSize = serverState.deckSize ?? 0;
    GameState.discardPile = serverState.discardPile ?? [];
    
    if (serverState.discardPile) {
        discardPile.length = 0;
        serverState.discardPile.forEach(c => discardPile.push(c));
    }
    
    if (serverState.status === 'worlds_end') {
        GameState.catastropheCount = 3;
    }
}

// Serialize doomlings.js GameState back to Laravel format
export function serializeForServer() {
    return {
        current_turn: GameState.currentPlayer?.id,
        catastrophe_count: GameState.catastropheCount,
        current_age: GameState.currentAge,
        game_state: {
            deckSize: Deck.deck?.length ?? 0,
            discardPile: discardPile,
        },
        players: GameState.players.map(p => ({
            id: p.id,
            cards: p.cards,
            traitpool: p.traitpool,
            genepool: p.genepool,
            points: p.points,
        })),
    };
}


//================================================
// EXPORTS
//================================================

export {
    resolveCard,
    GameState,
    chooseCard,
    gamestart,
    endTurn,
};