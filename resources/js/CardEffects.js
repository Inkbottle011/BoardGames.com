import { resolveCard, GameState, chooseOpponent } from "./Doomlings.js";
import * as Deck from "./Deck.js";
//supplementary functions

function colorcounter(color, currentPlayer, card) {
    if (worldsend) {
        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].color === color) {
                card.points += 1;
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].color === color) {
                    card.points += 1;
                }
            }
        }

        )
    }

}


function value_equal_size(currentPlayer, card) {
    if (worldsend) {
        points += currentPlayer.size;
    } else {
        player.worldsEndEffects.push(() => {
            points += currentPlayer.size;
        }

        )
    }
}

//completed
function Imunity_Effect(currentPlayer, players) {
    if (worldsend) {
        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].value < 0) {
                card.points += 2;
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].value < 0) {
                    card.points += 2;
                }
            }
        }

        )
    }
}
function Tiny_Effect(currentPlayer, players) {
    if (worldsend) {
        card.points -= currentPlayer.traitpool.length
    } else {
        player.worldsEndEffects.push(() => {
            card.points -= currentPlayer.traitpool.length
        }
        )


    }
}


function ColdBlood_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
    if (index < currentPlayer.cards.length - 3 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    Doomlings.onCardPlayed(card, currentPlayer, players);
    Doomlings.resolveCard(card, currentPlayer, players);
}
function CostlySignaling_Effect(currentPlayer, players) {
    Doomlings.takeback(currentPlayer, players);
    Doomlings.play(index);
}
function EggClusters_Effect(currentPlayer, players) {
    if (worldsend) {
        colorcounter("blue", currentPlayer, this.card);
    } else {
        player.worldsEndEffects.push(() => {
            colorcounter("blue", currentPlayer, this.card);
        }

        )
    }
}
function Flight_Effect(currentPlayer, players) {
    let tempcards = currentPlayer.cards
    currentPlayer.cards = players[Doomlings.chooseOpponent(currentPlayer, players)].cards
    players[Doomlings.chooseOpponent(currentPlayer, players)].cards = tempcards

}
function IridescentScales_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
}
function PaintedShell_Effect(currentPlayer, players) {
    if (index < 0 || index >= currentPlayer.traitpool.length) return;
    if (currentPlayer.traitpool[index].action) {
        Doomlings.resolveCard(currentPlayer.traitpool[index], currentPlayer, players);
    }
}
function Saliva_Effect(currentPlayer, players) {
    currentPlayer.size += 1
}
function Scutes_Effect(currentPlayer, players) {
    let player = players[Doomlings.chooseOpponent(currentPlayer, players)]
    if (index < 0 || index >= currentPlayer.traitpool.length) return;
    let card = currentPlayer.traitpool[index];
    currentPlayer.traitpool.splice(index, 1);
    player.traitpool.push(card);

}
function SelectiveMemory_Effect(currentPlayer, players) {
    if (index < 0 || index >= discardPile.length) return;
    let card = discardPile[index];
    discardPile.splice(index, 1);
    currentPlayer.traitpool.push(card)
    Doomlings.onCardPlayed(card, currentPlayer, players);
    Doomlings.resolveCard(card, currentPlayer, players);
}

function Sweat_Effect(currentPlayer, players) {
    Doomlings.discardCard(currentPlayer);
}

function Fecundity_Effect(currentPlayer, players) {
    currentPlayer.size += 1

}


function Fortunate_Effect(currentPlayer, players) {
    if (worldsend) {
        points += currentPlayer.cards.length
    } else {
        player.worldsEndEffects.push(() => {
            points += currentPlayer.cards.length
        }

        )
    }
}

