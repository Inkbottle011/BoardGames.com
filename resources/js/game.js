import api from "./api";

export const GameAPI = {
    move(gameId, position) {
        return api.post(`/game/${gameId}/move`, { position });
    },

    attack(gameId, targetId) {
        return api.post(`/game/${gameId}/attack`, { target_id: targetId });
    },

    joinGame(gameId) {
        return api.post(`/game/${gameId}/join`);
    },

    leaveGame(gameId) {
        return api.post(`/game/${gameId}/leave`);
    },
};
