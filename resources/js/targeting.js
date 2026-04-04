// Global targeting system — called by CardEffects.js
// Returns a Promise that resolves when the player makes a choice

let _requestTarget = null;

export function initTargeting(requestFn) {
    _requestTarget = requestFn;
}

export async function chooseOpponent(currentPlayer, players) {
    const opponents = players.filter(p => p !== currentPlayer);
    if (opponents.length === 1) return opponents[0];
    
    const options = opponents.map(p => ({
        label: p.name ?? `Player ${p.id}`,
        value: p.id,
    }));
    
    const chosenId = await _requestTarget({
        type: 'opponent',
        prompt: 'Choose an opponent',
        options,
    });
    
    return opponents.find(o => o.id === chosenId) ?? opponents[0];
}

export async function chooseColor() {
    const colors = ['Green', 'Blue', 'Red', 'Purple', 'Colorless'];
    const options = colors.map(c => ({ label: c, value: c }));
    
    return await _requestTarget({
        type: 'color',
        prompt: 'Choose a color',
        options,
    });
}

export async function chooseCardFromHand(player, prompt = 'Choose a card from your hand') {
    if (player.cards.length === 0) return null;
    
    const options = player.cards.map((c, i) => ({
        label: c.card_name,
        value: i,
        card: c,
    }));
    
    return await _requestTarget({
        type: 'card',
        prompt,
        options,
    });
}

export async function chooseCardFromTraitPool(player, prompt = 'Choose a trait') {
    if (player.traitpool.length === 0) return null;
    
    const options = player.traitpool.map((c, i) => ({
        label: c.card_name,
        value: i,
        card: c,
    }));
    
    return await _requestTarget({
        type: 'card',
        prompt,
        options,
    });
}

export async function chooseCardFromDiscard(discardPile, prompt = 'Choose a card from the discard pile') {
    if (discardPile.length === 0) return null;
    
    const options = discardPile.map((c, i) => ({
        label: c.card_name,
        value: i,
        card: c,
    }));
    
    return await _requestTarget({
        type: 'card',
        prompt,
        options,
    });
}

export async function chooseYesNo(prompt) {
    return await _requestTarget({
        type: 'yes_no',
        prompt,
        options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
        ],
    });
}

export async function chooseUpToN(cards, n, prompt = `Choose up to ${n} cards`) {
    if (cards.length === 0) return [];
    
    const options = cards.map((c, i) => ({
        label: c.card_name,
        value: i,
        card: c,
    }));
    
    return await _requestTarget({
        type: 'pick_n',
        prompt,
        options,
        max: n,
    });
}

export async function chooseAge(ages, prompt = 'Choose a World\'s End effect') {
    const options = ages.map((a, i) => ({
        label: a.age_name,
        value: i,
        age: a,
    }));
    
    return await _requestTarget({
        type: 'age',
        prompt,
        options,
    });
}