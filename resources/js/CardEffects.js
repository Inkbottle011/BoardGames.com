import { resolveCard, GameState, triggerWorldsEnd, isWorldsEnd, play, discardCard, discardCardMultiple, discardColor, discardTrait, discardPile } from "./Doomlings.js";
import * as Deck from "./Deck.js";
import {
    chooseOpponent,
    chooseColor,
    chooseCardFromHand,
    chooseCardFromTraitPool,
    chooseCardFromDiscard,
    chooseYesNo,
    chooseUpToN,
    chooseAge,
} from "./targeting.js";

//================================================
// HELPERS
//================================================

/**
 * colorcounter — at world's end, +1 point on card per trait of given color.
 * card must be passed explicitly (no this.card).
 */
function colorcounter(color, currentPlayer, card) {
    if (isWorldsEnd) {
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].color === color) {
                card.points += 1;
            }
        }
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            for (let i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].color === color) {
                    card.points += 1;
                }
            }
        });
    }
}

/**
 * value_equal_size — at world's end, card points = genepool size.
 */
function value_equal_size(currentPlayer, card) {
    if (isWorldsEnd) {
        card.points += currentPlayer.genepool ?? currentPlayer.size ?? 5;
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            card.points += currentPlayer.genepool ?? currentPlayer.size ?? 5;
        });
    }
}

//================================================
// CARD EFFECTS
// - All chooseOpponent calls are async; those effects are marked async.
// - card is passed as third param where needed for world's end scoring.
// - currentPlayer.points (not bare `points`) for all scoring.
// - currentPlayer.worldsEndEffects (not bare `player`) for all WE pushes.
//================================================

function Imunity_Effect(currentPlayer, players, card) {
    if (isWorldsEnd) {
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].points < 0) {
                card.points += 2;
            }
        }
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            for (let i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].points < 0) {
                    card.points += 2;
                }
            }
        });
    }
}

function Tiny_Effect(currentPlayer, players, card) {
    if (isWorldsEnd) {
        card.points -= currentPlayer.traitpool.length;
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            card.points -= currentPlayer.traitpool.length;
        });
    }
}

function ColdBlood_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
    // Player picks one of the 3 newly drawn cards to play immediately
    const newCardStart = currentPlayer.cards.length - 3;
    const index = chooseCardFromHand(currentPlayer, 'Choose one of the drawn cards to play');
    if (index < newCardStart || index >= currentPlayer.cards.length) return;
    const card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    resolveCard(card, currentPlayer, players);
}

function CostlySignaling_Effect(currentPlayer, players) {
    // Requires server round-trip to take back last card — not implementable client-side; stub
}

function EggClusters_Effect(currentPlayer, players, card) {
    colorcounter("Blue", currentPlayer, card);
}

async function Flight_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const tempCards = currentPlayer.cards;
    currentPlayer.cards = opponent.cards;
    opponent.cards = tempCards;
}

function IridescentScales_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 3);
}

function PaintedShell_Effect(currentPlayer, players) {
    const index = chooseCardFromTraitPool(currentPlayer, 'Choose a trait to activate its effect');
    if (index < 0 || index >= currentPlayer.traitpool.length) return;
    const trait = currentPlayer.traitpool[index];
    if (trait.action) {
        resolveCard(trait, currentPlayer, players);
    }
}

function Saliva_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
}

async function Scutes_Effect(currentPlayer, players) {
    const index = chooseCardFromTraitPool(currentPlayer, 'Choose a trait to give to an opponent');
    if (index < 0 || index >= currentPlayer.traitpool.length) return;
    const card = currentPlayer.traitpool[index];
    currentPlayer.traitpool.splice(index, 1);
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) { currentPlayer.traitpool.push(card); return; }
    opponent.traitpool.push(card);
}

function SelectiveMemory_Effect(currentPlayer, players) {
    const index = chooseCardFromDiscard(discardPile, 'Choose a card from the discard pile');
    if (index < 0 || index >= discardPile.length) return;
    const card = discardPile[index];
    discardPile.splice(index, 1);
    currentPlayer.traitpool.push(card);
    resolveCard(card, currentPlayer, players);
}

