import { resolveCard, GameState, chooseOpponent } from "./Doomlings.js";
import * as Deck from "./Deck.js";
//supplementary functions

function colorcounter(color, currentPlayer, card) {
    for (i = 0; i < currentPlayer.traitpool.length; i++) {
        if (currentPlayer.traitpool[i].color === color) {
            card.points += 1;
        }
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
    currentPlayer.cards = players[chooseOpponent(currentPlayer, players)].cards
    players[chooseOpponent(currentPlayer, players)].cards = tempcards

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
    players[chooseOpponent(currentPlayer, players)].cards.push(card);
}
function Eloquence_Effect(currentPlayer, players) {
    if (worldsend) {
        if (index < 0 || index >= currentPlayer.cards.length) return;
        let card = currentPlayer.cards[index];
        currentPlayer.cards.splice(index, 1);
        if (!card.action) {
            onCardPlayed(card, currentPlayer, players);
            resolveCard(card, currentPlayer, players);
        }

    } else {
        player.worldsEndEffects.push(() => {
            if (index < 0 || index >= currentPlayer.cards.length) return;
            let card = currentPlayer.cards[index];
            currentPlayer.cards.splice(index, 1);
            if (!card.action) {
                onCardPlayed(card, currentPlayer, players);
                resolveCard(card, currentPlayer, players);
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
//bug fixable
function Automimicry_Effect(currentPlayer, players) { }
function Chromatophores_Effect(currentPlayer, players) { }
//not completed
function Echolocation_Effect(currentPlayer, players) { }





function RegenerativeTissue_Effect(currentPlayer, players) { }



function Tentacles_Effect(currentPlayer, players) { }


function Heroic_Effect(currentPlayer, players) { }


function PackBehavior_Effect(currentPlayer, players) { } //+1 for every color pair

function Symbiosis_Effect(currentPlayer, players) { }// +2 for every trait in the lowest color count 


function Branches_Effect(currentPlayer, players) { } // +1 for every pair of green traits in each oppenents trait pile 










//REMOVE PROLLY IDK 
function SwarmHorns_Effect(currentPlayer, players) { }
function SwarmMindless_Effect(currentPlayer, players) { }
function SwarmSpots_Effect(currentPlayer, players) { }
function SwarmStripes_Effect(currentPlayer, players) { }



function TinyLittleMelons_Effect(currentPlayer, players) { }




function Denial_Effect(currentPlayer, players) { } // Ignore the next catastrophe need to figure out how to make sure we only ignore the next catastraphy
function Faith_Effect(currentPlayer, players) {
    currentPlayer.worldsEndEffects.push(() => {
        //Player chooses color then
        // change all traits of 1 color to another color
        /*
            for(i = 0; i< currentPlayer.traitpool.length; i++){
                if(currentPlayer.traitpool[i].color === player_chosen_color){
                    currentPlayer.traitpool[i].color = player_chosen_color;
                }
            }
        */
    });
}
function OptimisticNihilism_Effect(currentPlayer, players) { } // skipping player turns and bringing about a catasrohpy ignoring age effects as well. 




function Delicious_Effect(currentPlayer, players) { } // restricted 






function Late_Effect(currentPlayer, players) { } // effect based on after stablization 
function Mindful_Effect(currentPlayer, players) {

}
function Mitochondrion_Effect(currentPlayer, players) { }
function Morality_Effect(currentPlayer, players) { }
function Prepper_Effect(currentPlayer, players) { }
function Saudade_Effect(currentPlayer, players) { }
function SelfAwareness_Effect(currentPlayer, players) { }
function TheThirdEye_Effect(currentPlayer, players) { }
function Camouflage_Effect(currentPlayer, players) { }
function Vampirism_Effect(currentPlayer, players) { }
function Viral_Effect(currentPlayer, players) { }
function Adorable_Effect(currentPlayer, players) { }
function BigEars_Effect(currentPlayer, players) { }
function Clever_Effect(currentPlayer, players) { }
function DirectlyRegister_Effect(currentPlayer, players) { }
function Dreamer_Effect(currentPlayer, players) { }
function FineMotorSkills_Effect(currentPlayer, players) { }
function Impatience_Effect(currentPlayer, players) { }
function Inventive_Effect(currentPlayer, players) { }
function Memory_Effect(currentPlayer, players) { }
function Nocturnal_Effect(currentPlayer, players) { }
function Nosy_Effect(currentPlayer, players) { }
function Parasitic_Effect(currentPlayer, players) { }
function Persuasive_Effect(currentPlayer, players) { }
function Poisonous_Effect(currentPlayer, players) { }
function Selfish_Effect(currentPlayer, players) { }
function Sneaky_Effect(currentPlayer, players) { }
function StickySecretions_Effect(currentPlayer, players) { }
function SuperSpreader_Effect(currentPlayer, players) { }
function Teeth_Effect(currentPlayer, players) { }
function Telekinetic_Effect(currentPlayer, players) { }
function Venomous_Effect(currentPlayer, players) { }
function ApexPredator_Effect(currentPlayer, players) { }
function HyperIntelligence_Effect(currentPlayer, players) { }
function Sentience_Effect(currentPlayer, players) { }
function Antlers_Effect(currentPlayer, players) { }
function Bad_Effect(currentPlayer, players) { }
function Brave_Effect(currentPlayer, players) { }
function BruteStrength_Effect(currentPlayer, players) { }
function Endurance_Effect(currentPlayer, players) { }
function Fangs_Effect(currentPlayer, players) { }
function FireSkin_Effect(currentPlayer, players) { }
function HeatVision_Effect(currentPlayer, players) { }
function HotTemper_Effect(currentPlayer, players) { }

function KidneyChefsToque_Effect(currentPlayer, players) { }
function KidneyCombover_Effect(currentPlayer, players) { }
function KidneyElfHat_Effect(currentPlayer, players) { }
function KidneyPartyHat_Effect(currentPlayer, players) { }
function KidneyTiara_Effect(currentPlayer, players) { }
function Quick_Effect(currentPlayer, players) { }
function Reckless_Effect(currentPlayer, players) { }
function RetractableClaws_Effect(currentPlayer, players) { }
function StoneSkin_Effect(currentPlayer, players) { }
function Territorial_Effect(currentPlayer, players) { }
function Voracious_Effect(currentPlayer, players) { }
function WarmBlood_Effect(currentPlayer, players) { }

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
