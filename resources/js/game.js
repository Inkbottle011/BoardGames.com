import api from "./api";

export const GameAPI = {
    move(gameId, position) {
        return api.post(`/game/${gameId}/move`, { position });
    },
    joinGame(gameId) {
        return api.post(`/game/${gameId}/join`);
    },
    leaveGame(gameId) {
        return api.post(`/game/${gameId}/leave`);
    },
    playCard(gameId, data) {
        // add this
        return api.post(`/game/${gameId}/turn`, data);
    },
    sendMessage(gameId, body) {
        // add this
        return api.post(`/game/${gameId}/chat`, { body });
    },
};

// add this function
export async function saveGameState(
    gameId,
    GameState,
    deck,
    discardPile,
    Ages,
) {
    await GameAPI.playCard(gameId, {
        current_turn: GameState.currentPlayer.id,
        catastrophe_count: GameState.catastropheCount,
        current_age: GameState.currentAge,
        game_state: { deck, discardPile, ages: Ages },
        players: GameState.players.map((p) => ({
            id: p.id,
            cards: p.cards,
            traitpool: p.traitpool,
            genepool: p.genepool,
        })),
    });
}
