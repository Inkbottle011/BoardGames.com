import * as Doomlings from "./Doomlings.js";
import * as Deck from "./Deck.js";
import * as CardEffects from "./CardEffects.js";
//auxillary functions 

function discardHandcolor(color, players) {
    for (i = 0; i < players.length; i++) {
        let count = 0;
        for (k = 0; k < players[i].traitpool.length; k++) {
            if (players[i].traitpool[k].color === color) {
                count++;
            }
        }
        discardCardMultiple(players[i], count);
    }

}

function discardTraitcolor(color, players) {
    for (i = 0; i < players.length; i++) {
        players[i].size -= 1;
        let card = null
        while (card.color != color) {
            if (index < 0 || index >= players[i].traitpool.length) return;
            card = players[i].traitpool[index];
        }
        players[i].traitpool.splice(index, 1);
        if (card.card_name != "Endurance") {
            discardPile.push(card);
            if (cardSearch(RegenerativeTissue, players[i]) != -1) {
                Deck.draw(players[i]);
                let card = players[i].cards.pop();
                players[i].traitpool.push(card);
                onCardPlayed(card, players[i], GameState.players);
                resolveCard(card, players[i], GameState.players);
            }
        }
    }
}

function CountColor(color, players) {
    for (k = 0; k < players[i].traitpool.length; k++) {
        if (players[i].traitpool[k].color === colors[j]) {
            players[i].points -= 1;
        }
    }
}

//completed

function TheBirthofLife_effect(card, currentPlayer, players) { } // starting age does nothing
function AgeofPeace_effect(card, currentPlayer, players) {
    if (card.action) {
        card.card_name = "Leaves"
    }
}

function GlacialDrift_effect(card, currentPlayer, players) {
    while (card.value > 3) {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
}

function LunarRetreat_effect(card, currentPlayer, players) {
    while (card.color == "Purple") {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
}
function HighTides_effect(card, currentPlayer, players) {
    if (card.text == null) {
        let newcard = null;
        while (newcard.text == null) {
            if (index < 0 || index >= currentPlayer.cards.length) return;
            newcard = currentPlayer.cards[index];
        }
    }
}
function NorthernWinds_effect(card, currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        Deck.draw(players[i]);
        Doomlings.discardCard(players[i]);
    }
}


function AgeofWonder_effect(card, currentPlayer, players) {
    while (currentPlayer.cards.length > 4) {
        discardCard(currentPlayer);
    }
    while (currentPlayer.cards.length < 4) {
        Deck.draw(currentPlayer);
    }
}
function GalacticDrift_effect(card, currentPlayer, players) {
    if (card.color == "Colorless") {
        let newcard = null;
        while (card.color == "Colorless") {
            if (index < 0 || index >= currentPlayer.cards.length) return;
            newcard = currentPlayer.cards[index];
        }
    }
}


function BirthofaHero_effect(card, currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        index = cardSearch("Heroic", players[i]);
        if (index != -1) {
            let card = player.traitpool[index];
            player.cards.splice(index, 1);
            player.traitpool.push(card);
        }
    }
}

function CoastalFormations_effect(card, currentPlayer, players) {
    Deck.draw(currentPlayer);
}


function Flourish_effect(card, currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        Deck.drawMultiple(players[i], 2);
    }
}