function Overgrowth_Effect(currentPlayer, players) {
    if (worldsend) {
        colorcounter("green", currentPlayer, this.card);
    } else {
        player.worldsEndEffects.push(() => {
            colorcounter("green", currentPlayer, this.card);
        }

        )
    }

}
function Photosynthesis_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 2);
    let drawnOne = currentPlayer.cards[currentPlayer.cards.length - 1];
    let drawnTwo = currentPlayer.cards[currentPlayer.cards.length - 2];
    if (drawnOne.color === "green" || drawnTwo.color === "green") {
        if (index < currentPlayer.cards.length - 3 || index >= currentPlayer.cards.length) return;
        let card = currentPlayer.cards[index];
        currentPlayer.cards.splice(index, 1);
        currentPlayer.traitpool.push(card)
        Doomlings.onCardPlayed(card, currentPlayer, players);
        Doomlings.resolveCard(card, currentPlayer, players);
    }

}
function Propagation_Effect(currentPlayer, players) {
    Doomlings.play(index);

}

function Pollination_Effect(currentPlayer, players) {

    if (worldsend) {
        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].value == 1) {
                card.points += 1;
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].value == 1) {
                    card.points += 1;
                }
            }
        }

        )
    }
}
function RandomFertilization_Effect(currentPlayer, players) {
    value_equal_size(currentPlayer, this.card);

}
function SelfReplicating_Effect(currentPlayer, players) {
    if (index < 0 || index >= discardPile.length) return;
    let card = discardPile[index];
    discardPile.splice(index, 1);
    currentPlayer.traitpool.push(card)
    if (!card.action) {
        Doomlings.resolveCard(card, currentPlayer, players);
    }

}

function Kidney_Effect(currentPlayer, players) {
    if (worldsend) {
        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].card_name === "kidney") {
                points += 1;
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].card_name === "kidney") {
                    points += 1;
                }
            }
        }

        )
    }
}

function Swarm_Effect(currentPlayer, players) {
    if (worldsend) {
        for (k = 0; k < players.length; k++) {
            for (i = 0; i < players[k].traitpool.length; i++) {
                if (players[k].traitpool[i].card_name === "swarm") {
                    points += 1;
                }
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            for (k = 0; k < players.length; k++) {
                for (i = 0; i < players[k].traitpool.length; i++) {
                    if (players[k].traitpool[i].card_name === "swarm") {
                        points += 1;
                    }
                }
            }
        }

        )
    }
}

function Trunk_Effect(currentPlayer, players) {
    let card = discardPile.pop();
    currentPlayer.traitpool.push(card)
    if (!card.action) {
        Doomlings.resolveCard(card, currentPlayer, players);
    }

}

function Altruistic_Effect(currentPlayer, players) {
    value_equal_size(currentPlayer, this.card);
}

function Boredom_Effect(currentPlayer, players) {
    if (worldsend) {
        for (i = 0; i < players[k].cards.length; i++) {
            if (players[k].cards[i].text != null) {
                points += 1;
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            for (i = 0; i < players[k].cards.length; i++) {
                if (players[k].cards[i].card_name != null) {
                    points += 1;
                }
            }
        }

        )
    }

}


function Introspective_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 4);

}

function Doting_Effect(currentPlayer, players) {

    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    players[Doomlings.chooseOpponent(currentPlayer, players)].cards.push(card);
}
function Eloquence_Effect(currentPlayer, players) {
    if (worldsend) {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        let card = currentPlayer.cards[index];
        currentPlayer.cards.splice(index, 1);
        if (!card.action) {
            Doomlings.onCardPlayed(card, currentPlayer, players);
            Doomlings.resolveCard(card, currentPlayer, players);
        }

    } else {
        player.worldsEndEffects.push(() => {
            if (index < 0 || index >= currentPlayer.cards.length) return;
            let card = currentPlayer.cards[index];
            currentPlayer.cards.splice(index, 1);
            if (!card.action) {
                Doomlings.onCardPlayed(card, currentPlayer, players);
                Doomlings.resolveCard(card, currentPlayer, players);
            }

        }

        )
    }

}


function Gratitude_Effect(currentPlayer, players) {

    if (worldsend) {
        let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];

        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            for (j = 0; j < colors.length; j++) {
                if (currentPlayer.traitpool[i].color === colors[j]) {
                    points += 1;
                    colors.splice(j, 1);
                }
            }
        }

    } else {
        player.worldsEndEffects.push(() => {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];

            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                for (j = 0; j < colors.length; j++) {
                    if (currentPlayer.traitpool[i].color === colors[j]) {
                        points += 1;
                        colors.splice(j, 1);
                    }
                }
            }

        }

        )
    }

}
function Just_Effect(currentPlayer, players) {
    currentPlayer.size += 1

}
function Mitochondrion_Effect(currentPlayer, players) {
    currentPlayer.size += 1;
}
function Mindful_Effect(currentPlayer, players) {
    colorcounter("Colorless", currentPlayer, this.card);
}

