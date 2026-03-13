import * as CardEffects from "./CardEffects.js";
import * as Deck from "./Deck.js";

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
let discardPile = [];

class PlayerHand extends Deck.PlayerHand {
    constructor(id) {
        super(id);
        this.traitpool = [];
        this.worldsEndEffects = [];
        this.genepool = 0;
    }
}

let GameState = {
    players: [],
    currentPlayer: null,
    currentAge: null,
    catastropheCount: 0,
};

//================================================
// GAME SETUP
//================================================

async function gamestart(numPlayers) {
    Deck.buildDeck();
    for (let i = 0; i < numPlayers; i++) {
        GameState.players.push(new PlayerHand(i));
    }
    let startIndex = Math.floor(Math.random() * numPlayers);
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
}

//================================================
// TURN MANAGEMENT
//================================================

async function endTurn() {
    let currentIndex = GameState.players.indexOf(GameState.currentPlayer);
    let nextIndex = (currentIndex + 1) % GameState.players.length;
    GameState.currentPlayer = GameState.players[nextIndex];
    Deck.drawMultiple(
        GameState.currentPlayer,
        GameState.currentPlayer.size - GameState.currentPlayer.cards.length,
    );
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

function play(index) {
    let currentPlayer = GameState.currentPlayer;
    let players = GameState.players;
    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    onCardPlayed(card, currentPlayer, players);
    resolveCard(card, currentPlayer, players);
    endTurn();
}

function resolveCard(card, currentPlayer, players) {
    currentPlayer.traitpool.push(card);
    runCardEffect(card, currentPlayer, players);
}

function runCardEffect(card, currentPlayer, players) {
    let functionName =
        card.card_name.replace(/\s+/g, "").replace(/-/g, "") + "_Effect";
    if (CardEffects[functionName]) {
        CardEffects[functionName](currentPlayer, players);
    } else {
        console.warn(`No function found for card: ${card.card_name}`);
    }
}

function discardCard(playerhand) {
    if (playerhand.cards.length > 0) {
        let randomIndex = Math.floor(Math.random() * playerhand.cards.length);
        discardPile.push(playerhand.cards[randomIndex]);
        playerhand.cards.splice(randomIndex, 1);
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
            if (reactiveTraits.includes(trait.card_name)) {
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

function StealHandCard(fromHand, toHand) {
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

function chooseOpponent(currentPlayer, players) {
    let opponents = Deck.getOpponents(currentPlayer, players);
    return opponents[0]; // replace with UI input later
}

function chooseCard(cards) {
    return cards[0]; // replace with UI input later
}

//================================================
// WORLDS END
//================================================

function triggerWorldsEnd() {
    for (let player of GameState.players) {
        for (let effect of player.worldsEndEffects) {
            effect();
        }
    }
}

//================================================
// EXPORTS
//================================================

export {
    resolveCard,
    GameState,
    chooseOpponent,
    chooseCard,
    StealHandCard,
    StealTraitCard,
};
