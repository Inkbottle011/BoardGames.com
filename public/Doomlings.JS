let Age = []

let catastraphy = []


let discard = []

function gamestart() {
    //Set amount of players
    // Server needs to be set up and created. 
    //Random select starting player

    //Start New Age 

    //Player turn --> run Play function --> End turn 

    //Run till 3 Catastraphy Ages are Played turns are complete
}

function discard() {
    if (playerhand.cards.length > 0) {
        discardrandom = Math.round(Math.random() * playerhand.cards.length + 1)
        discard.push(playerhand.cards[discardrandom])
        playerhand.cards.splint(discardrandom, 1)
        //Take card from playerhand.cards randomly --> add to discard array--> rm card from hand array
    }
}



function play() {
    //Player Chooses card from hand 
    let index = 0
    //take playerhand.cards take card choosen --> place in playerhand.traitpool 
    playerhand.traitpool.push(playerhand.cards[index])
    playerhand.cards.splint(index, 1)
    //run card effect from database(?) 

    //Run Card text? IDK how played cards will run maybe using the text from the card? 

    //End player turn 

}

function StealHandCard() {

    //Take choose playerhand that need to be taken (either randomly or by player choice) 
    //Choose randomly card to be moved from playerhand.cards --> other playerhand.cards
}

function StealTraitCard() {
    //Take choose playerhand that need to be taken (either randomly or by player choice)
    //Choose randomly card to be moved from playerhand.traitpool --> other playerhand.traitpool

}