function Saudade_Effect(currentPlayer, players) {
    if (worldsend) {
        let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];

        for (i = 0; i < currentPlayer.cards.length; i++) {
            for (j = 0; j < colors.length; j++) {
                if (currentPlayer.cards[i].color === colors[j]) {
                    points += 1;
                    colors.splice(j, 1);
                }
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];

            for (i = 0; i < currentPlayer.cards.length; i++) {
                for (j = 0; j < colors.length; j++) {
                    if (currentPlayer.cards[i].color === colors[j]) {
                        points += 1;
                        colors.splice(j, 1);
                    }
                }
            }

        })

    }

}

function Camouflage_Effect(currentPlayer, players) {
    currentPlayer.size += 1;
    value_equal_size(currentPlayer, this.card);

}


function Vampirism_Effect(currentPlayer, players) {
    player = Doomlings.chooseOpponent(currentPlayer, players);
    if (index < 0 || index >= player.traitpool.length) return;
    let card = player.traitpool[index];
    player.traitpool.splice(index, 1);
    currentPlayer.traitpool.push(card);
    Doomlings.onCardPlayed(card, currentPlayer, players);
    Doomlings.resolveCard(card, currentPlayer, players);
}

function Viral_Effect(currentPlayer, players) { //maybe works idk
    if (worldsend) {
        let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
        if (index < 0 || index >= colors.length) return;
        let color = colors[index];
        for (i = 0; i < players.length; i++) {
            for (k = 0; k < players[i].traitpool.length; k++) {
                if (players[i].traitpool[k].color === color) {
                    points--;
                }
            }
        }

    } else {
        player.worldsEndEffects.push(() => {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
            if (index < 0 || index >= colors.length) return;
            let color = colors[index];
            for (i = 0; i < players.length; i++) {
                for (k = 0; k < players[i].traitpool.length; k++) {
                    if (players[i].traitpool[k].color === color) {
                        points--;
                    }
                }
            }


        })

    }
}
function DirectlyRegister_Effect(currentPlayer, players) { //unsure if this would work or not
    while (index != -1) {
        player = Doomlings.chooseOpponent(currentPlayer, players);
        if (index < 0 || index >= player.traitpool.length) return;
        let card = player.traitpool[index];
        if (card.value == 1) {
            player.traitpool.splice(index, 1);
            currentPlayer.cards.push(card);
            break;
        }
    }
}

function Dreamer_Effect(currentPlayer, players) {
    currentPlayer.size += 1;

}


function Impatience_Effect(currentPlayer, players) {
    player = Doomlings.chooseOpponent(currentPlayer, players);
    if (index < 0 || index >= player.cards.length) return;
    let Cardone = player.cards[index];
    player.cards.splice(index, 1);
    currentPlayer.cards.push(Cardone);
    if (index < 0 || index >= player.cards.length) return;
    let Cardtwo = player.cards[index];
    player.cards.splice(index, 1);
    currentPlayer.cards.push(Cardtwo);
}

function Inventive_Effect(currentPlayer, players) {
    player = Doomlings.chooseOpponent(currentPlayer, players);
    if (index < 0 || index >= player.traitpool.length) return;
    let card = player.traitpool[index];
    Doomlings.resolveCard(card, currentPlayer, players);

}
function Memory_Effect(currentPlayer, players) {
    //open window that asks player do you wish to discard?
    let playerchoice = true
    if (playerchoice) {
        while (currentPlayer.cards.length > 0) {
            Doomlings.discardCard(currentPlayer);
        }
    }

    while (currentPlayer.cards.length != currentPlayer.size) {
        Deck.draw(currentPlayer);
    }

}

function StickySecretions_Effect(currentPlayer, players) {
    colorcounter("Purple", currentPlayer, this.card);

}

