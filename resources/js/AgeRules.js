//================================================
// AGE RULES
// Defines what each age does per card played
// Called from play() in Doomlings.js
//================================================

/**
* Check if a card is allowed to be played during the current age.
* Returns { allowed: bool, reason: string }
*/
export function checkAgeRestriction(card, currentPlayer, players, currentAge) {
    //temp
    return { allowed: true };
    
    if (!currentAge) return { allowed: true };
    
    const age = currentAge.age_name;
    
    switch (age) {
        case 'Glacial Drift':
        // May only play traits with face value of 3 or lower
        if (card.points > 3) return { allowed: false, reason: 'Glacial Drift: only traits worth 3 or less' };
        break;
        
        case 'Lunar Retreat':
        // Cannot play purple traits
        if (card.color === 'Purple') return { allowed: false, reason: 'Lunar Retreat: cannot play purple traits' };
        break;
        
        case 'High Tides':
        // Cannot play traits WITH an effect (only effectless traits allowed)
        if (card.text) return { allowed: false, reason: 'High Tides: only effectless traits allowed' };
        break;
        
        case 'Galactic Drift':
        // Cannot play colorless traits
        if (card.color === 'Colorless') return { allowed: false, reason: 'Galactic Drift: cannot play colorless traits' };
        break;
        
        case 'Tectonic Shifts':
        // Cannot play green traits
        if (card.color === 'Green') return { allowed: false, reason: 'Tectonic Shifts: cannot play green traits' };
        break;
        
        case 'Tropical Lands':
        // Cannot play colorless traits
        if (card.color === 'Colorless') return { allowed: false, reason: 'Tropical Lands: cannot play colorless traits' };
        break;
        
        case 'Eclipse':
        // Cannot play red traits
        if (card.color === 'Red') return { allowed: false, reason: 'Eclipse: cannot play red traits' };
        break;
        
        case 'Arid Lands':
        // Cannot play blue traits
        if (card.color === 'Blue') return { allowed: false, reason: 'Arid Lands: cannot play blue traits' };
        break;
        
        case 'Natural Harmony':
        // Cannot play a trait of the same color as the last trait played
        if (currentAge._lastPlayedColor && card.color === currentAge._lastPlayedColor) {
            return { allowed: false, reason: `Natural Harmony: cannot play another ${card.color} trait` };
        }
        break;
        
        case 'Reforestation':
        // Traits cannot be stolen, swapped, or discarded — no play restriction
        break;
    }
    
    return { allowed: true };
}

/**
* Run any per-card age side effects AFTER a card is played.
* Called from play() after resolveCard().
*/
export function applyPerCardAgeEffect(card, currentPlayer, players, currentAge) {
    if (!currentAge) return;
    
    const age = currentAge.age_name;
    
    switch (age) {
        case 'Age of Peace':
        // Traits can still be played but their EFFECTS are ignored
        // This is handled by skipCardEffect() check in resolveCard
        break;
        
        case 'Age of Wonder':
        // After playing, hand size is set to 4
        // Handled in stabilize() via genepool override
        break;
        
        case 'Age of Reason':
        // Draw 3 then discard 2 — handled in AgeEffects.js
        break;
        
        case 'Natural Harmony':
        // Track last played color for next player's restriction
        currentAge._lastPlayedColor = card.color;
        break;
        
        case 'Awakening':
        // Show next age to current player — handled separately
        break;
    }
}

/**
* Check if card effects should be skipped during current age.
*/
export function shouldSkipCardEffect(card, currentAge) {
    if (!currentAge) return false;
    
    switch (currentAge.age_name) {
        case 'Age of Peace':
        // All trait effects are ignored
        return true;
        
        case 'Reforestation':
        // Action effects that steal/swap/discard are blocked
        if (card.action) return true;
        break;
    }
    
    return false;
}

/**
* Get the effective hand size for the current age.
* Returns null if age doesn't modify hand size.
*/
export function getAgeHandSize(currentAge, defaultSize) {
    if (!currentAge) return defaultSize;
    
    switch (currentAge.age_name) {
        case 'Age of Wonder':
        return 4;
    }
    
    return defaultSize;
}