function TectonicShifts_effect(card, currentPlayer, players) {
    while (card.color == "Green") {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
}



function TropicalLands_effect(card, currentPlayer, players) {
    while (card.color == "Colorless") {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
}

function AgeofDracula_effect(card, currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        if (Doomlings.cardSearch("Vampirism", players[i]) != -1) {
            Doomlings.StealHandCard(players[i], chooseOpponent(players[i], players));
        } else {
            discardCard(players[i]);
        }
    }
}


function Eclipse_effect(card, currentPlayer, players) {
    while (card.color == "Red") {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
}

function AridLands_effect(card, currentPlayer, players) {
    while (card.color == "Blue") {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
}
//May need to rewrite but for now should word
function AgeofReason_effect(card, currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
    if (index < currentPlayer.cards.length - 4 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch(RegenerativeTissue, currentPlayer) != -1) {
            Deck.draw(currentPlayer);
            let card = currentPlayer.cards.pop();
            currentPlayer.traitpool.push(card);
            onCardPlayed(card, currentPlayer, GameState.players);
            resolveCard(card, currentPlayer, GameState.players);
        }
    }

    if (index < currentPlayer.cards.length - 3 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    if (card.card_name != "Endurance") {
        discardPile.push(card);
        if (cardSearch(RegenerativeTissue, currentPlayer) != -1) {
            Deck.draw(currentPlayer);
            let card = currentPlayer.cards.pop();
            currentPlayer.traitpool.push(card);
            onCardPlayed(card, currentPlayer, GameState.players);
            resolveCard(card, currentPlayer, GameState.players);
        }
    }
}


function CometShowers_effect(card, currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        discardRandomCard(players[i])
    }
}
function Prosperity_effect(card, currentPlayer, players) {
    let agree = false;
    if (agree) {
        stabilize();
    }
    //prompt player if they would like to stablize if no they don't stabilize
}

function AlienTerraform_effect(card, currentPlayer, players) {
    //prompt player if they would like to discard their dominate cards from they're hand 
    let agree = false;
    if (agree) {
        for (i = 0; i < currentPlayer.cards.length; i++) {
            if (currentPlayer.cards[i].dominate) {
                let card = currentPlayer.cards[i];
                currentPlayer.cards.splice(index, 1);
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
        stabilize();
    }

    //if they do remove dominates from their hand then stabilize
}

function AgeofNietzsche_effect(card, currentPlayer, players) {
    let agree = false;
    if (agree) {
        discardCardMultiple(currentPlayer, currentPlayer.cards.length, index);
        Deck.drawMultiple(currentPlayer, 3);
    } else {
        stabilize();
    }
    //instead of stablizing discard hand and draw 3 prompt player for this
}

function Enlightenment_effect(card, currentPlayer, players) {
    let agree = false;
    if (agree) {
        let choice = 2;
        discardCardMultiple(currentPlayerm, choice, index);
    }
    stabilize();
    //prompt player to choose to discard up to 2 cards in their hand
}

function CostalFormations_effect(card, currentPlayer, players) {
    Doomlings.stabilize();
    Deck.draw(currentPlayer);
}


function NaturalHarmony_effect(card, currentPlayer, players) {
    while (card.color === players[startindex - 1].cards[cards.length - 1].color) {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        card = currentPlayer.cards[index];
    }
    //cannot play a color that the last player played  
}
//not completed


function Awakening_effect(card, currentPlayer, players) {
    let PredictionAge = Doomlings.Ages[1];
    // html show prediction age
    //show age to current player 
}



function Reforestation_effect(card, currentPlayer, players) {
    //Traits in your trait pile cannot by swaped stolen or discards IDK HOW THE FUCK THIS WILL WORK
}


//No IDEA if it works
function TheMessiah_effect(card, currentPlayer, players) {
    if (Doomlings.GameState.startindex = 0) {
        Doomlings.GameState.startindex = players.length - 1;
    } else {
        Doomlings.GameState.startindex = Doomlings.GameState.startindex - 1;
    }
}

//Catastraphies
//Completed Catastraphies

function TheBigOne_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        for (i = 0; i < players.length; i++) {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
            for (k = 0; k < players[i].traitpool.length; k++) {
                for (j = 0; j < colors.length; j++) {
                    if (players[i].traitpool[k].color === colors[j]) {
                        colors.splice(j, 1);
                    }
                }
            }
            players[i].points -= 2 * colors.length;
        }
    } else {
        currentPlayer.size -= 1;
        StealHandCard(currentPlayer, chooseOpponent(currentPlayer, players)); // Can be reworked temp solution not exactly how the card was intended to be played
    }


}
function DeusExMachina_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        Deck.draw(currentPlayer);
        if (currentPlayer.cards[currentPlayer.cards.length.value - 1] > 5) {
            let add = 5
        } else {
            let add = currentPlayer.cards[currentPlayer.cards.length - 1].value
        }
        currentPlayer.points += add;
    } else {
        stabilize();
    }
}
function Overpopulation_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        let smallest = players[0].traitpool.length;
        let index = 0;
        for (i = 1; i < players.length; i++) {
            if (players[i].traitpool.length < smallest) {
                smallest = players[i].traitpool.length;
                index = i;
            }
        }
        players[index].points += 4;

    } else {
        currentPlayer.size += 1;
        for (i = 0; i < players.length; i++) {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
            for (k = 0; k < players[i].traitpool.length; k++) {
                for (j = 0; j < colors.length; j++) {
                    if (players[i].traitpool[k].color === colors[j]) {
                        colors.splice(j, 1);
                    }
                }
            }
            Deck.drawMultiple(player[i], colors.length);
        }
    }
}

function GlacialMeltdown_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Blue", players)
    } else {
        currentPlayer.size -= 1;
        discardRandomCard(currentPlayer);
        discardRandomCard(currentPlayer);
    }
}

