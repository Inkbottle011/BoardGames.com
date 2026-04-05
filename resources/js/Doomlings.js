class PlayerHand {
    constructor(id) {
        this.id = id;
        this.cards = [];
        this.traitpool = [];
        this.genepool = 5;
        this.size = 5;
        this.points = 0;
        this.name = '';
    }
}

export let GameState = {
    players: [],
    currentPlayer: null,
    currentAge: null,
    catastropheCount: 0,
    status: 'active',
    agePile1: [],
    agePile2: [],
    agePile3: [],
    deckSize: 0,
    ageDeckSize: 0,
};

export function loadFromServer(serverState) {
    GameState.status = serverState.status ?? 'active';
    GameState.players = serverState.players.map(p => {
        let hand = new PlayerHand(p.id);
        hand.cards = p.hand ?? [];
        hand.traitpool = p.traitpool ?? [];
        hand.genepool = p.genepool ?? 5;
        hand.size = p.genepool ?? 5;
        hand.points = p.points ?? 0;
        hand.name = p.name ?? `Player ${p.id}`;
        return hand;
    });
    GameState.currentPlayer = GameState.players.find(
        p => p.id === serverState.current_turn
    ) ?? GameState.players[0];
    GameState.currentAge = serverState.age ?? null;
    GameState.catastropheCount = serverState.catastrophe_count ?? 0;
    GameState.agePile1 = serverState.agePile1 ?? [];
    GameState.agePile2 = serverState.agePile2 ?? [];
    GameState.agePile3 = serverState.agePile3 ?? [];
    GameState.deckSize = serverState.deckSize ?? 0;
    GameState.ageDeckSize = serverState.ageDeckSize ?? 0;
    GameState.discardPile = serverState.discardPile ?? [];
}

export function serializeForServer(cardId) {
    return { card_id: cardId };
}