function SuperSpreader_Effect(currentPlayer, players) {
    currentPlayer.size -= 1;
    for (i = 0; i < players.length; i++) {
        players[i].size -= 1;
    }
}

function Nosy_Effect(currentPlayer, players) {
    player = chooseOpponent(currentPlayer, players)
    let randomOne = Math.floor(Math.random() * player.cards.length);

    let randomTwo = Math.floor(Math.random() * player.cards.length);
    while (randomTwo == randomOne) {
        randomTwo = Math.floor(Math.random() * player.cards.length);
    }

    let choosenCards = [randomTwo, randomOne];
    if (index < 0 || index >= choosenCards.length) return;
    let card = player.cards[choosenCards[index]];
    player.cards.splice(choosenCards[index], 1);
    currentPlayer.traitpool.push(card);
    Doomlings.onCardPlayed(card, currentPlayer, players);
    Doomlings.resolveCard(card, currentPlayer, players);
}

function Persuasive_Effect(currentPlayer, players) {
    let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
    if (index < 0 || index >= colors.length) return;
    let color = colors[index];
    for (i = 0; i < currentPlayer.cards.length; i++) {
        if (currentPlayer.cards[i].color === color) {
            discardPile.push(currentPlayer.cards[i]);
            currentPlayer.cards.splice(i, 1);
        }
    }

    for (i = 0; i < players.length; i++) {
        for (k = 0; k < players[i].cards.length; k++) {
            if (players[i].cards[k].color === color) {
                discardPile.push(players[i].cards[k]);
                players[i].cards.splice(k, 1);
            }
        }
    }
}
function Poisonous_Effect(currentPlayer, players) {
    player = chooseOpponent(currentPlayer, players);
    if (index < 0 || index >= player.traitpool.length) return;
    let card = player.traitpool[index];
    player.traitpool.splice(index, 1);
    player.traitpool.push(this.card);
    currentPlayer.traitpool.push(card);
}

function Teeth_Effect(currentPlayer, players) {
    currentPlayer.size += 1;
}

function ApexPredator_Effect(currentPlayer, players) {
    if (worldsend) {
        let mostTrait = true;
        for (i = 0; i < players.length; i++) {
            if (currentPlayer.traitpool.length < players[i].traitpool.length) {
                mostTrait = false;
                break;
            }
        }

        if (mostTrait) {
            points += 4;
        }

    } else {
        player.worldsEndEffects.push(() => {
            let mostTrait = true;
            for (i = 0; i < players.length; i++) {
                if (currentPlayer.traitpool.length < players[i].traitpool.length) {
                    mostTrait = false;
                    break;
                }
            }

            if (mostTrait) {
                points += 4;
            }

        })

    }
}
function Bad_Effect(currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        Doomlings.discardCard(players[i]);
        Doomlings.discardCard(players[i]);
    }
}
function Brave_Effect(currentPlayer, players) {
    if (worldsend) {
        for (i = 0; i < currentPlayer.cards.length; i++) {
            if (currentPlayer.cards[i].dominate) {
                points += 2
            }
        }

    } else {
        player.worldsEndEffects.push(() => {
            for (i = 0; i < currentPlayer.cards.length; i++) {
                if (currentPlayer.cards[i].dominate) {
                    points += 2
                }
            }
        })

    }
}

function BruteStrength_Effect(currentPlayer, players) {
    currentPlayer.size -= 1;
}
function HeatVision_Effect(currentPlayer, players) {
    colorcounter("Red", currentPlayer, this.card);
}
function HotTemper_Effect(currentPlayer, players) {
    Doomlings.discardCardMultiple(currentPlayer, 2);
}


function Reckless_Effect(currentPlayer, players) {
    Doomlings.discardTrait(currentPlayer);
    Doomlings.discardTrait(Doomlings.chooseOpponent(currentPlayer, players));

}

function WarmBlood_Effect(currentPlayer, players) {
    currentPlayer.size += 2;
}

function Voracious_Effect(currentPlayer, players) {
    discardTrait(currentPlayer);
    if (index < 0 || index >= currentPlayer.cards.length) return;
    let card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    onCardPlayed(card, currentPlayer, players);
    resolveCard(card, currentPlayer, players);

}

