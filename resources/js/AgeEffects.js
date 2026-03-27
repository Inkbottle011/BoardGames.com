<<<<<<< HEAD
import { resolveCard, GameState, chooseOpponent, StealHandCard, discardCardMultiple, discardRandomCard, discardTrait, stabilize, discardCard, cardSearch } from "./Doomlings.js";
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
//not completed



function AlienTerraform_effect(card, currentPlayer, players) {
    //prompt player if they would like to discard their dominate cards from they're hand 
    //if they do remove dominates from their hand then stabilize
}

function Awakening_effect(card, currentPlayer, players) {
    let PredictionAge = Doomlings.Ages[1];
    //show age to current player 
}


function NaturalHarmony_effect(card, currentPlayer, players) {
    //cannot play a color that the last player played  
}
function Prosperity_effect(card, currentPlayer, players) {
    //prompt player if they would like to stablize if no they don't stabilize
}
function Reforestation_effect(card, currentPlayer, players) {
    //Traits in your trait pile cannot by swaped stolen or discards IDK HOW THE FUCK THIS WILL WORK
}




function AgeofNietzsche_effect(card, currentPlayer, players) {
    //instead of stablizing discard hand and draw 3 prompt player for this
}

function Enlightenment_effect(card, currentPlayer, players) {
    //prompt player to choose to discard 2 cards in their hand
}




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
    if (worldsend) {
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
    if (worldsend) {
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
    if (worldsend) {
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
            for (k = 0; k < currentPlayer.traitpool.length; k++) {
                for (j = 0; j < colors.length; j++) {
                    if (currentPlayer.traitpool[k].color === colors[j]) {
                        colors.splice(j, 1);
                    }
                }
            }
            Deck.drawMultiple(player[i], colors.length);
        }
    }
}

function GlacialMeltdown_effect(card, currentPlayer, players) {
    if (worldsend) {
        discardTraitcolor("Blue", players)
    } else {
        currentPlayer.size -= 1;
        discardRandomCard(currentPlayer);
        discardRandomCard(currentPlayer);
    }
}

