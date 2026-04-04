import * as CardEffects from "./CardEffects.js";
import * as Deck from "./Deck.js";
import * as AgeEffects from "./AgeEffects.js";
import { checkAgeRestriction, applyPerCardAgeEffect, shouldSkipCardEffect, getAgeHandSize } from "./AgeRules.js";

//================================================
// DATA STRUCTURES
//================================================

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
    ageDeckSize: 0,
    discardPile: [],
};

//================================================
// GAME SETUP
//================================================

async function gamestart(numPlayers) {
    await Deck.loadAllCards();
    Deck.buildDeck();
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
    if (
        GameState.currentAge.catastrophe ||
        GameState.currentAge.age_name === "Birth of a Hero" ||
        GameState.currentAge.age_name === "Northern Winds" ||
        GameState.currentAge.age_name === "Awakening" ||
        GameState.currentAge.age_name === "Flourish" ||
        GameState.currentAge.age_name === "Age of Dracula" ||
        GameState.currentAge.age_name === "Comet Showers" ||
        GameState.currentAge.age_name === "The Messiah" ||
        GameState.currentAge.age_name === "Age of Reason"
    ) {
        runAgeEffect(null, GameState.currentPlayer, GameState.players);
    }
}

//================================================
// TURN MANAGEMENT
//================================================

async function endTurn() {
    let currentIndex = GameState.players.indexOf(GameState.currentPlayer);
    let nextIndex = (currentIndex + 1) % GameState.players.length;
    GameState.currentPlayer = GameState.players[nextIndex];
    
    if (GameState.currentAge && (
        GameState.currentAge.age_name === "Prosperity" ||
        GameState.currentAge.age_name === "Enlightenment" ||
        GameState.currentAge.age_name === "Coastal Formations" ||
        GameState.currentAge.age_name === "Age of Wonder"
    )) {
        runAgeEffect(null, GameState.currentPlayer, GameState.players);
    }
    
    stabilize();
}

export function stabilize() {
    const player = GameState.currentPlayer;
    const baseSize = player.genepool ?? player.size ?? 5;
    const size = getAgeHandSize(GameState.currentAge, baseSize);
    const currentCount = player.cards.length;
    
    if (currentCount < size) {
        Deck.drawMultiple(player, size - currentCount);
    } else if (currentCount > size) {
        discardCardMultiple(player, currentCount - size, 0);
    }
    //code for late needs to be implimented
    // let lateIndex = handSearch("Late", player);
    // if (lateIndex !== -1) {
    //     let card = player.cards[lateIndex];
    //     player.cards.splice(lateIndex, 1);
    //     player.traitpool.push(card);
    // }
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

export async function play(index, player = null) {
    let currentPlayer = player ?? GameState.currentPlayer;
    let players = GameState.players;
    
    if (cardSearch("Echolocation_Effect", currentPlayer) !== -1) {
        Deck.draw(currentPlayer);
    }
    
    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    
    // Check age restrictions BEFORE playing
    const restriction = checkAgeRestriction(card, currentPlayer, players, GameState.currentAge);
    if (!restriction.allowed) {
        console.warn(restriction.reason);
        return;
    }
    
    // Heroic requires 3+ green traits
    if (card.card_name === "Heroic") {
        let green = currentPlayer.traitpool.filter(c => c.color === "Green").length;
        if (green < 3) {
            console.warn("Cannot play Heroic — need 3+ green traits");
            return;
        }
    }
    
    // Card passes all checks — play it
    currentPlayer.cards.splice(index, 1);
    await onCardPlayed(card, currentPlayer, players);
    await resolveCard(card, currentPlayer, players);
    
    // Apply any per-card age side effects
    applyPerCardAgeEffect(card, currentPlayer, players, GameState.currentAge);
    
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
    console.log(`Age effect not yet tested: ${GameState.currentAge?.age_name}`);
    // if (!GameState.currentAge) return;
    // let functionName = GameState.currentAge.age_name.replace(/\s+/g, "").replace(/-/g, "") + "_effect";
    // if (AgeEffects[functionName]) {
    //     AgeEffects[functionName](card, currentPlayer, players);
    // } else {
        //     console.warn(`No function found for age: ${GameState.currentAge.age_name}`);
    // }
}

async function resolveCard(card, currentPlayer, players) {
    currentPlayer.traitpool.push(card);
    
    // Skip card effects during Age of Peace etc
    if (!shouldSkipCardEffect(card, GameState.currentAge)) {
        await runCardEffect(card, currentPlayer, players);
    }
}

async function runCardEffect(card, currentPlayer, players) {
    console.log(`Effect not yet tested: ${card.card_name}`);
    // let functionName = card.card_name.replace(/\s+/g, "").replace(/-/g, "") + "_Effect";
    // if (CardEffects[functionName]) {
    //     try {
    //         // card passed as third arg for world's end scoring effects
    //         await CardEffects[functionName](currentPlayer, players, card);
    //     } catch (e) {
    //         console.warn(`Effect failed for card: ${card.card_name} — ${e.message}`);
    //     }
    // } else {
        //     console.warn(`No function found for card: ${card.card_name}`);
    // }
}

export function discardCard(playerhand, index) {
    if (index < 0 || index >= playerhand.cards.length) return;
    let card = playerhand.cards[index];
    playerhand.cards.splice(index, 1);
    if (card.card_name !== "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) !== -1) {
            Deck.draw(playerhand);
            let drawn = playerhand.cards.pop();
            playerhand.traitpool.push(drawn);
            onCardPlayed(drawn, playerhand, GameState.players);
            resolveCard(drawn, playerhand, GameState.players);
        }
    }
}