function Tentacles_Effect(currentPlayer, players) {
    if (index < 0 || index >= currentPlayer.traitpool.length) return;
    let cardOne = currentPlayer.traitpool[index];
    currentPlayer.traitpool.splice(index, 1);
    player = chooseOpponent(currentPlayer, players);
    if (index < 0 || index >= player.traitpool.length) return;
    let cardTwo = player.traitpool[index];
    while (cardTwo.color != cardOne.color) {
        if (index < 0 || index >= player.traitpool.length) return;
    }
    player.traitpool.splice(index, 1);
    currentPlayer.traitpool.push(cardTwo);
    player.traitpool.push(cardOne);
}

function Faith_Effect(currentPlayer, players) {

    if (worldsend) {
        let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
        if (index < 0 || index >= colors.length) return;
        let color = colors[index];

        colors.splice(index, 1);
        if (index < 0 || index >= colors.length) return;
        player_chosen_color = colors[index];
        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].color === color) {
                currentPlayer.traitpool[i].color = player_chosen_color;
            }
        }
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
            if (index < 0 || index >= colors.length) return;
            let color = colors[index];

            colors.splice(index, 1);
            if (index < 0 || index >= colors.length) return;
            player_chosen_color = colors[index];
            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].color === color) {
                    currentPlayer.traitpool[i].color = player_chosen_color;
                }
            }
        });
    }

}

function Selfish_Effect(currentPlayer, players) {
    player = chooseOpponent(currentPlayer, players);
    if (player.traitpool.length === 0) return;
    let randomIndex = Math.floor(Math.random() * player.traitpool.length);
    while (player.traitpool[randomIndex].color != "Red") {
        randomIndex = Math.floor(Math.random() * player.traitpool.length);
    }
    currentPlayer.traitpool.push(player.traitpool[randomIndex]);
    player.traitpool.splice(randomIndex, 1);

} // steal a red card from an opponenents trait pile

function Symbiosis_Effect(currentPlayer, players) {
    if (worldsend) {
        let count = [0, 0, 0, 0, 0]
        for (k = 0; k < currentPlayer.traitpool.length; k++) {
            if (currentPlayer.traitpool[k] === "Blue") {
                count[0] += 1;
            }
            if (currentPlayer.traitpool[k] === "Purple") {
                count[1] += 1;
            }
            if (currentPlayer.traitpool[k] === "Red") {
                count[2] += 1;
            }
            if (currentPlayer.traitpool[k] === "Green") {
                count[3] += 1;
            }
            if (currentPlayer.traitpool[k] === "Colorless") {
                count[4] += 1;
            }
        }
        let color = null;
        if (count[0] > count[1] || count[0] > count[2] || count[0] > count[3] || count[0] > count[4]) {
            color = "Blue";
        } else if (count[1] > count[2] || count[1] > count[3] || count[1] > count[4]) {
            color = "Purple";
        } else if (count[2] > count[3] || count[2] > count[4]) {
            color = "Red";
        } else if (count[3] > count[4]) {
            color = "Green";
        } else {
            color = "Colorless";
        }


        for (i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].color === color) {
                card.points += 1;
            }
        }
    } else {
        player.worldsEndEffects.push(() => {
            let count = [0, 0, 0, 0, 0]
            for (k = 0; k < currentPlayer.traitpool.length; k++) {
                if (currentPlayer.traitpool[k] === "Blue") {
                    count[0] += 1;
                }
                if (currentPlayer.traitpool[k] === "Purple") {
                    count[1] += 1;
                }
                if (currentPlayer.traitpool[k] === "Red") {
                    count[2] += 1;
                }
                if (currentPlayer.traitpool[k] === "Green") {
                    count[3] += 1;
                }
                if (currentPlayer.traitpool[k] === "Colorless") {
                    count[4] += 1;
                }
            }
            let color = null;
            if (count[0] > count[1] || count[0] > count[2] || count[0] > count[3] || count[0] > count[4]) {
                color = "Blue";
            } else if (count[1] > count[2] || count[1] > count[3] || count[1] > count[4]) {
                color = "Purple";
            } else if (count[2] > count[3] || count[2] > count[4]) {
                color = "Red";
            } else if (count[3] > count[4]) {
                color = "Green";
            } else {
                color = "Colorless";
            }
            for (i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].color === color) {
                    card.points += 1;
                }
            }
        }

        )
    }

}// +2 for every trait in the lowest color count 
function TinyLittleMelons_Effect(currentPlayer, players) {
    player = chooseOpponent(currentPlayer, players);
    if (player.traitpool.length === 0) return;
    let randomIndex = Math.floor(Math.random() * player.traitpool.length);
    while (player.traitpool[randomIndex].color != "Green") {
        randomIndex = Math.floor(Math.random() * player.traitpool.length);
    }
    currentPlayer.traitpool.push(player.traitpool[randomIndex]);
    player.traitpool.splice(randomIndex, 1);
}