function Sweat_Effect(currentPlayer, players) {
    const index = chooseCardFromHand(currentPlayer, 'Choose a card to discard');
    if (index < 0 || index >= currentPlayer.cards.length) return;
    discardCard(currentPlayer, index);
}

function Fecundity_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
}

function Fortunate_Effect(currentPlayer, players, card) {
    if (isWorldsEnd) {
        card.points += currentPlayer.cards.length;
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            card.points += currentPlayer.cards.length;
        });
    }
}

function Overgrowth_Effect(currentPlayer, players, card) {
    colorcounter("Green", currentPlayer, card);
}

function Photosynthesis_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 2);
    const len = currentPlayer.cards.length;
    const drawnOne = currentPlayer.cards[len - 1];
    const drawnTwo = currentPlayer.cards[len - 2];
    if (drawnOne?.color === "Green" || drawnTwo?.color === "Green") {
        const index = chooseCardFromHand(currentPlayer, 'Choose a card to play immediately');
        if (index < 0 || index >= currentPlayer.cards.length) return;
        const card = currentPlayer.cards[index];
        currentPlayer.cards.splice(index, 1);
        currentPlayer.traitpool.push(card);
        resolveCard(card, currentPlayer, players);
    }
}

function Propagation_Effect(currentPlayer, players) {
    const index = chooseCardFromHand(currentPlayer, 'Choose a card to play');
    if (index < 0 || index >= currentPlayer.cards.length) return;
    play(index, currentPlayer);
}

function Pollination_Effect(currentPlayer, players, card) {
    if (isWorldsEnd) {
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].points === 1) {
                card.points += 1;
            }
        }
    } else {
        currentPlayer.worldsEndEffects.push(() => {
            for (let i = 0; i < currentPlayer.traitpool.length; i++) {
                if (currentPlayer.traitpool[i].points === 1) {
                    card.points += 1;
                }
            }
        });
    }
}

function RandomFertilization_Effect(currentPlayer, players, card) {
    value_equal_size(currentPlayer, card);
}

function SelfReplicating_Effect(currentPlayer, players) {
    const index = chooseCardFromDiscard(discardPile, 'Choose a card from discard pile');
    if (index < 0 || index >= discardPile.length) return;
    const card = discardPile[index];
    discardPile.splice(index, 1);
    currentPlayer.traitpool.push(card);
    if (!card.action) {
        resolveCard(card, currentPlayer, players);
    }
}

