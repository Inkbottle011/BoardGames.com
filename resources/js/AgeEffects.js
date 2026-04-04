import * as Doomlings from "./Doomlings.js";
import * as Deck from "./Deck.js";
import * as targeting from "./targeting.js"

//================================================
// AUXILIARY FUNCTIONS
//================================================

function discardHandcolor(color, players) {
    for (let i = 0; i < players.length; i++) {
        let idx = players[i].cards.findIndex(c => c.color === color);
        if (idx === -1) continue;
        let card = players[i].cards[idx];
        players[i].cards.splice(idx, 1);
        if (card.card_name !== "Endurance") {
            discardPile.push(card);
        }
    }
}

function discardTraitcolor(color, players) {
    for (let i = 0; i < players.length; i++) {
        let idx = players[i].traitpool.findIndex(c => c.color === color);
        if (idx === -1) continue;
        let card = players[i].traitpool[idx];
        players[i].traitpool.splice(idx, 1);
        if (card.card_name !== "Endurance") {
            discardPile.push(card);
        }
    }
}

function CountColor(color, players) {
    for (let i = 0; i < players.length; i++) {
        for (let k = 0; k < players[i].traitpool.length; k++) {
            if (players[i].traitpool[k].color === color) {
                players[i].points -= 1;
            }
        }
    }
}

//================================================
// COMPLETED AGE EFFECTS
//================================================

function TheBirthofLife_effect(card, currentPlayer, players) { }

function AgeofPeace_effect(card, currentPlayer, players) {
    if (card && card.action) {
        card.action = false;
    }
}

function GlacialDrift_effect(card, currentPlayer, players) {
    // Cannot play cards with value > 3 — enforced by returning early
    if (card && card.points > 3) return;
}

function LunarRetreat_effect(card, currentPlayer, players) {
    // Cannot play purple cards
    if (card && card.color === "Purple") return;
}

function HighTides_effect(card, currentPlayer, players) {
    // Cannot play cards with no text (no effect)
    if (card && card.text == null) return;
}

function NorthernWinds_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        Deck.draw(players[i]);
        let index = chooseCardFromHand(player, prompt = 'Choose a card from your hand');
        discardCard(players[i], index);
    }
}

function AgeofWonder_effect(card, currentPlayer, players) {
    while (currentPlayer.cards.length > 4) {
        let index = chooseCardFromHand(player, prompt = 'Choose a card from your hand');
        discardCard(currentPlayer, index);
    }
    while (currentPlayer.cards.length < 4) {
        Deck.draw(currentPlayer);
    }
}

function GalacticDrift_effect(card, currentPlayer, players) {
    // Cannot play colorless cards
    if (card && card.color === "Colorless") return;
}

function BirthofaHero_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        let idx = players[i].traitpool.findIndex(c => c.card_name === "Heroic");
        if (idx !== -1) {
            let heroic = players[i].traitpool[idx];
            players[i].traitpool.splice(idx, 1);
            players[i].cards.push(heroic);
        }
    }
}

function CoastalFormations_effect(card, currentPlayer, players) {
    Deck.draw(currentPlayer);
}

function Flourish_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        Deck.drawMultiple(players[i], 2);
    }
}

function TectonicShifts_effect(card, currentPlayer, players) {
    // Cannot play green cards
    if (card && card.color === "Green") return;
}

function TropicalLands_effect(card, currentPlayer, players) {
    // Cannot play colorless cards
    if (card && card.color === "Colorless") return;
}

function AgeofDracula_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        let hasVampirism = players[i].traitpool.some(c => c.card_name === "Vampirism");
        if (hasVampirism) {
            let opponents = players.filter(p => p !== players[i]);
            if (opponents.length > 0) {
                StealHandCard(opponents[0], players[i]);
            }
        } else {
            let index = chooseCardFromHand(player, prompt = 'Choose a card from your hand');
            discardCard(players[i], index);
        }
    }
}

function Eclipse_effect(card, currentPlayer, players) {
    // Cannot play red cards
    if (card && card.color === "Red") return;
}

function AridLands_effect(card, currentPlayer, players) {
    // Cannot play blue cards
    if (card && card.color === "Blue") return;
}