function PackBehavior_Effect(currentPlayer, players) {
    if (worldsend) {
        let count = [0, 0, 0, 0, 0]
        for (k = 0; k < currentPlayer.traitpool.length; k++) {
            if (currentPlayer.traitpool[k] === "Blue") {
                count[0] += 1;
            }
            if (currentPlayer.traitpool[k] === "Purple") {
                count[1] += 1;
            }
            if (currentPlayer.traitpool[k] === "Red") {
                count[2] += 1;
            }
            if (currentPlayer.traitpool[k] === "Green") {
                count[3] += 1;
            }
            if (currentPlayer.traitpool[k] === "Colorless") {
                count[4] += 1;
            }
        }

        for (i = 0; i < count.length; i++) {
            points += Math.round(count[i] / 2);
        }
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            let count = [0, 0, 0, 0, 0]
            for (k = 0; k < currentPlayer.traitpool.length; k++) {
                if (currentPlayer.traitpool[k] === "Blue") {
                    count[0] += 1;
                }
                if (currentPlayer.traitpool[k] === "Purple") {
                    count[1] += 1;
                }
                if (currentPlayer.traitpool[k] === "Red") {
                    count[2] += 1;
                }
                if (currentPlayer.traitpool[k] === "Green") {
                    count[3] += 1;
                }
                if (currentPlayer.traitpool[k] === "Colorless") {
                    count[4] += 1;
                }
            }

            for (i = 0; i < count.length; i++) {
                points += Math.round(count[i] / 2);
            }
        });
    }

} //+1 for every color pair

function Branches_Effect(currentPlayer, players) {
    if (worldsend) {
        let count = 0;
        for (k = 0; k < currentPlayer.traitpool.length; k++) {
            if (currentPlayer.traitpool[k] === "Green") {
                count++;
            }

        }

        points += Math.round(count / 2);
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            let count = 0;
            for (k = 0; k < currentPlayer.traitpool.length; k++) {
                if (currentPlayer.traitpool[k] === "Green") {
                    count++;
                }

            }

            points += Math.round(count / 2);
        })
    }

} // +1 for every pair of green traits in each oppenents trait pile 

function SelfAwareness_Effect(currentPlayer, players) {
    player = chooseOpponent(currentPlayer, players);
    player.traitpool.push(this.card);
} //Play at any time into an opponents trait pile
function HyperIntelligence_Effect(currentPlayer, players) {
    let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
    if (index < 0 || index >= colors.length) return;
    let color = colors[index];
    for (i = 0; i < players.length; i++) {
        Doomlings.discardColor(players[i], color);
    }

} // choose a color players choose one trait of that color to remove 

function Territorial_Effect(currentPlayer, players) {
    for (i = 0; i < players.length; i++) {
        Doomlings.discardColor(players[i], "Red");
    }

}  // all oppenents discard 1 red trait

function Venomous_Effect(currentPlayer, players) {
    Doomlings.play(index);
    player = Doomlings.chooseOpponent(currentPlayer, players);
    player.traitpool.push(this.card);
} // move to another 
function Telekinetic_Effect(currentPlayer, players) {
    player = chooseOpponent(currentPlayer, players);
    if (index < 0 || index >= currentPlayer.traitpool.length) return;
    let card = currentPlayer.traitpool[index];
    currentPlayer.traitpool.splice(index, 1);

    while (card.color === newCard.color) {
        if (index < 0 || index >= player.traitpool.length) return;
        newCard = player.traitpool[index];
    }
    player.traitpool.splice(index, 1);
    currentPlayer.traitpool.push(newCard);
    player.traitpool.push(card);
} // swap 

