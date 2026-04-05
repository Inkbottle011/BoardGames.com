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
        
        case 'Reforestation':
        // Traits cannot be stolen, swapped, or discarded — no play restriction
        break;
    }
    
    return { allowed: true };
}