function Kidney_Effect(currentPlayer, players, card) {
    const score = () => {
        const count = currentPlayer.traitpool.filter(c => c.card_name.startsWith("Kidney")).length;
        currentPlayer.points += count;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function Swarm_Effect(currentPlayer, players, card) {
    const score = () => {
        let count = 0;
        for (let k = 0; k < players.length; k++) {
            for (let i = 0; i < players[k].traitpool.length; i++) {
                if (players[k].traitpool[i].card_name.startsWith("Swarm")) count++;
            }
        }
        currentPlayer.points += count;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function Trunk_Effect(currentPlayer, players) {
    if (discardPile.length === 0) return;
    const card = discardPile.pop();
    currentPlayer.traitpool.push(card);
    if (!card.action) {
        resolveCard(card, currentPlayer, players);
    }
}

function Altruistic_Effect(currentPlayer, players, card) {
    value_equal_size(currentPlayer, card);
}

function Boredom_Effect(currentPlayer, players, card) {
    const score = () => {
        let count = 0;
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].text) count++;
        }
        card.points += count;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function Introspective_Effect(currentPlayer, players) {
    Deck.drawMultiple(currentPlayer, 4);
}

async function Doting_Effect(currentPlayer, players) {
    const index = chooseCardFromHand(currentPlayer, 'Choose a card from your hand to give');
    if (index < 0 || index >= currentPlayer.cards.length) return;
    const card = currentPlayer.cards[index];
    currentPlayer.cards.splice(index, 1);
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) { currentPlayer.cards.push(card); return; }
    opponent.cards.push(card);
}

function Eloquence_Effect(currentPlayer, players, card) {
    const doEffect = () => {
        const index = chooseCardFromHand(currentPlayer, 'Choose a card to play for free');
        if (index < 0 || index >= currentPlayer.cards.length) return;
        const chosen = currentPlayer.cards[index];
        currentPlayer.cards.splice(index, 1);
        if (!chosen.action) {
            resolveCard(chosen, currentPlayer, players);
        }
    };
    if (isWorldsEnd) {
        doEffect();
    } else {
        currentPlayer.worldsEndEffects.push(doEffect);
    }
}

function Gratitude_Effect(currentPlayer, players, card) {
    const score = () => {
        const seen = new Set();
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            seen.add(currentPlayer.traitpool[i].color);
        }
        currentPlayer.points += seen.size;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function Just_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
}

function Mitochondrion_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
}

function Mindful_Effect(currentPlayer, players, card) {
    colorcounter("Colorless", currentPlayer, card);
}

function Saudade_Effect(currentPlayer, players, card) {
    const score = () => {
        const seen = new Set();
        for (let i = 0; i < currentPlayer.cards.length; i++) {
            seen.add(currentPlayer.cards[i].color);
        }
        currentPlayer.points += seen.size;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function Camouflage_Effect(currentPlayer, players, card) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
    value_equal_size(currentPlayer, card);
}

async function Vampirism_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const index = chooseCardFromTraitPool(opponent, 'Choose a trait to steal from opponent');
    if (index < 0 || index >= opponent.traitpool.length) return;
    const card = opponent.traitpool[index];
    opponent.traitpool.splice(index, 1);
    currentPlayer.traitpool.push(card);
    resolveCard(card, currentPlayer, players);
}

function Viral_Effect(currentPlayer, players, card) {
    const doEffect = () => {
        const colorIndex = chooseColor();
        const colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
        if (colorIndex < 0 || colorIndex >= colors.length) return;
        const color = colors[colorIndex];
        for (let i = 0; i < players.length; i++) {
            for (let k = 0; k < players[i].traitpool.length; k++) {
                if (players[i].traitpool[k].color === color) {
                    players[i].points -= 1;
                }
            }
        }
    };
    if (isWorldsEnd) {
        doEffect();
    } else {
        currentPlayer.worldsEndEffects.push(doEffect);
    }
}

async function DirectlyRegister_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const index = chooseCardFromTraitPool(opponent, 'Choose a 1-point trait to steal');
    if (index < 0 || index >= opponent.traitpool.length) return;
    if (opponent.traitpool[index].points !== 1) return;
    const card = opponent.traitpool[index];
    opponent.traitpool.splice(index, 1);
    currentPlayer.cards.push(card);
}

function Dreamer_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
}

async function Impatience_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent || opponent.cards.length === 0) return;
    for (let i = 0; i < 2; i++) {
        if (opponent.cards.length === 0) break;
        const randomIndex = Math.floor(Math.random() * opponent.cards.length);
        const card = opponent.cards[randomIndex];
        opponent.cards.splice(randomIndex, 1);
        currentPlayer.cards.push(card);
    }
}

async function Inventive_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const index = chooseCardFromTraitPool(opponent, 'Choose a trait to copy the effect of');
    if (index < 0 || index >= opponent.traitpool.length) return;
    const card = opponent.traitpool[index];
    resolveCard(card, currentPlayer, players);
}

async function Memory_Effect(currentPlayer, players) {
    const yes = await chooseYesNo('Would you like to discard your hand and draw a new one?');
    if (yes) {
        const size = currentPlayer.genepool ?? currentPlayer.size ?? 5;
        discardCardMultiple(currentPlayer, currentPlayer.cards.length, 0);
        Deck.drawMultiple(currentPlayer, size);
    }
}

function StickySecretions_Effect(currentPlayer, players, card) {
    colorcounter("Purple", currentPlayer, card);
}

function SuperSpreader_Effect(currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        players[i].size = Math.max(1, (players[i].size ?? 5) - 1);
        players[i].genepool = Math.max(1, (players[i].genepool ?? 5) - 1);
    }
}