function OptimisticNihilism_Effect(currentPlayer, players) {
    if (Ages.length === 0) return;
    while (Doomlings.GameState.currentAge.catastrophe) {
        Doomlings.GameState.currentAge = Ages.shift();
    }
    Doomlings.GameState.catastropheCount++;
    Doomlings.play(index);
} // skipping player turns and bringing about a catasrohpy ignoring age effects as well.
function RegenerativeTissue_Effect(currentPlayer, players) { } // any time you discard a trait draw 1 play immediatly Completed in Doomlings.js
function Endurance_Effect(currentPlayer, players) { } // whenever you discard this card return to the trait pile. Completed in Doomlings.js
function Echolocation_Effect(currentPlayer, players) { } // draw a card at the start of each of your turns Completed in Doomlings.js
function Blubber_Effect(currentPlayer, players) { } //Does nothing WOW!
function Gills_Effect(currentPlayer, players) { } //DOES NOTHING FUCK YEA 
function Migratory_Effect(currentPlayer, players) { } // NOTHING FUCK YEA
function Spiny_Effect(currentPlayer, players) { } //DOES FUCK ALL
function Apealing_Effect(currentPlayer, players) { } //DOES NOTHIN
function Bark_Effect(currentPlayer, players) { } // HAS NO FUNCTION
function DeepRoots_Effect(currentPlayer, players) { } //USELESS
function Leaves_Effect(currentPlayer, players) { } // WOW I DID NOTHING
function WoodyStems_Effect(currentPlayer, players) { } //FINALLY NOTHING 
function Confusion_Effect(currentPlayer, players) { } //Confused that it does nothing
function Fear_Effect(currentPlayer, players) { } // Im afraid it does nothing 
function Flatulence_Effect(currentPlayer, players) { } // Ha ha fart... What it does nothing but fart
function Adorable_Effect(currentPlayer, players) { } // AWWWWW DOES NOTHING
function BigEars_Effect(currentPlayer, players) { } //WHAT U SAYYYY IT DOES NOTHING???
function FineMotorSkills_Effect(currentPlayer, players) { } // Wow, just wow
function Nocturnal_Effect(currentPlayer, players) { } // ZZZZZzzzzzzzz 
function Antlers_Effect(currentPlayer, players) { } // big antlers go brrrrrr
function Fangs_Effect(currentPlayer, players) { } // rawr tooo scary to work on 
function FireSkin_Effect(currentPlayer, players) { } // HOT hot Hot
function StoneSkin_Effect(currentPlayer, players) { } // ROCK HARD
function Quick_Effect(currentPlayer, players) { } // couldn't catch it
//bug fixable
function Automimicry_Effect(currentPlayer, players) { }
function Chromatophores_Effect(currentPlayer, players) { }
//not completed



//REMOVE PROLLY IDK 
// function SwarmHorns_Effect(currentPlayer, players) { }
// function SwarmMindless_Effect(currentPlayer, players) { }
// function SwarmSpots_Effect(currentPlayer, players) { }
// function SwarmStripes_Effect(currentPlayer, players) { }
function Denial_Effect(currentPlayer, players) { } // Ignore the next catastrophe need to figure out how to make sure we only ignore the next catastraphy
function Delicious_Effect(currentPlayer, players) { } // restricted 
function RetractableClaws_Effect(currentPlayer, players) { } // restricted 
function Heroic_Effect(currentPlayer, players) { } //restricted
function Late_Effect(currentPlayer, players) { } // effect based on after stablization 
function Morality_Effect(currentPlayer, players) { } //limitation
function Prepper_Effect(currentPlayer, players) { } // choose a worlds end
function TheThirdEye_Effect(currentPlayer, players) {
    //HTML thing honestly 
    let PredictionAge = Doomlings.Ages[1];
} // look at the next age 
function Clever_Effect(currentPlayer, players) { } // oppenents reveal a card choose out of revealed cards 1 
function Parasitic_Effect(currentPlayer, players) { } // steal that card and stop that trait effect 
function Sneaky_Effect(currentPlayer, players) { } // at worlds end play immediatly for free