function AgeofReason_effect(card, currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
    // Discard 2 cards
    if (currentPlayer.cards.length > 0) {
        let cardOne = currentPlayer.cards.pop();
        if (cardOne.card_name !== "Endurance") discardPile.push(cardOne);
    }
    if (currentPlayer.cards.length > 0) {
        let cardTwo = currentPlayer.cards.pop();
        if (cardTwo.card_name !== "Endurance") discardPile.push(cardTwo);
    }
}

function CometShowers_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].cards.length > 0) {
            let idx = Math.floor(Math.random() * players[i].cards.length);
            let discarded = players[i].cards.splice(idx, 1)[0];
            if (discarded.card_name !== "Endurance") discardPile.push(discarded);
        }
    }
}

function Prosperity_effect(card, currentPlayer, players) {
    // TODO: prompt player to stabilize
    let agree = targeting.chooseYesNo(prompt = "Would you like to stablize?");
    if (agree) {
        Doomlings.stabilize();
    } else {
        return;
    }

}

function AlienTerraform_effect(card, currentPlayer, players) {
    let Dominate = currentPlayer.traitpool.some(c => c.card.Dominant == true);
    let agree = targeting.chooseYesNo(prompt = "Discard Dominant cards and stablize?");
    if (Dominate != null) {
        if (agree) {
            while (Dominate != null) {
                Doomlings.discardCard(currentPlayer, Dominate);
                Dominate = currentPlayer.traitpool.some(c => c.card.Dominant == true);
            }
            Doomlings.stabilize();
        } else {
            return;
        }
    } else {
        return;
    }

    // TODO: prompt player to discard dominant cards and stabilize
}

function AgeofNietzsche_effect(card, currentPlayer, players) {
    let agree = targeting.chooseYesNo(prompt = "Would you like to discard hand and draw 3 instead of stabilizing?");
    if (agree) {
        Doomlings.discardRandomCardMultiple(currentPlayer, currentPlayer.cards.length);
        Deck.drawMultiple(currentPlayer);
    } else {
        Doomlings.stabilize();
    }
    // TODO: prompt player — discard hand and draw 3, or stabilize
}

function Enlightenment_effect(card, currentPlayer, players) {
    let agree = targeting.chooseYesNo(prompt = "Would you like to discard a card?");
    if (agree) {
        let index = targeting.chooseCardFromHand(currentPlayer, prompt = "Choose a card to discard");
        Doomlings.discardCard(currentPlayer, index);
        agree = targeting.chooseYesNo(prompt = "Would you like to discard another card?");
        if (agree) {
            index = targeting.chooseCardFromHand(currentPlayer, prompt = "Choose a card to discard");
            Doomlings.discardCard(currentPlayer, index);
            Doomlings.stabilize();
        } else {
            Doomlings.stabilize();
        }
    } else {
        Doomlings.stabilize();
    }
}
// TODO: prompt player to discard up to 2 cards then stabilize
function CostalFormations_effect(card, currentPlayer, players) {
    Deck.draw(currentPlayer);
}

function NaturalHarmony_effect(card, currentPlayer, players) {
    // TODO: cannot play a color that the last player played
}

function Awakening_effect(card, currentPlayer, players) {
    // TODO: show next age to current player
}

function Reforestation_effect(card, currentPlayer, players) {
    // TODO: traits cannot be swapped, stolen, or discarded
}

function TheMessiah_effect(card, currentPlayer, players) {
    // Rotate turn order backwards by one
    if (GameState.startindex === 0) {
        GameState.startindex = players.length - 1;
    } else {
        GameState.startindex = GameState.startindex - 1;
    }
}

//================================================
// CATASTROPHE EFFECTS
//================================================

function TheBigOne_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        for (let i = 0; i < players.length; i++) {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
            for (let k = 0; k < players[i].traitpool.length; k++) {
                let idx = colors.indexOf(players[i].traitpool[k].color);
                if (idx !== -1) colors.splice(idx, 1);
            }
            players[i].points -= 2 * colors.length;
        }
    } else {
        currentPlayer.size -= 1;
        let opponents = players.filter(p => p !== currentPlayer);
        if (opponents.length > 0) StealHandCard(opponents[0], currentPlayer);
    }
}