async function Nosy_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent || opponent.cards.length < 2) return;

    let r1 = Math.floor(Math.random() * opponent.cards.length);
    let r2;
    do { r2 = Math.floor(Math.random() * opponent.cards.length); } while (r2 === r1);

    // Show 2 revealed cards as a fake hand for targeting
    const fakeHand = { cards: [opponent.cards[r1], opponent.cards[r2]] };
    const pick = chooseCardFromHand(fakeHand, 'Choose a card from the revealed cards');
    if (pick < 0 || pick > 1) return;

    const realIndex = pick === 0 ? r1 : r2;
    const card = opponent.cards[realIndex];
    opponent.cards.splice(realIndex, 1);
    currentPlayer.traitpool.push(card);
    resolveCard(card, currentPlayer, players);
}

function Persuasive_Effect(currentPlayer, players) {
    const colorIndex = chooseColor();
    const colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
    if (colorIndex < 0 || colorIndex >= colors.length) return;
    const color = colors[colorIndex];

    for (let i = 0; i < players.length; i++) {
        for (let k = players[i].cards.length - 1; k >= 0; k--) {
            if (players[i].cards[k].color === color) {
                discardCard(players[i], k);
            }
        }
    }
}

async function Poisonous_Effect(currentPlayer, players, card) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const index = chooseCardFromTraitPool(opponent, 'Choose a trait from opponent to swap with Poisonous');
    if (index < 0 || index >= opponent.traitpool.length) return;
    const theirCard = opponent.traitpool[index];
    opponent.traitpool.splice(index, 1);
    // Poisonous moves to opponent; their trait comes here
    const myIdx = currentPlayer.traitpool.lastIndexOf(card);
    if (myIdx !== -1) currentPlayer.traitpool.splice(myIdx, 1);
    opponent.traitpool.push(card);
    currentPlayer.traitpool.push(theirCard);
}

function Teeth_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 1;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 1;
}

function ApexPredator_Effect(currentPlayer, players, card) {
    const score = () => {
        const mostTraits = players.every(p => currentPlayer.traitpool.length >= p.traitpool.length);
        if (mostTraits) currentPlayer.points += 4;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

async function Bad_Effect(currentPlayer, players) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].cards.length === 0) continue;
        const index = chooseCardFromHand(players[i], `${players[i].name ?? 'Player'}: choose a card to discard (2 will be discarded)`);
        discardCardMultiple(players[i], 2, index);
    }
}

function Brave_Effect(currentPlayer, players, card) {
    const score = () => {
        let count = 0;
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].dominant) count++;
        }
        card.points += count * 2;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function BruteStrength_Effect(currentPlayer, players) {
    currentPlayer.size = Math.max(1, (currentPlayer.size ?? 5) - 1);
    currentPlayer.genepool = Math.max(1, (currentPlayer.genepool ?? 5) - 1);
}

function HeatVision_Effect(currentPlayer, players, card) {
    colorcounter("Red", currentPlayer, card);
}

function HotTemper_Effect(currentPlayer, players) {
    const index = chooseCardFromHand(currentPlayer, 'Choose a card to start discarding from');
    discardCardMultiple(currentPlayer, 2, index);
}

async function Reckless_Effect(currentPlayer, players) {
    const myIndex = chooseCardFromTraitPool(currentPlayer, 'Choose one of your traits to discard');
    discardTrait(currentPlayer, myIndex);
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const theirIndex = chooseCardFromTraitPool(opponent, "Choose one of opponent's traits to discard");
    discardTrait(opponent, theirIndex);
}

function WarmBlood_Effect(currentPlayer, players) {
    currentPlayer.size = (currentPlayer.size ?? 5) + 2;
    currentPlayer.genepool = (currentPlayer.genepool ?? 5) + 2;
}

function Voracious_Effect(currentPlayer, players) {
    const traitIndex = chooseCardFromTraitPool(currentPlayer, 'Choose a trait to discard');
    discardTrait(currentPlayer, traitIndex);
    const handIndex = chooseCardFromHand(currentPlayer, 'Choose a card from hand to play immediately');
    if (handIndex < 0 || handIndex >= currentPlayer.cards.length) return;
    const card = currentPlayer.cards[handIndex];
    currentPlayer.cards.splice(handIndex, 1);
    resolveCard(card, currentPlayer, players);
}

