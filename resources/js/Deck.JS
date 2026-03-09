let mysql = require('mysql')

let con = mysql.createConnection({
    host: "local"
    , user: "root"
    , password: "password"
    , database: "name_database"
})

let card = {
    Id: 0
    , value: 0
    , text: ""
    , color: ""
    , img: null
}

let playerhand = {
    size: 0
    , cards: []
    , traitpool: []
}


let discard = []

function draw() {
    if (playerhand.cards.length < size) {
        //Take from Database random id --> create new card object --> add to playerhand.cards
    }
}

function discard() {
    if (playerhand.cards.length > 0) {
        //Take card from playerhand.cards randomly --> add to discard array 
    }
}

function increaseSize() {
    playerhand.size++
}


