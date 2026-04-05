import { useState, useEffect, useRef } from "react";
import Board from "./components/board";
import Chat from "./components/chat";
import { loadFromServer, GameState } from "./Doomlings.js";
import { checkAgeRestriction } from './AgeRules.js';

const appEl = document.getElementById('app');
const gameId = parseInt(appEl.dataset.gameId);
const gameSlug = appEl.dataset.gameSlug;
const playerId = parseInt(appEl.dataset.userId);

export default function Doom() {
    const [gameState, setGameState] = useState(null);
    const [gamePrompt, setGamePrompt] = useState(null);

    const fetchGameStateRef = useRef(null);
    const applyBroadcastRef = useRef(null);
    const lastSentTurnRef = useRef(null);
    
    const [gameLog, setGameLog] = useState([]);
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
            discardPile: GameState.discardPile ?? [],
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
        })
        .catch(err => console.error('fetchGameState error:', err));
    }

    function applyBroadcastState(payload) {
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
        discardPile: payload.discardPile ?? [],
    };
    loadFromServer(serverState);
    syncState();

    if (payload.game.log_message) {
        setGameLog(prev => [...prev, payload.game.log_message]);
    }
    if (payload.game.current_age?.age_name !== GameState.currentAge?.age_name) {
        setGameLog(prev => [...prev, `🌍 New age: <strong>${payload.game.current_age?.age_name}</strong>`]);
    }
    if (payload.game.last_played_card) {
        const prevPlayer = payload.players.find(p => p.id !== incomingCurrentTurn);
        setGameLog(prev => [...prev, `🃏 ${prevPlayer?.name ?? 'Opponent'} played <strong>${payload.game.last_played_card}</strong>`]);
    }
}

    fetchGameStateRef.current = fetchGameState;
    applyBroadcastRef.current = applyBroadcastState;

    useEffect(() => {
        fetchGameStateRef.current();

        const channel = window.Echo.private(`game.${gameId}`);
        channel.subscribed(() => console.log("✅ Subscribed to game", gameId));
        channel.error((e) => console.error("❌ Channel error", e));

        channel.listen("TurnPlayed", (payload) => {
            applyBroadcastRef.current(payload);
        });

        return () => {
            channel.stopListening("TurnPlayed");
            window.Echo.leave(`game.${gameId}`);
        };
    }, []);

    function handlePlay(cardId) {
        if (GameState.currentPlayer?.id !== playerId) {
            setGamePrompt('⏳ Not your turn!');
            return;
        }

        const currentPlayer = GameState.players.find(p => p.id === playerId);
        const card = currentPlayer?.cards.find(c => c.id === cardId);

        if (card) {
            const restriction = checkAgeRestriction(card, currentPlayer, GameState.players, GameState.currentAge);
            if (!restriction.allowed) {
                setGamePrompt(`❌ ${restriction.reason}`);
                return;
            }
        }

        fetch(`/game/${gameSlug}/turn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Socket-ID': window.Echo.socketId(),
            },
            credentials: 'include',
            body: JSON.stringify({ card_id: cardId }),
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    setGamePrompt(`❌ ${err.error ?? 'Something went wrong'}`);
                });
            }
            return res.json().then(data => {
                lastSentTurnRef.current = playerId;
                loadFromServer(data);
                setGameLog(prev => [...prev, `🃏 You played <strong>${card.card_name}</strong>`]);
                syncState();
                setGamePrompt(null);
            });
        })
        .catch(() => {
            fetchGameState();
        });
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
                prompt={gamePrompt}
                gameLog={gameLog}
            />
            <Chat
                gameId={gameId}
                gameSlug={gameSlug}
                playerId={playerId}
            />
        </div>
    );
}