function IceAge_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardHandcolor("Red", players)
    } else {
        for (k = 0; k < currentPlayer.traitpool.length; k++) {
            if (currentPlayer.traitpool[k].color === "Red") {
                currentPlayer.points -= 1;
            }
        }
    }
}

function MegaTsunami_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Red", players)
    } else {

        let temp = null;
        for (i = 0; i < players.length; i++) {
            player[i].size -= 1;
            if (i == 0) {
                temp = players[i + 1].cards;
                players[i + 1].cards == players[i].cards;
                players[i].cards = players[players.length - 1].cards;
            } else {
                let extra = temp;
                temp = player[i + 1].cards;
                player[i + 1].cards = extra;
            }
        }
    }
}

function TheFourHorsemen_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        for (i = 0; i < players.length; i++) {
            let card = null
            while (card.value < 4) {
                if (index < 0 || index >= players[i].traitpool.length) return;
                card = players[i].traitpool[index];
            }
            players[i].traitpool.splice(index, 1);
            if (card.card_name != "Endurance") {
                discardPile.push(card);
                if (cardSearch(RegenerativeTissue, players[i]) != -1) {
                    Deck.draw(players[i]);
                    let card = players[i].cards.pop();
                    players[i].traitpool.push(card);
                    onCardPlayed(card, players[i], GameState.players);
                    resolveCard(card, players[i], GameState.players);
                }
            }
        }
    } else {
        currentPlayer.size -= 1;
        discardTrait(currentPlayer);
    }

}

function GreyGoo_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        let largest = players[0].traitpool.length;
        let index = 0;
        for (i = 1; i < players.length; i++) {
            if (players[i].traitpool.length < largest) {
                largest = players[i].traitpool.length;
                index = i;
            }
        }
        players[index].points -= 5;
    } else {
        discardCardMultiple(currentPlayer, currentPlayer.cards.length);
        stabilize();
    }


    function MassExtinction_effect(card, currentPlayer, players) {
        if (isWorldsEnd) {
            discardTraitcolor("Green", players);

        } else {
            discardHandcolor("Colorless", players);
        }
    }

    function PulseEvent_effect(card, currentPlayer, players) {
        if (isWorldsEnd) {
            discardTraitcolor("Purple", players);

        } else {
            discardHandcolor("Purple", players);
        }
    }

    function Retrovirus_effect(card, currentPlayer, players) {
        if (isWorldsEnd) {
            discardTraitcolor("Green", players);

        } else {
            discardHandcolor("Green", players);
        }
    }

    function SuperVolcano_effect(card, currentPlayer, players) {
        if (isWorldsEnd) {
            CountColor("Blue", players);
        } else {
            discardHandcolor("Blue", players);
        }
    }
    function NuclearWinter_effect(card, currentPlayer, players) {
        if (isWorldsEnd) {
            discardTraitcolor("Colorless", players);
        } else {
            currentPlayer.size -= 1;
            stabilize();
            discardCard(currentPlayer);
        }
    }
    function SolarFlare_effect(card, currentPlayer, players) {
        if (isWorldsEnd) {
            discardTraitcolor("Colorless", players);
        } else {
            currentPlayer -= 1;
            discardCardMultiple(currentPlayer, Math.round(currentPlayer.cards.length / 2));
        }
    }
}

//Not Completeded Catastraphies
function AITakeover_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        //remove colorless functions and change all point values of colorless cards to 2
    } else {
        currentPlayer.size -= 1;
    }
}





export {
    TheBirthofLife_effect,
    AgeofPeace_effect,
    GlacialDrift_effect,
    LunarRetreat_effect,
    HighTides_effect,
    NorthernWinds_effect,
    AgeofWonder_effect,
    AlienTerraform_effect,
    Awakening_effect,
    GalacticDrift_effect,
    BirthofaHero_effect,
    CoastalFormations_effect,
    Flourish_effect,
    NaturalHarmony_effect,
    Prosperity_effect,
    Reforestation_effect,
    TectonicShifts_effect,
    TropicalLands_effect,
    AgeofDracula_effect,
    AgeofNietzsche_effect,
    Eclipse_effect,
    Enlightenment_effect,
    AgeofReason_effect,
    AridLands_effect,
    CometShowers_effect,
    TheMessiah_effect,
    TheBigOne_effect,
    DeusExMachina_effect,
    Overpopulation_effect,
    GlacialMeltdown_effect,
    IceAge_effect,
    MegaTsunami_effect,
    TheFourHorsemen_effect,
    GreyGoo_effect,
    MassExtinction_effect,
    NuclearWinter_effect,
    SolarFlare_effect,
    SuperVolcano_effect,
    AITakeover_effect,
    PulseEvent_effect,
    Retrovirus_effect,
};