function DeusExMachina_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        Deck.draw(currentPlayer);
        if (currentPlayer.cards.length > 0) {
            let drawn = currentPlayer.cards[currentPlayer.cards.length - 1];
            let add = Math.min(drawn.points ?? 0, 5);
            currentPlayer.points += add;
        }
    } else {
        // TODO: stabilize
        Doomlings.stabilize();
    }
}

function Overpopulation_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        let smallest = players[0].traitpool.length;
        let idx = 0;
        for (let i = 1; i < players.length; i++) {
            if (players[i].traitpool.length < smallest) {
                smallest = players[i].traitpool.length;
                idx = i;
            }
        }
        players[idx].points += 4;
    } else {
        currentPlayer.size += 1;
        for (let i = 0; i < players.length; i++) {
            let colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
            for (let k = 0; k < players[i].traitpool.length; k++) {
                let cidx = colors.indexOf(players[i].traitpool[k].color);
                if (cidx !== -1) colors.splice(cidx, 1);
            }
            Deck.drawMultiple(players[i], colors.length);
        }
    }
}

function GlacialMeltdown_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Blue", players);
    } else {
        currentPlayer.size -= 1;
        if (currentPlayer.cards.length > 0) {
            let idx = Math.floor(Math.random() * currentPlayer.cards.length);
            let discarded = currentPlayer.cards.splice(idx, 1)[0];
            if (discarded.card_name !== "Endurance") discardPile.push(discarded);
        }
        if (currentPlayer.cards.length > 0) {
            let idx = Math.floor(Math.random() * currentPlayer.cards.length);
            let discarded = currentPlayer.cards.splice(idx, 1)[0];
            if (discarded.card_name !== "Endurance") discardPile.push(discarded);
        }
    }
}

function IceAge_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardHandcolor("Red", players);
    } else {
        for (let k = 0; k < currentPlayer.traitpool.length; k++) {
            if (currentPlayer.traitpool[k].color === "Red") {
                currentPlayer.points -= 1;
            }
        }
    }
}

function MegaTsunami_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Red", players);
    } else {
        // Rotate all hands forward by one player
        if (players.length > 1) {
            let firstHand = players[0].cards;
            for (let i = 0; i < players.length - 1; i++) {
                players[i].cards = players[i + 1].cards;
            }
            players[players.length - 1].cards = firstHand;
        }
    }
}

function TheFourHorsemen_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        for (let i = 0; i < players.length; i++) {
            let idx = players[i].traitpool.findIndex(c => c.points >= 4);
            if (idx !== -1) {
                let discarded = players[i].traitpool.splice(idx, 1)[0];
                if (discarded.card_name !== "Endurance") discardPile.push(discarded);
            }
        }
    } else {
        currentPlayer.size -= 1;
        let index = targeting.chooseCardFromHand(currentPlayer, prompt = "Choose a card to discard");
        discardTrait(currentPlayer, index);
    }
}

function GreyGoo_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        let largest = players[0].traitpool.length;
        let idx = 0;
        for (let i = 1; i < players.length; i++) {
            if (players[i].traitpool.length > largest) {
                largest = players[i].traitpool.length;
                idx = i;
            }
        }
        players[idx].points -= 5;
    } else {
        let index = targeting.chooseCardFromHand(currentPlayer, prompt = "Choose a card to discard");
        discardCardMultiple(currentPlayer, currentPlayer.cards.length, index);
    }
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
        let index = targeting.chooseCardFromHand(currentPlayer, prompt = "Choose a card to discard");
        discardCard(currentPlayer, index);
    }
}

function SolarFlare_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Colorless", players);
    } else {
        currentPlayer.size -= 1;
        let index = targeting.chooseCardFromHand(currentPlayer, prompt = "Choose a card to discard");
        discardCardMultiple(currentPlayer, Math.round(currentPlayer.cards.length / 2), index);
    }
}

function AITakeover_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        // TODO: remove colorless effects and set colorless card values to 2
    } else {
        currentPlayer.size -= 1;
    }
}

//================================================
// EXPORTS
//================================================

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