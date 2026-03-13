let mysql = require('mysql')

let con = mysql.createConnection({
    host: "local"
    , user: "root"
    , password: "password"
    , database: "name_database"
})

async function CreateCard(ID) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [ID]);
    if (result.rows.length > 0) {
        const { points, text, card_name, color, img, dominate, action } = result.rows[0]; // Extracting values individually
        let newcard = new card(ID, points, text, card_name, color, img, dominate, action);
        return newcard;
    }
    return null; // ID not found
}


let card = {
    Id: 0
    , value: 0
    , text: ""
    , card_name: ""
    , color: ""
    , img: null
    , dominate: false
    , action: false

}

let playerhand = {
    size: 0
    , cards: []
    , traitpool: []
}



function draw() {
    if (playerhand.cards.length < size) {
        cardid = Math.round(Math.random() * 118 + 1)
        let newcard = CreateCard(cardid)
        playerhand.cards.push(newcard)
        //Take from Database random id --> create new card object --> add to playerhand.cards
    }
}


function increaseSize() {
    playerhand.size++
}


