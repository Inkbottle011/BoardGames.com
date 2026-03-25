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
        this.points = 0;
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
    discardCardMultiple(GameState.currentPlayer, GameState.currentPlayer.cards.length - GameState.currentPlayer.size);
    if (cardSearch(Late, GameState.currentPlayer)) {

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

export function play(index) {
    let currentPlayer = GameState.currentPlayer;
    let players = GameState.players;
    if (cardSearch("Echolocation_Effect", currentPlayer) != -1) {
        Deck.draw(currentPlayer);
    }
    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    onCardPlayed(card, currentPlayer, players);
    resolveCard(card, currentPlayer, players);
    endTurn();
}

function cardSearch(card_name, currentPlayer) {
    for (i < 0; i < currentPlayer.traitpool.length; i++) {
        if (currentPlayer.traitpool[i].card_name === card_name) {
            return i;
        }
    }
    return -1;
}

function runAgeEffect(currentPlayer, players) {
    let functionName =
        Ages[0].replace(/\s+/g, "").replace(/-/g, "") + "_effect";
    if (AgesEffects[functionName]) {
        AgesEffects[functionName](currentPlayer, players);
    } else {
        console.warn(`No function found for card: ${Ages[0].age_name}`);
    }
}

function takeback(currentplayer, players) {
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
        CardEffects[functionName](currentPlayer, players);
    } else {
        console.warn(`No function found for card: ${card.card_name}`);
    }
}

export function discardCard(playerhand) {
    if (index < 0 || index >= playerhand.cards.length) return;
    let card = playerhand.cards[index];
    playerhand.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch(RegenerativeTissue, playerhand) != -1) {
            Deck.draw(playerhand);
            let card = playerhand.cards.pop();
            playerhand.traitpool.push(card);
            onCardPlayed(card, playerhand, GameState.players);
            resolveCard(card, playerhand, GameState.players);
        }
    }

}

export function discardCardMultiple(playerhand, num) {
    for (i = 0; i < num; i++) {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        let card = playerhand.cards[index];
        playerhand.cards.splice(index, 1);
        if (card.card_name != "Endurance") {
            discardPile.push(card);
            if (cardSearch(RegenerativeTissue, playerhand) != -1) {
                Deck.draw(playerhand);
                let card = playerhand.cards.pop();
                playerhand.traitpool.push(card);
                onCardPlayed(card, playerhand, GameState.players);
                resolveCard(card, playerhand, GameState.players);
            }
        }
    }
}


export function discardColor(playerhand, color) {

    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = playerhand.cards[index];
    while (card.color != color) {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = playerhand.cards[index];
    }
    playerhand.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch(RegenerativeTissue, playerhand) != -1) {
            Deck.draw(playerhand);
            let card = playerhand.cards.pop();
            playerhand.traitpool.push(card);
            onCardPlayed(card, playerhand, GameState.players);
            resolveCard(card, playerhand, GameState.players);
        }
    }
}

export function discardTrait(playerhand) {
    if (index < 0 || index >= playerhand.traitpool.length) return;
    let card = playerhand.traitpool[index];
    playerhand.traitpool.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch(RegenerativeTissue, playerhand) != -1) {
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
            if (reactiveTraits.includes(trait.card_name) && card.action == true) {
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