//delete prolly idk 
// function KidneyChefsToque_Effect(currentPlayer, players) { }
// function KidneyCombover_Effect(currentPlayer, players) { }
// function KidneyElfHat_Effect(currentPlayer, players) { }
// function KidneyPartyHat_Effect(currentPlayer, players) { }
// function KidneyTiara_Effect(currentPlayer, players) { }


//export function
export {
    Echolocation_Effect,
    Imunity_Effect,
    Tiny_Effect,
    Automimicry_Effect,
    Blubber_Effect,
    Chromatophores_Effect,
    ColdBlood_Effect,
    CostlySignaling_Effect,
    EggClusters_Effect,
    Flight_Effect,
    Gills_Effect,
    IridescentScales_Effect,
    Migratory_Effect,
    PaintedShell_Effect,
    RegenerativeTissue_Effect,
    Saliva_Effect,
    Scutes_Effect,
    SelectiveMemory_Effect,
    Spiny_Effect,
    Sweat_Effect,
    Tentacles_Effect,
    Heroic_Effect,
    PackBehavior_Effect,
    Symbiosis_Effect,
    Apealing_Effect,
    Bark_Effect,
    Branches_Effect,
    DeepRoots_Effect,
    Fecundity_Effect,
    Fortunate_Effect,
    Leaves_Effect,
    Overgrowth_Effect,
    Photosynthesis_Effect,
    Pollination_Effect,
    Propagation_Effect,
    RandomFertilization_Effect,
    SelfReplicating_Effect,
    SwarmFur_Effect,
    SwarmHorns_Effect,
    SwarmMindless_Effect,
    SwarmSpots_Effect,
    SwarmStripes_Effect,
    TinyLittleMelons_Effect,
    Trunk_Effect,
    WoodyStems_Effect,
    Denial_Effect,
    Faith_Effect,
    OptimisticNihilism_Effect,
    Altruistic_Effect,
    Boredom_Effect,
    Confusion_Effect,
    Delicious_Effect,
    Doting_Effect,
    Eloquence_Effect,
    Fear_Effect,
    Flatulence_Effect,
    Gratitude_Effect,
    Introspective_Effect,
    Just_Effect,
    Late_Effect,
    Mindful_Effect,
    Mitochondrion_Effect,
    Morality_Effect,
    Prepper_Effect,
    Saudade_Effect,
    SelfAwareness_Effect,
    TheThirdEye_Effect,
    Camouflage_Effect,
    Vampirism_Effect,
    Viral_Effect,
    Adorable_Effect,
    BigEars_Effect,
    Clever_Effect,
    DirectlyRegister_Effect,
    Dreamer_Effect,
    FineMotorSkills_Effect,
    Impatience_Effect,
    Inventive_Effect,
    Memory_Effect,
    Nocturnal_Effect,
    Nosy_Effect,
    Parasitic_Effect,
    Persuasive_Effect,
    Poisonous_Effect,
    Selfish_Effect,
    Sneaky_Effect,
    StickySecretions_Effect,
    SuperSpreader_Effect,
    Teeth_Effect,
    Telekinetic_Effect,
    Venomous_Effect,
    ApexPredator_Effect,
    HyperIntelligence_Effect,
    Sentience_Effect,
    Antlers_Effect,
    Bad_Effect,
    Brave_Effect,
    BruteStrength_Effect,
    Endurance_Effect,
    Fangs_Effect,
    FireSkin_Effect,
    HeatVision_Effect,
    HotTemper_Effect,
    KidneyBeerHelm_Effect,
    KidneyChefsToque_Effect,
    KidneyCombover_Effect,
    KidneyElfHat_Effect,
    KidneyPartyHat_Effect,
    KidneyTiara_Effect,
    Quick_Effect,
    Reckless_Effect,
    RetractableClaws_Effect,
    StoneSkin_Effect,
    Territorial_Effect,
    Voracious_Effect,
    WarmBlood_Effect,
};