export function discardRandomCard(playerhand) {
    let index = Math.floor(Math.random() * playerhand.cards.length);
    let card = playerhand.cards[index];
    playerhand.cards.splice(index, 1);
    if (card.card_name !== "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) !== -1) {
            Deck.draw(playerhand);
            let drawn = playerhand.cards.pop();
            playerhand.traitpool.push(drawn);
            onCardPlayed(drawn, playerhand, GameState.players);
            resolveCard(drawn, playerhand, GameState.players);
        }
    }
}

export function discardCardMultiple(playerhand, num, index) {
    for (let i = 0; i < num; i++) {
        if (index < 0 || index >= playerhand.cards.length) return;
        let card = playerhand.cards[index];
        playerhand.cards.splice(index, 1);
        if (card.card_name !== "Endurance") {
            discardPile.push(card);
            if (cardSearch("Regenerative Tissue", playerhand) !== -1) {
                Deck.draw(playerhand);
                let drawn = playerhand.cards.pop();
                playerhand.traitpool.push(drawn);
                onCardPlayed(drawn, playerhand, GameState.players);
                resolveCard(drawn, playerhand, GameState.players);
            }
        }
    }
}

export function discardColor(playerhand, color, index) {
    // Find the first card of the given color starting from index
    while (index < playerhand.cards.length && playerhand.cards[index].color !== color) {
        index++;
    }
    if (index >= playerhand.cards.length) return;
    let card = playerhand.cards[index];
    playerhand.cards.splice(index, 1);
    if (card.card_name !== "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) !== -1) {
            Deck.draw(playerhand);
            let drawn = playerhand.cards.pop();
            playerhand.traitpool.push(drawn);
            onCardPlayed(drawn, playerhand, GameState.players);
            resolveCard(drawn, playerhand, GameState.players);
        }
    }
}

export function discardTrait(playerhand, index) {
    if (index < 0 || index >= playerhand.traitpool.length) return;
    let card = playerhand.traitpool[index];
    playerhand.traitpool.splice(index, 1);
    if (card.card_name !== "Endurance") {
        discardPile.push(card);
        if (cardSearch("Regenerative Tissue", playerhand) !== -1) {
            Deck.draw(playerhand);
            let drawn = playerhand.cards.pop();
            playerhand.traitpool.push(drawn);
            onCardPlayed(drawn, playerhand, GameState.players);
            resolveCard(drawn, playerhand, GameState.players);
        }
    }
}

//================================================
// REACTIVE TRAITS
//================================================

const reactiveTraits = ["Automimicry", "Chromatophores", "Parasitic"];

async function onCardPlayed(playedCard, playingPlayer, allPlayers) {
    for (let player of allPlayers) {
        if (player === playingPlayer) continue;
        for (let trait of player.cards) {
            if (reactiveTraits.includes(trait.card_name) && playedCard.action === true) {
                let functionName = trait.card_name.replace(/\s+/g, "") + "_Effect";
                if (CardEffects[functionName]) {
                    CardEffects[functionName](player, allPlayers, playedCard);
                }
            }
        }
    }
}

//================================================
// CARD ACTIONS
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

export async function chooseOpponent(currentPlayer, players) {
    let opponents = Deck.getOpponents(currentPlayer, players);
    if (opponents.length === 0) return null;
    if (opponents.length === 1) return opponents[0];
    
    // Use targeting system to prompt the active player
    const { requestTarget } = await import('./targeting.js');
    const chosenId = await requestTarget({
        type: 'opponent',
        prompt: 'Choose an opponent',
        options: opponents.map(o => ({ label: o.name ?? `Player ${o.id}`, value: o.id })),
    });
    return opponents.find(o => o.id === chosenId) ?? opponents[0];
}

function chooseCard(cards) {
    return cards[0];
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

export { isWorldsEnd };

//================================================
// LARAVEL SYNC
//================================================

export function loadFromServer(serverState) {
    const existingPlayers = [...GameState.players];
    GameState.status = serverState.status ?? 'active';
    GameState.players = serverState.players.map(p => {
        let hand = new PlayerHand(p.id);
        hand.cards = p.hand ?? [];
        hand.traitpool = p.traitpool ?? [];
        hand.genepool = p.genepool ?? 5;
        hand.size = p.genepool ?? 5;
        const localPlayer = existingPlayers.find(ep => ep.id === p.id);
        hand.points = (p.points !== 0) ? p.points : (localPlayer?.points ?? 0);        hand.name = p.name ?? `Player ${p.id}`;
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
    GameState.ageDeckSize = serverState.ageDeckSize ?? 0;
    GameState.discardPile = serverState.discardPile ?? [];
    
    if (serverState.discardPile) {
        discardPile.length = 0;
        serverState.discardPile.forEach(c => discardPile.push(c));
    }
    
    if (serverState.status === 'worlds_end') {
        GameState.catastropheCount = 3;
    }
}

export function serializeForServer() {
    console.log('serializing points:', JSON.stringify(GameState.players.map(p => ({ id: p.id, points: p.points, traitpool: p.traitpool.length }))));    
    return {
        current_turn: GameState.currentPlayer?.id,
        catastrophe_count: GameState.catastropheCount,
        current_age: GameState.currentAge,
        game_state: {
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