async function Tentacles_Effect(currentPlayer, players) {
    const myIndex = chooseCardFromTraitPool(currentPlayer, 'Choose one of your traits to swap');
    if (myIndex < 0 || myIndex >= currentPlayer.traitpool.length) return;
    const myCard = currentPlayer.traitpool[myIndex];
    currentPlayer.traitpool.splice(myIndex, 1);

    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) { currentPlayer.traitpool.push(myCard); return; }

    const sameColor = opponent.traitpool.filter(c => c.color === myCard.color);
    if (sameColor.length === 0) {
        currentPlayer.traitpool.push(myCard);
        return;
    }

    let theirIndex = chooseCardFromTraitPool(opponent, `Choose a ${myCard.color} trait to swap`);
    let attempts = 0;
    while (
        theirIndex >= 0 &&
        theirIndex < opponent.traitpool.length &&
        opponent.traitpool[theirIndex].color !== myCard.color &&
        attempts++ < 10
    ) {
        theirIndex = chooseCardFromTraitPool(opponent, `Must choose a ${myCard.color} trait`);
    }

    if (theirIndex < 0 || theirIndex >= opponent.traitpool.length ||
        opponent.traitpool[theirIndex].color !== myCard.color) {
        currentPlayer.traitpool.push(myCard);
        return;
    }

    const theirCard = opponent.traitpool[theirIndex];
    opponent.traitpool.splice(theirIndex, 1);
    currentPlayer.traitpool.push(theirCard);
    opponent.traitpool.push(myCard);
}

async function Telekinetic_Effect(currentPlayer, players) {
    const myIndex = chooseCardFromTraitPool(currentPlayer, 'Choose one of your traits to swap');
    if (myIndex < 0 || myIndex >= currentPlayer.traitpool.length) return;
    const myCard = currentPlayer.traitpool[myIndex];
    currentPlayer.traitpool.splice(myIndex, 1);

    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) { currentPlayer.traitpool.push(myCard); return; }

    // Must pick a trait of a DIFFERENT color
    const diffColor = opponent.traitpool.filter(c => c.color !== myCard.color);
    if (diffColor.length === 0) {
        currentPlayer.traitpool.push(myCard);
        return;
    }

    let theirIndex = chooseCardFromTraitPool(opponent, 'Choose a trait of a different color to swap');
    let attempts = 0;
    while (
        theirIndex >= 0 &&
        theirIndex < opponent.traitpool.length &&
        opponent.traitpool[theirIndex].color === myCard.color &&
        attempts++ < 10
    ) {
        theirIndex = chooseCardFromTraitPool(opponent, 'Must choose a different color');
    }

    if (theirIndex < 0 || theirIndex >= opponent.traitpool.length ||
        opponent.traitpool[theirIndex].color === myCard.color) {
        currentPlayer.traitpool.push(myCard);
        return;
    }

    const theirCard = opponent.traitpool[theirIndex];
    opponent.traitpool.splice(theirIndex, 1);
    currentPlayer.traitpool.push(theirCard);
    opponent.traitpool.push(myCard);
}

function Faith_Effect(currentPlayer, players) {
    const doFaith = () => {
        const colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
        const fromIndex = chooseColor();
        if (fromIndex < 0 || fromIndex >= colors.length) return;
        const fromColor = colors[fromIndex];
        const remaining = colors.filter((_, i) => i !== fromIndex);
        const toIndex = chooseColor();
        if (toIndex < 0 || toIndex >= remaining.length) return;
        const toColor = remaining[toIndex];
        for (let i = 0; i < currentPlayer.traitpool.length; i++) {
            if (currentPlayer.traitpool[i].color === fromColor) {
                currentPlayer.traitpool[i].color = toColor;
            }
        }
    };
    if (isWorldsEnd) {
        doFaith();
    } else {
        currentPlayer.worldsEndEffects.push(doFaith);
    }
}

