import { useState, useEffect } from "react";
import Board from "./components/Board";
import { loadFromServer, serializeForServer, GameState } from "./Doomlings.js";

export default function Doom() {
    const [gameState, setGameState] = useState(null);
    
    const gameId = 1;
    const playerId = 0;
    
    function csrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }
    
    // Sync doomlings.js GameState into React state
    function syncState() {
        setGameState({
            players: GameState.players.map(p => ({
                id: p.id,
                hand: p.cards,
                traitpool: p.traitpool,
                genepool: p.genepool,
                points: p.points,
            })),
            current_turn: GameState.currentPlayer?.id,
            age: GameState.currentAge,
            catastrophe: GameState.catastropheCount >= 3,
            catastrophe_count: GameState.catastropheCount,
        });
    }
    
    // Save doomlings.js GameState to Laravel
    function saveToServer() {
        return fetch(`/game/${gameId}/turn`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken(),
            },
            credentials: "include",
            body: JSON.stringify(serializeForServer()),
        }).then(res => res.json());
    }
    
    function fetchGameState() {
        fetch(`/game/${gameId}`, {
            headers: {
                "Accept": "application/json",
                "X-CSRF-TOKEN": csrfToken(),
            },
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            // Load server state into doomlings.js
            loadFromServer(data);
            // Sync into React
            syncState();
        });
    }
    
    useEffect(() => {
        fetchGameState();
        
        window.Echo.private(`game.${gameId}`)
        .listenForWhisper("playCard", () => {
            fetchGameState();
        });
        
        return () => {
            window.Echo.leave(`game.${gameId}`);
        };
    }, [gameId]);
    
    function handlePlay(cardIndex) {
        play(cardIndex);
        syncState();
        saveToServer();
    }
    
    function handleDiscard(playerhand, index) {
        discardCard(playerhand, index);
        syncState();
        saveToServer();
    }
    
    function handleDiscardTrait(playerhand, index) {
        discardTrait(playerhand, index);
        syncState();
        saveToServer();
    }
    
    return (
        <div>
        <Board
        gameState={gameState}
        gameId={gameId}
        playerId={playerId}
        onPlay={handlePlay}
        onDiscard={handleDiscard}
        onDiscardTrait={handleDiscardTrait}
        />
        </div>
    );
}