function IceAge_effect(card, currentPlayer, players) {
    if (worldsend) {
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
    if (worldsend) {
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
    if (worldsend) {
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
    if (worldsend) {
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
        if (worldsend) {
            discardTraitcolor("Green", players);

        } else {
            discardHandcolor("Colorless", players);
        }
    }

    function PulseEvent_effect(card, currentPlayer, players) {
        if (worldsend) {
            discardTraitcolor("Purple", players);

        } else {
            discardHandcolor("Purple", players);
        }
    }

    function Retrovirus_effect(card, currentPlayer, players) {
        if (worldsend) {
            discardTraitcolor("Green", players);

        } else {
            discardHandcolor("Green", players);
        }
    }

    function SuperVolcano_effect(card, currentPlayer, players) {
        if (worldsend) {
            CountColor("Blue", players);
        } else {
            discardHandcolor("Blue", players);
        }
    }
    function NuclearWinter_effect(card, currentPlayer, players) {
        if (worldsend) {
            discardTraitcolor("Colorless", players);
        } else {
            currentPlayer.size -= 1;
            stabilize();
            discardCard(currentPlayer);
        }
    }
    function SolarFlare_effect(card, currentPlayer, players) {
        if (worldsend) {
            discardTraitcolor("Colorless", players);
        } else {
            currentPlayer -= 1;
            discardCardMultiple(currentPlayer, Math.round(currentPlayer.cards.length / 2));
        }
    }
}

//Not Completeded Catastraphies
function AITakeover_effect(card, currentPlayer, players) { }





export {
    Age_of_Peace_effect,
    Glacial_Drift_effect,
    Lunar_Retreat_effect,
    High_Tides_effect,
    Northern_Winds_effect,
    Age_of_Wonder_effect,
    Alien_Terraform_effect,
    Awakening_effect,
    Galactic_Drift_effect,
    Birth_of_a_Hero_effect,
    Coastal_Formations_effect,
    Flourish_effect,
    Natural_Harmony_effect,
    Prosperity_effect,
    Reforestation_effect,
    Tectonic_Shifts_effect,
    Tropical_Lands_effect,
    Age_of_Dracula_effect,
    Age_of_Nietzsche_effect,
    Eclipse_effect,
    Enlightenment_effect,
    Age_of_Reason,
    Arid_Lands,
    Comet_Showers,
    The_Messiah,
    The_Big_One,
    Deus_Ex_Machina,
    Overpopulation,
    Glacial_Meltdown,
    Ice_Age,
    Mega_Tsunami,
    The_Four_Horsemen,
    Grey_Goo,
    Mass_Extinction,
    Nuclear_Winter,
    Solar_Flare,
    Super_Volcano,
    AI_Takeover,
    Pulse_Event,
    Retrovirus,
    The_Birth_of_Life
=======
import { resolveCard, GameState, chooseOpponent } from "./Doomlings.js";
import * as Deck from "./Deck.js";
import * as CardEffects from "./CardEffects.js";


//completed

function TheBirthofLife_effect(currentPlayer, players) { } // starting age does nothing
//not completed

function AgeofPeace_effect(currentPlayer, players) {

}

function GlacialDrift_effect(currentPlayer, players) {

}

function LunarRetreat_effect(currentPlayer, players) {

}

function HighTides_effect(currentPlayer, players) {

}

function NorthernWinds_effect(currentPlayer, players) {

}

function AgeofWonder_effect(currentPlayer, players) {

}

function AlienTerraform_effect(currentPlayer, players) {

}

function Awakening_effect(currentPlayer, players) {

}

function GalacticDrift_effect(currentPlayer, players) {

}

function BirthofaHero_effect(currentPlayer, players) {

}
function CoastalFormations_effect(currentPlayer, players) {

}
function Flourish_effect(currentPlayer, players) {

}
function NaturalHarmony_effect(currentPlayer, players) {

}
function Prosperity_effect(currentPlayer, players) {

}
function Reforestation_effect(currentPlayer, players) {

}

function TectonicShifts_effect(currentPlayer, players) {

}

function TropicalLands_effect(currentPlayer, players) {

}

function AgeofDracula_effect(currentPlayer, players) {

}

function AgeofNietzsche_effect(currentPlayer, players) {

}

function Eclipse_effect(currentPlayer, players) {

}

function Enlightenment_effect(currentPlayer, players) {

}

function AgeofReason_effect(currentPlayer, players) {

}

function AridLands_effect(currentPlayer, players) {

}

function CometShowers_effect(currentPlayer, players) {

}

function TheMessiah_effect(currentPlayer, players) {

}

function TheBigOne_effect(currentPlayer, players) {

}

function DeusExMachina_effect(currentPlayer, players) {

}

function Overpopulation_effect(currentPlayer, players) {

}

function GlacialMeltdown_effect(currentPlayer, players) {

}

function IceAge_effect(currentPlayer, players) {

}

function MegaTsunami_effect(currentPlayer, players) {

}

function TheFourHorsemen_effect(currentPlayer, players) {

}

function GreyGoo_effect(currentPlayer, players) {

}

function MassExtinction_effect(currentPlayer, players) {

}

function NuclearWinter_effect(currentPlayer, players) {

}

function SolarFlare_effect(currentPlayer, players) {

}

function SuperVolcano_effect(currentPlayer, players) {

}

function AITakeover_effect(currentPlayer, players) {

}

function PulseEvent_effect(currentPlayer, players) {

}

function Retrovirus_effect(currentPlayer, players) {

}



export {
    Age_of_Peace_effect,
    Glacial_Drift_effect,
    Lunar_Retreat_effect,
    High_Tides_effect,
    Northern_Winds_effect,
    Age_of_Wonder_effect,
    Alien_Terraform_effect,
    Awakening_effect,
    Galactic_Drift_effect,
    Birth_of_a_Hero_effect,
    Coastal_Formations_effect,
    Flourish_effect,
    Natural_Harmony_effect,
    Prosperity_effect,
    Reforestation_effect,
    Tectonic_Shifts_effect,
    Tropical_Lands_effect,
    Age_of_Dracula_effect,
    Age_of_Nietzsche_effect,
    Eclipse_effect,
    Enlightenment_effect,
    Age_of_Reason,
    Arid_Lands,
    Comet_Showers,
    The_Messiah,
    The_Big_One,
    Deus_Ex_Machina,
    Overpopulation,
    Glacial_Meltdown,
    Ice_Age,
    Mega_Tsunami,
    The_Four_Horsemen,
    Grey_Goo,
    Mass_Extinction,
    Nuclear_Winter,
    Solar_Flare,
    Super_Volcano,
    AI_Takeover,
    Pulse_Event,
    Retrovirus,
    The_Birth_of_Life
>>>>>>> 17931ed74b7ff760a747646b2303843b7323b561
};