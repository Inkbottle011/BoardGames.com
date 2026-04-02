import { useState, useEffect, useRef } from "react";
import Board from "./components/board";
import Chat from "./components/chat";
import { loadFromServer, serializeForServer, GameState, play, discardCard, discardTrait } from "./Doomlings.js";

const appEl = document.getElementById('app');
const gameId = parseInt(appEl.dataset.gameId);
const gameSlug = appEl.dataset.gameSlug;
const playerId = parseInt(appEl.dataset.userId);

export default function Doom() {
    const [gameState, setGameState] = useState(null);
    
    const fetchGameStateRef = useRef(null);
    const applyBroadcastRef = useRef(null);
    const lastSentTurnRef = useRef(null);
    
    function csrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }
    
    function syncState() {
        setGameState({
            players: GameState.players.map(p => ({
                id: p.id,
                hand: [...p.cards],
                traitpool: [...p.traitpool],
                genepool: p.genepool,
                points: p.points,
            })),
            current_turn: GameState.currentPlayer?.id,
            age: GameState.currentAge,         // now a full object
            catastrophe: GameState.catastropheCount >= 3,
            catastrophe_count: GameState.catastropheCount,
            status: GameState.status ?? 'active',
        });
    }
    
    function saveToServer() {
        const data = serializeForServer();
        
        return fetch(`/game/${gameSlug}/turn`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken(),
                "X-Socket-ID": window.Echo.socketId(),
            },
            credentials: "include",
            body: JSON.stringify(data),
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    console.error('Validation error:', err);
                    throw new Error(JSON.stringify(err));
                });
            }
            return res.json();
        });
    }
    
    function fetchGameState() {
        return fetch(`/game/${gameSlug}`, {
            headers: {
                "Accept": "application/json",
                "X-CSRF-TOKEN": csrfToken(),
            },
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            loadFromServer(data);
            syncState();
        });
    }
    
    function applyBroadcastState(payload) {
        const incomingCurrentTurn = parseInt(payload.game.current_turn);
        
        // If we just sent a turn and this broadcast is the echo of it — ignore it
        if (lastSentTurnRef.current === playerId && incomingCurrentTurn !== playerId) {
            console.log('Skipping own broadcast echo');
            lastSentTurnRef.current = null;
            return;
        }
        
        lastSentTurnRef.current = null;
        
        const serverState = {
            players: payload.players,
            current_turn: incomingCurrentTurn,
            age: payload.game.current_age,
            catastrophe_count: payload.game.catastrophe_count,
        };
        loadFromServer(serverState);
        syncState();
    }
    
    fetchGameStateRef.current = fetchGameState;
    applyBroadcastRef.current = applyBroadcastState;
    
    useEffect(() => {
        fetchGameStateRef.current();
        
        const channel = window.Echo.private(`game.${gameId}`);
        
        channel.subscribed(() => console.log("✅ Subscribed to game", gameId));
        channel.error((e) => console.error("❌ Channel error", e));
        
        channel.listen("TurnPlayed", (payload) => {
            console.log("TurnPlayed received", payload);
            applyBroadcastRef.current(payload);
        });
        
        return () => {
            channel.stopListening("TurnPlayed");
            window.Echo.leave(`game.${gameId}`);
        };
    }, []);
    
    function handlePlay(cardId) {
        console.log('handlePlay', {
            currentPlayerId: GameState.currentPlayer?.id,
            playerId,
            match: GameState.currentPlayer?.id === playerId,
            players: GameState.players.map(p => p.id)
        });
        
        if (GameState.currentPlayer?.id !== playerId) {
            console.warn('Not your turn!');
            return;
        }
        
        const currentPlayer = GameState.players.find(p => p.id === playerId);
        if (!currentPlayer) return;
        
        const cardIndex = currentPlayer.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            console.error('Card not found in hand');
            return;
        }
        
        // Mark that we're sending a turn so we can ignore our own broadcast echo
        lastSentTurnRef.current = playerId;
        
        play(cardIndex, currentPlayer);
        syncState();
        
        saveToServer()
        .then(data => {
            console.log('saveToServer response:', JSON.stringify(data));
            loadFromServer(data);
            syncState();
        })
        .catch(() => {
            console.error('Save failed, restoring state from server');
            lastSentTurnRef.current = null;
            fetchGameStateRef.current();
        });
    }
    
    function handleDiscard(playerhand, index) {
        discardCard(playerhand, index);
        syncState();
        saveToServer()
        .then(data => { loadFromServer(data); syncState(); })
        .catch(() => fetchGameStateRef.current());
    }
    
    function handleDiscardTrait(playerhand, index) {
        discardTrait(playerhand, index);
        syncState();
        saveToServer()
        .then(data => { loadFromServer(data); syncState(); })
        .catch(() => fetchGameStateRef.current());
    }
    
    
    if (gameState?.status === 'worlds_end') {
        const winner = [...(gameState.players ?? [])]
        .sort((a, b) => b.points - a.points)[0];
        
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-6">
            <h1 className="text-4xl font-bold">🌍 World's End</h1>
            <p className="text-xl">The world has ended after {gameState.catastrophe_count} catastrophes</p>
            {winner && (
                <div className="center-panel text-center">
                <p className="text-lg opacity-60">Winner</p>
                <p className="text-2xl font-bold">Player {winner.id}</p>
                <p className="text-xl">{winner.points} points</p>
                </div>
            )}
            <div className="flex flex-col gap-2 w-64">
            {[...(gameState.players ?? [])].sort((a, b) => b.points - a.points).map((p, i) => (
                <div key={p.id} className="score-row">
                <span>#{i + 1} Player {p.id}</span>
                <span>{p.points}pts</span>
                </div>
            ))}
            </div>
            <button 
            className="chat-send px-6 py-2"
            onClick={() => window.location.href = '/lobby'}
            >
            Back to Lobby
            </button>
            </div>
        );
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
        <Chat
        gameId={gameId}
        gameSlug={gameSlug}
        playerId={playerId}
        />
        </div>
    );
}