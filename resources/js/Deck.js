//================================================
// DATA STRUCTURES
//================================================

class PlayerHand {
    constructor(id) {
        this.id = id;
        this.size = 5;
        this.cards = [];
    }
}

class Card {
    constructor(id, value, text, card_name, color, img, dominate, action) {
        this.id = id;
        this.value = value;
        this.text = text;
        this.card_name = card_name;
        this.color = color;
        this.img = img;
        this.dominate = dominate;
        this.action = action;
    }
}

//================================================
// DECK MANAGEMENT
//================================================

let deck = [];

function buildDeck() {
    for (let i = 1; i <= 118; i++) {
        deck.push(i);
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

//================================================
// DRAWING
//================================================

// Cache all cards fetched at game start
let cardCache = {};

// Fetch all cards once at game start
export async function loadAllCards() {
    const res = await fetch('/cards');
    const cards = await res.json();
    cards.forEach(card => {
        cardCache[card.id] = card;
    });
}

// Draw uses cache instead of fetching each time
async function draw(playerhand) {
    if (deck.length > 0) {
        let cardid = deck.pop();
        let card = cardCache[cardid];
        if (card) playerhand.cards.push(card);
    }
}

async function drawMultiple(playerhand, amount) {
    for (let i = 0; i < amount; i++) {
        await draw(playerhand);
    }
}

//================================================
// PLAYER UTILITIES
//================================================

function increaseSize(playerhand) {
    playerhand.size++;
}

function getOpponents(currentPlayer, players) {
    return players.filter((p) => p !== currentPlayer);
}

//================================================
// EXPORTS
//================================================

export {
    PlayerHand,
    Card,
    draw,
    drawMultiple,
    increaseSize,
    getOpponents,
    buildDeck,
    deck,
};