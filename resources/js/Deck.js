import mysql from "mysql";

//================================================
// DATABASE
//================================================

let con = mysql.createConnection({
    host: "local",
    user: "root",
    password: "password",
    database: "name_database",
});
con.connect((err) => {
    if (err) throw err;
    console.log("Database connected.");
});

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
// DATABASE QUERIES
//================================================

async function CreateCard(ID) {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM cards WHERE id = ?", [ID], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            if (results.length > 0) {
                const {
                    points,
                    text,
                    card_name,
                    color,
                    img,
                    dominate,
                    action,
                } = results[0];
                resolve(
                    new Card(
                        ID,
                        points,
                        text,
                        card_name,
                        color,
                        img,
                        dominate,
                        action,
                    ),
                );
            } else {
                resolve(null);
            }
        });
    });
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

async function draw(playerhand) {
    if (playerhand.cards.length < playerhand.size && deck.length > 0) {
        let cardid = deck.pop();
        let newcard = await CreateCard(cardid);
        if (newcard) playerhand.cards.push(newcard);
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
};
