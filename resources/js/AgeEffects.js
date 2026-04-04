import { resolveCard, GameState, StealHandCard, discardCard, discardCardMultiple, discardTrait, discardPile, isWorldsEnd } from "./Doomlings.js";
import * as Deck from "./Deck.js";

//================================================
// AUXILIARY FUNCTIONS
//================================================

/**
 * discardHandcolor — discard all hand cards of a given color for all players.
 * Fixed: was iterating players[i].hand but reading players[i].cards.
 */
function discardHandcolor(color, players) {
    for (let i = 0; i < players.length; i++) {
        // Iterate backwards so splices don't shift unprocessed indices
        for (let k = players[i].cards.length - 1; k >= 0; k--) {
            if (players[i].cards[k].color === color) {
                discardCard(players[i], k);
            }
        }
    }
}

/**
 * discardTraitcolor — discard one trait of a given color per player.
 */
function discardTraitcolor(color, players) {
    for (let i = 0; i < players.length; i++) {
        const idx = players[i].traitpool.findIndex(c => c.color === color);
        if (idx === -1) continue;
        const card = players[i].traitpool[idx];
        players[i].traitpool.splice(idx, 1);
        if (card.card_name !== "Endurance") {
            discardPile.push(card);
        }
    }
}

/**
 * CountColor — subtract 1 point per trait of given color from each player.
 */
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
    // Card effects are suppressed — handled by shouldSkipCardEffect in AgeRules.js
}

function GlacialDrift_effect(card, currentPlayer, players) {
    // Cannot play cards with value > 3 — enforced by checkAgeRestriction in AgeRules.js
}

function LunarRetreat_effect(card, currentPlayer, players) {
    // Cannot play purple cards — enforced by checkAgeRestriction
}

function HighTides_effect(card, currentPlayer, players) {
    // Bonus play for effectless traits — enforced/handled in AgeRules.js
}

function NorthernWinds_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        Deck.draw(players[i]);
        discardCard(players[i], 0);
    }
}

function AgeofWonder_effect(card, currentPlayer, players) {
    // Hand size locked to 4 — handled by getAgeHandSize in AgeRules.js
    while (currentPlayer.cards.length > 4) {
        discardCard(currentPlayer, 0);
    }
    while (currentPlayer.cards.length < 4) {
        Deck.draw(currentPlayer);
    }
}

function GalacticDrift_effect(card, currentPlayer, players) {
    // Cannot play colorless cards — enforced by checkAgeRestriction
}

function BirthofaHero_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        const idx = players[i].traitpool.findIndex(c => c.card_name === "Heroic");
        if (idx !== -1) {
            const heroic = players[i].traitpool[idx];
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
    // Cannot play green cards — enforced by checkAgeRestriction
}

function TropicalLands_effect(card, currentPlayer, players) {
    // Cannot play colorless cards — enforced by checkAgeRestriction
}

function AgeofDracula_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        const hasVampirism = players[i].traitpool.some(c => c.card_name === "Vampirism");
        if (hasVampirism) {
            const opponents = players.filter(p => p !== players[i]);
            if (opponents.length > 0) {
                StealHandCard(opponents[0], players[i]);
            }
        } else {
            discardCard(players[i], 0);
        }
    }
}

function Eclipse_effect(card, currentPlayer, players) {
    // Cannot play red cards — enforced by checkAgeRestriction
}

function AridLands_effect(card, currentPlayer, players) {
    // Cannot play blue cards — enforced by checkAgeRestriction
}

function AgeofReason_effect(card, currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
    // Discard 2 — use discardCard to respect Endurance/Regenerative Tissue
    if (currentPlayer.cards.length > 0) discardCard(currentPlayer, currentPlayer.cards.length - 1);
    if (currentPlayer.cards.length > 0) discardCard(currentPlayer, currentPlayer.cards.length - 1);
}

function CometShowers_effect(card, currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].cards.length > 0) {
            const idx = Math.floor(Math.random() * players[i].cards.length);
            discardCard(players[i], idx);
        }
    }
}

function Prosperity_effect(card, currentPlayer, players) {
    // Interactive — broadcast via AgeEffectRequired, handled in doom.jsx
}

function AlienTerraform_effect(card, currentPlayer, players) {
    // Interactive — broadcast via AgeEffectRequired
}

function AgeofNietzsche_effect(card, currentPlayer, players) {
    // Interactive — broadcast via AgeEffectRequired
}

function Enlightenment_effect(card, currentPlayer, players) {
    // Interactive — broadcast via AgeEffectRequired
}

function NaturalHarmony_effect(card, currentPlayer, players) {
    // Restriction tracked via _lastPlayedColor in AgeRules.js / applyPerCardAgeEffect
}

function Awakening_effect(card, currentPlayer, players) {
    // TODO: show next age to current player — broadcast via AgeEffectRequired
}

function Reforestation_effect(card, currentPlayer, players) {
    // Restrictions on stealing/swapping/discarding — enforced by shouldSkipCardEffect in AgeRules.js
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
            const colors = new Set(["Green", "Blue", "Red", "Purple", "Colorless"]);
            for (let k = 0; k < players[i].traitpool.length; k++) {
                colors.delete(players[i].traitpool[k].color);
            }
            players[i].points -= 2 * colors.size;
        }
    } else {
        currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
        currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
        const opponents = players.filter(p => p !== currentPlayer);
        if (opponents.length > 0) StealHandCard(opponents[0], currentPlayer);
    }
}

function DeusExMachina_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        Deck.draw(currentPlayer);
        if (currentPlayer.cards.length > 0) {
            const drawn = currentPlayer.cards[currentPlayer.cards.length - 1];
            const add = Math.min(drawn.points ?? 0, 5);
            currentPlayer.points += add;
        }
    } else {
        // TODO: prompt stabilize
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
        currentPlayer.size = (currentPlayer.size ?? 5) + 1;
        currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
        for (let i = 0; i < players.length; i++) {
            const colors = new Set(["Green", "Blue", "Red", "Purple", "Colorless"]);
            for (let k = 0; k < players[i].traitpool.length; k++) {
                colors.delete(players[i].traitpool[k].color);
            }
            Deck.drawMultiple(players[i], colors.size);
        }
    }
}

function GlacialMeltdown_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Blue", players);
    } else {
        currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
        currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
        // Discard 2 random hand cards
        if (currentPlayer.cards.length > 0) {
            discardCard(currentPlayer, Math.floor(Math.random() * currentPlayer.cards.length));
        }
        if (currentPlayer.cards.length > 0) {
            discardCard(currentPlayer, Math.floor(Math.random() * currentPlayer.cards.length));
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
            const firstHand = players[0].cards;
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
            const idx = players[i].traitpool.findIndex(c => c.points >= 4);
            if (idx !== -1) {
                discardTrait(players[i], idx);
            }
        }
    } else {
        currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
        currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
        if (currentPlayer.traitpool.length > 0) discardTrait(currentPlayer, 0);
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
        discardCardMultiple(currentPlayer, currentPlayer.cards.length, 0);
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
        currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
        currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
        discardCard(currentPlayer, 0);
    }
}

function SolarFlare_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        discardTraitcolor("Colorless", players);
    } else {
        currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
        currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
        discardCardMultiple(currentPlayer, Math.round(currentPlayer.cards.length / 2), 0);
    }
}

function AITakeover_effect(card, currentPlayer, players) {
    if (isWorldsEnd) {
        // TODO: remove colorless effects and set colorless card values to 2
    } else {
        currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
        currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
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