async function Selfish_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const redTraits = opponent.traitpool.filter(c => c.color === "Red");
    if (redTraits.length === 0) return;
    const card = redTraits[Math.floor(Math.random() * redTraits.length)];
    const realIndex = opponent.traitpool.indexOf(card);
    opponent.traitpool.splice(realIndex, 1);
    currentPlayer.traitpool.push(card);
}

function Symbiosis_Effect(currentPlayer, players, card) {
    const score = () => {
        const count = { Green: 0, Blue: 0, Red: 0, Purple: 0, Colorless: 0 };
        for (let k = 0; k < currentPlayer.traitpool.length; k++) {
            const color = currentPlayer.traitpool[k].color;
            if (color in count) count[color]++;
        }
        const maxCount = Math.max(...Object.values(count));
        currentPlayer.points += maxCount;
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

async function TinyLittleMelons_Effect(currentPlayer, players) {
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const greenTraits = opponent.traitpool.filter(c => c.color === "Green");
    if (greenTraits.length === 0) return;
    const card = greenTraits[Math.floor(Math.random() * greenTraits.length)];
    const realIndex = opponent.traitpool.indexOf(card);
    opponent.traitpool.splice(realIndex, 1);
    currentPlayer.traitpool.push(card);
}

function PackBehavior_Effect(currentPlayer, players, card) {
    const score = () => {
        const count = { Green: 0, Blue: 0, Red: 0, Purple: 0, Colorless: 0 };
        for (let k = 0; k < currentPlayer.traitpool.length; k++) {
            const color = currentPlayer.traitpool[k].color;
            if (color in count) count[color]++;
        }
        for (const c of Object.values(count)) {
            currentPlayer.points += Math.floor(c / 2);
        }
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

function Branches_Effect(currentPlayer, players, card) {
    const score = () => {
        let count = 0;
        for (let k = 0; k < currentPlayer.traitpool.length; k++) {
            if (currentPlayer.traitpool[k].color === "Green") count++;
        }
        currentPlayer.points += Math.floor(count / 2);
    };
    if (isWorldsEnd) {
        score();
    } else {
        currentPlayer.worldsEndEffects.push(score);
    }
}

async function SelfAwareness_Effect(currentPlayer, players, card) {
    // Play into an opponent's trait pile instead of your own
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const myIdx = currentPlayer.traitpool.lastIndexOf(card);
    if (myIdx !== -1) currentPlayer.traitpool.splice(myIdx, 1);
    opponent.traitpool.push(card);
}

function HyperIntelligence_Effect(currentPlayer, players) {
    const colorIndex = chooseColor();
    const colors = ["Green", "Blue", "Red", "Purple", "Colorless"];
    if (colorIndex < 0 || colorIndex >= colors.length) return;
    const color = colors[colorIndex];
    for (let i = 0; i < players.length; i++) {
        discardColor(players[i], color, 0);
    }
}

function Territorial_Effect(currentPlayer, players) {
    const opponents = players.filter(p => p !== currentPlayer);
    for (let i = 0; i < opponents.length; i++) {
        discardColor(opponents[i], "Red", 0);
    }
}

async function Venomous_Effect(currentPlayer, players, card) {
    const index = chooseCardFromHand(currentPlayer, 'Choose a card to play');
    if (index >= 0 && index < currentPlayer.cards.length) {
        play(index, currentPlayer);
    }
    const opponent = await chooseOpponent(currentPlayer, players);
    if (!opponent) return;
    const myIdx = currentPlayer.traitpool.lastIndexOf(card);
    if (myIdx !== -1) currentPlayer.traitpool.splice(myIdx, 1);
    opponent.traitpool.push(card);
}

function OptimisticNihilism_Effect(currentPlayer, players) {
    // Skip to next non-catastrophe age (server handles age deck; increment count client-side)
    GameState.catastropheCount += 1;
    const index = chooseCardFromHand(currentPlayer, 'Choose a card to play');
    if (index >= 0 && index < currentPlayer.cards.length) {
        play(index, currentPlayer);
    }
}

// ================================================
// NO-OP / STUB EFFECTS
// ================================================

function Late_Effect(currentPlayer, players) { return null; }       // handled in stabilize()
function Heroic_Effect(currentPlayer, players) { return null; }     // restricted in play()
function Delicious_Effect(currentPlayer, players) { return null; }  // restricted

function RegenerativeTissue_Effect(currentPlayer, players) { }  // handled in discardCard()
function Endurance_Effect(currentPlayer, players) { }           // handled in discardCard()
function Echolocation_Effect(currentPlayer, players) { }        // handled in play()
function Blubber_Effect(currentPlayer, players) { }
function Gills_Effect(currentPlayer, players) { }
function Migratory_Effect(currentPlayer, players) { }
function Spiny_Effect(currentPlayer, players) { }
function Apealing_Effect(currentPlayer, players) { }
function Bark_Effect(currentPlayer, players) { }
function DeepRoots_Effect(currentPlayer, players) { }
function Leaves_Effect(currentPlayer, players) { }
function WoodyStems_Effect(currentPlayer, players) { }
function Confusion_Effect(currentPlayer, players) { }
function Fear_Effect(currentPlayer, players) { }
function Flatulence_Effect(currentPlayer, players) { }
function Adorable_Effect(currentPlayer, players) { }
function BigEars_Effect(currentPlayer, players) { }
function FineMotorSkills_Effect(currentPlayer, players) { }
function Nocturnal_Effect(currentPlayer, players) { }
function Antlers_Effect(currentPlayer, players) { }
function Fangs_Effect(currentPlayer, players) { }
function FireSkin_Effect(currentPlayer, players) { }
function StoneSkin_Effect(currentPlayer, players) { }
function Quick_Effect(currentPlayer, players) { }
function Denial_Effect(currentPlayer, players) { }        // TODO: ignore next catastrophe
function RetractableClaws_Effect(currentPlayer, players) { return null; }
function Morality_Effect(currentPlayer, players) { return null; }
function Automimicry_Effect(currentPlayer, players) { }   // reactive — handled in onCardPlayed
function Chromatophores_Effect(currentPlayer, players) { } // reactive — handled in onCardPlayed
function Sentience_Effect() { }
function Clever_Effect(currentPlayer, players) { }        // TODO: opponents reveal a card
function Parasitic_Effect(currentPlayer, players) { }     // TODO: reactive steal
function Sneaky_Effect(currentPlayer, players) { }        // TODO: world's end play free
function Prepper_Effect(currentPlayer, players) { }       // age deck managed server-side
function TheThirdEye_Effect(currentPlayer, players) { }   // handled via AgeEffectRequired broadcast

// ================================================
// KIDNEY / SWARM VARIANTS
// ================================================

function KidneyChefsToque_Effect(currentPlayer, players, card) { Kidney_Effect(currentPlayer, players, card); }
function KidneyCombover_Effect(currentPlayer, players, card) { Kidney_Effect(currentPlayer, players, card); }
function KidneyElfHat_Effect(currentPlayer, players, card) { Kidney_Effect(currentPlayer, players, card); }
function KidneyPartyHat_Effect(currentPlayer, players, card) { Kidney_Effect(currentPlayer, players, card); }
function KidneyTiara_Effect(currentPlayer, players, card) { Kidney_Effect(currentPlayer, players, card); }
function KidneyBeerHelm_Effect(currentPlayer, players, card) { Kidney_Effect(currentPlayer, players, card); }

function SwarmHorns_Effect(currentPlayer, players, card) { Swarm_Effect(currentPlayer, players, card); }
function SwarmMindless_Effect(currentPlayer, players, card) { Swarm_Effect(currentPlayer, players, card); }
function SwarmSpots_Effect(currentPlayer, players, card) { Swarm_Effect(currentPlayer, players, card); }
function SwarmStripes_Effect(currentPlayer, players, card) { Swarm_Effect(currentPlayer, players, card); }
function SwarmFur_Effect(currentPlayer, players, card) { Swarm_Effect(currentPlayer, players, card); }

// ================================================
// EXPORTS
// ================================================

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