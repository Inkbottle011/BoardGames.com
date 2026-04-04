import { useState, useEffect, useRef } from "react";
import Board from "./components/board";
import Chat from "./components/chat";
import TargetingModal from "./components/TargetingModal";
import { initTargeting } from "./targeting.js";
import { loadFromServer, serializeForServer, GameState, play, discardCard, discardTrait } from "./Doomlings.js";

const appEl = document.getElementById('app');
const gameId = parseInt(appEl.dataset.gameId);
const gameSlug = appEl.dataset.gameSlug;
const playerId = parseInt(appEl.dataset.userId);

export default function Doom() {
    const [gameState, setGameState] = useState(null);
    const [targetRequest, setTargetRequest] = useState(null);
    const [gamePrompt, setGamePrompt] = useState(null);
    
    const fetchGameStateRef = useRef(null);
    const applyBroadcastRef = useRef(null);
    const lastSentTurnRef = useRef(null);
    const targetResolverRef = useRef(null);
    const handleAgeEffectRef = useRef(null);
    
    function requestTarget(request) {
        return new Promise((resolve) => {
            targetResolverRef.current = resolve;
            setTargetRequest(request);
        });
    }
    
    function resolveTarget(choice) {
        setTargetRequest(null);
        if (targetResolverRef.current) {
            targetResolverRef.current(choice);
            targetResolverRef.current = null;
        }
    }
    
    const requestTargetRef = useRef(requestTarget);
    requestTargetRef.current = requestTarget;
    
    function csrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }
    
    function syncState() {
        setGameState({
            players: GameState.players.map(p => ({
                id: p.id,
                name: p.name ?? `Player ${p.id}`,
                hand: [...p.cards],
                traitpool: [...p.traitpool],
                genepool: p.genepool,
    points: p.traitpool.reduce((sum, card) => sum + (card.points ?? 0), 0),
            })),
            current_turn: GameState.currentPlayer?.id,
            age: GameState.currentAge,
            catastrophe: GameState.catastropheCount >= 3,
            catastrophe_count: GameState.catastropheCount,
            status: GameState.status ?? 'active',
            agePile1: GameState.agePile1 ?? [],
            agePile2: GameState.agePile2 ?? [],
            agePile3: GameState.agePile3 ?? [],
            deckSize: GameState.deckSize ?? 0,
            ageDeckSize: GameState.ageDeckSize ?? 0,
            discardPile: GameState.discardPile ?? [],
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
        .then(res => {
            return res.json();
        })
        .then(data => {
            loadFromServer(data);
            syncState();
            // Resume pending age effect if any
            if (data.age_effect_pending && handleAgeEffectRef.current) {
                handleAgeEffectRef.current(data.age_effect_pending);
            }
        })
        .catch(err => console.error('fetchGameState error:', err));
    }
    
    function applyBroadcastState(payload) {
        console.log('broadcast points:', JSON.stringify(payload.players.map(p => ({ id: p.id, points: p.points }))));
        const incomingCurrentTurn = parseInt(payload.game.current_turn);
        if (lastSentTurnRef.current === playerId) {
            lastSentTurnRef.current = null;
            return;
        }
        
        lastSentTurnRef.current = null;
        
        const serverState = {
            players: payload.players,
            current_turn: incomingCurrentTurn,
            age: payload.game.current_age,
            catastrophe_count: payload.game.catastrophe_count,
            status: payload.game.status,
            agePile1: payload.game.agePile1 ?? [],
            agePile2: payload.game.agePile2 ?? [],
            agePile3: payload.game.agePile3 ?? [],
            ageDeckSize: payload.game.ageDeckSize ?? 0,
            deckSize: payload.game.deckSize ?? 0,
        };
        loadFromServer(serverState);
        syncState();
    }
    
    fetchGameStateRef.current = fetchGameState;
    applyBroadcastRef.current = applyBroadcastState;
    
    async function handleAgeEffect(effect) {
        if (!effect) return;
        
        switch (effect.type) {
            case 'draw_discard': {
                await fetchGameStateRef.current();
                const currentPlayer = GameState.players.find(p => p.id === playerId);
                if (!currentPlayer) return;
                for (let i = 0; i < effect.discard; i++) {
                    if (currentPlayer.cards.length === 0) break;
                    
                    const idx = await requestTargetRef.current({
                        type: 'card',
                        prompt: effect.prompt,
                        options: currentPlayer.cards.map((c, j) => ({
                            label: c.card_name,
                            value: j,
                            card: c
                        })),
                    });
                    
                    if (idx !== null && idx >= 0 && idx < currentPlayer.cards.length) {
                        discardCard(currentPlayer, idx);
                        syncState();
                    }
                }
                await saveToServer();
                break;
            }
            
            case 'yes_no': {
                const answer = await requestTargetRef.current({
                    type: 'yes_no',
                    prompt: effect.prompt,
                    options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
                });
                if (answer && effect.action === 'stabilize') {
                    await fetchGameStateRef.current();
                }
                break;
            }
            
            case 'discard_up_to': {
                await fetchGameStateRef.current();
                const currentPlayer = GameState.players.find(p => p.id === playerId);
                if (!currentPlayer) return;
                const indices = await requestTargetRef.current({
                    type: 'pick_n',
                    prompt: effect.prompt,
                    options: currentPlayer.cards.map((c, j) => ({ label: c.card_name, value: j, card: c })),
                    max: effect.max,
                });
                if (indices && indices.length > 0) {
                    indices.sort((a, b) => b - a).forEach(idx => discardCard(currentPlayer, idx));
                    syncState();
                    await saveToServer();
                }
                break;
            }
        }
    }
    
    handleAgeEffectRef.current = handleAgeEffect;
    
    useEffect(() => {
        initTargeting((request) => requestTargetRef.current(request));
        fetchGameStateRef.current();
        
        const channel = window.Echo.private(`game.${gameId}`);
        channel.subscribed(() => console.log("✅ Subscribed to game", gameId));
        channel.error((e) => console.error("❌ Channel error", e));
        
        channel.listen("TurnPlayed", (payload) => {
            applyBroadcastRef.current(payload);
        });
        
        channel.listen(".AgeEffectRequired", (payload) => {
            handleAgeEffectRef.current(payload.effect);
        });
        
        return () => {
            channel.stopListening("TurnPlayed");
            channel.stopListening(".AgeEffectRequired");
            window.Echo.leave(`game.${gameId}`);
        };
    }, []);
    
    function handlePlay(cardId) {
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
        
        const handSizeBefore = currentPlayer.cards.length;
        lastSentTurnRef.current = playerId;
        
        Promise.resolve(play(cardIndex, currentPlayer))
        .then(() => {
            if (currentPlayer.cards.length === handSizeBefore) {
                lastSentTurnRef.current = null;
                const ageName = GameState.currentAge?.age_name ?? 'current age';
                setGamePrompt(`❌ Cannot play that card during ${ageName}`);
                syncState();
                return Promise.reject('blocked');
            }
            
            setGamePrompt(null);
            syncState();
            return saveToServer();
        })
        .then(data => {
            loadFromServer(data);
            syncState();
        })
        .catch((reason) => {
            if (reason === 'blocked') return;
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
                <p className="text-2xl font-bold">{winner.name ?? `Player ${winner.id}`}</p>
                <p className="text-xl">{winner.points} points</p>
                </div>
            )}
            <div className="flex flex-col gap-2 w-64">
            {[...(gameState.players ?? [])].sort((a, b) => b.points - a.points).map((p, i) => (
                <div key={p.id} className="score-row">
                <span>#{i + 1} {p.name ?? `Player ${p.id}`}</span>
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
        prompt={gamePrompt}
        targetRequest={targetRequest}
        onResolve={resolveTarget}
        />
        <Chat
        gameId={gameId}
        gameSlug={gameSlug}
        playerId={playerId}
        />
        </div>
    );
}