<?php

namespace App\Http\Controllers;

use App\Events\AgeEffectRequired;
use App\Events\TurnPlayed;
use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GameController extends Controller
{
    public function show(Game $game)
    {
        $game->load(['players.user']);

        if (request()->ajax() || request()->header('Accept') === 'application/json') {
            return response()->json($this->formatGameState($game));
        }

        $game->load(['players.user', 'messages.user']);

        return view('game', ['game' => $game]);
    }

    public function playTurn(Request $request, Game $game)
    {
        if ($game->status !== 'active') {
            return response()->json(['error' => 'Game is not active'], 400);
        }

        if ((int) $game->current_turn !== (int) auth()->id()) {
            return response()->json([
                'error' => 'Not your turn',
                'current_turn' => $game->current_turn,
                'your_id' => auth()->id(),
            ], 403);
        }

        $gamePlayer = GamePlayer::where('game_id', $game->id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$gamePlayer) {
            return response()->json(['error' => 'You are not in this game'], 403);
        }

        $validator = Validator::make($request->all(), [
            'current_turn' => 'required',
            'catastrophe_count' => 'required|integer|min:0',
            'players' => 'required|array',
            'players.*.id' => 'required',
            'players.*.cards' => 'present|array',
            'players.*.traitpool' => 'present|array',
            'players.*.genepool' => 'required|integer|min:0',
            'players.*.points' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $gameState = $game->game_state ?? [];
        $deck = $gameState['deck'] ?? [];
        $discardPile = $request->input('game_state.discardPile', $gameState['discardPile'] ?? []);
        $ageDeck = $gameState['age_deck'] ?? [];
        $roundPlayers = $gameState['round_players'] ?? [];
        $playerOrder = $gameState['player_order'] ?? [];
        $agePiles = $gameState['age_piles'] ?? [[], [], []];
        $currentAge = $game->current_age ?? [];
        $nextPlayerId = (int) $request->current_turn;

        // Load all player states from DB
        $game->load(['players.user']);
        $playerStates = $game->players->keyBy('user_id');

        // Update active player — deal cards back up to genepool
        foreach ($request->players as $playerData) {
            $playerId = (int) $playerData['id'];
            $genepool = (int) $playerData['genepool'];

            if ($playerId === (int) auth()->id()) {
                $hand = $playerData['cards'];
                $cardsToDraw = max(0, $genepool - count($hand));
                for ($i = 0; $i < $cardsToDraw; $i++) {
                    if (empty($deck)) break;
                    $hand[] = array_shift($deck);
                }
                $this->applyOngoingAgeEffect($currentAge['age_name'] ?? '', $hand, $deck, $genepool);

                GamePlayer::where('game_id', $game->id)
                    ->where('user_id', $playerId)
                    ->update([
                        'hand_cards' => $hand,
                        'trait_pool' => $playerData['traitpool'],
                        'genepool' => $genepool,
                        'points' => (int) ($playerData['points'] ?? 0),
                    ]);

                if (isset($playerStates[$playerId])) {
                    $playerStates[$playerId]->hand_cards = $hand;
                    $playerStates[$playerId]->trait_pool = $playerData['traitpool'];
                    $playerStates[$playerId]->genepool = $genepool;
                }
            } else {
                // Non-active players — only update traitpool and points, server owns their hand
                GamePlayer::where('game_id', $game->id)
                    ->where('user_id', $playerId)
                    ->update([
                        'trait_pool' => $playerData['traitpool'],
                    ]);

                if (isset($playerStates[$playerId])) {
                    $playerStates[$playerId]->trait_pool = $playerData['traitpool'];
                }
            }
        }

        $roundPlayers[] = (int) auth()->id();
        $roundPlayers = array_unique($roundPlayers);
        $catastropheCount = (int) $request->catastrophe_count;
        $newAge = $currentAge;
        $gameStatus = $game->status;
        $ageEffectEvent = null;

        $allPlayerIds = collect($playerOrder)->map(fn($id) => (int) $id)->toArray();
        $roundComplete = count(array_intersect($allPlayerIds, $roundPlayers)) === count($allPlayerIds);

        if ($roundComplete) {
            $roundPlayers = [];

            if (!empty($ageDeck)) {
                $newAge = array_shift($ageDeck);
                $pileIndex = min($catastropheCount, 2);
                $agePiles[$pileIndex][] = $newAge;

                // $this->applyAutomaticAgeEffect(
                //     $newAge['age_name'],
                //     $game,
                //     $playerStates,
                //     $playerOrder,
                //     $deck,
                //     $discardPile,
                //     $nextPlayerId
                // );

                $ageEffectEvent = $this->getInteractiveAgeEffect($newAge['age_name']);

                if ($newAge['catastrophe']) {
                    $catastropheCount++;

                    // $this->applyCatastropheEffect(
                    //     $newAge['age_name'],
                    //     $game,
                    //     $playerStates,
                    //     $playerOrder,
                    //     $deck,
                    //     $discardPile
                    // );

                    if (!empty($playerOrder)) {
                        $first = array_shift($playerOrder);
                        $playerOrder[] = $first;
                        $nextPlayerId = $playerOrder[0];
                    }

                    if ($catastropheCount >= 3) {
                        $gameStatus = 'worlds_end';
                    }
                }

                // Save age effect player state changes
                foreach ($playerStates as $userId => $player) {
                    GamePlayer::where('game_id', $game->id)
                        ->where('user_id', $userId)
                        ->update([
                            'hand_cards' => $player->hand_cards,
                            'trait_pool' => $player->trait_pool,
                            'genepool' => $player->genepool,
                            'points' => $player->points,
                        ]);
                }

                try {
                    ChatController::systemMessage($game, "A new age begins: {$newAge['age_name']}");
                } catch (\Exception $e) {
                }
            } else {
                $catastropheCount = 3;
                $gameStatus = 'worlds_end';
            }
        }

        // Deal cards to next player
        if (isset($playerStates[$nextPlayerId])) {
            $nextHand = $playerStates[$nextPlayerId]->hand_cards ?? [];
            $nextGenepool = $playerStates[$nextPlayerId]->genepool ?? 5;
            $cardsToDraw = max(0, $nextGenepool - count($nextHand));
            for ($i = 0; $i < $cardsToDraw; $i++) {
                if (empty($deck)) break;
                $nextHand[] = array_shift($deck);
            }
            $playerStates[$nextPlayerId]->hand_cards = $nextHand;
            GamePlayer::where('game_id', $game->id)
                ->where('user_id', $nextPlayerId)
                ->update(['hand_cards' => $nextHand]);
        }

        $game->update([
            'current_turn' => $nextPlayerId,
            'catastrophe_count' => $catastropheCount,
            'current_age' => $newAge ?? $currentAge,
            'status' => $gameStatus,
            'game_state' => [
                'deck' => $deck,
                'deckSize' => count($deck),
                'discardPile' => $discardPile,
                'age_deck' => $ageDeck,
                'age_piles' => $agePiles,
                'round_players' => $roundPlayers,
                'player_order' => $playerOrder,
                'age_effect_pending' => $ageEffectEvent,
            ],
        ]);

        $game->load(['players.user']);
        broadcast(new TurnPlayed($game));

        // if ($ageEffectEvent) {
        //     broadcast(new AgeEffectRequired($game, $ageEffectEvent));
        // }

        try {
            ChatController::systemMessage($game, "Player {$gamePlayer->user->name} played a card");
        } catch (\Exception $e) {
        }

        return response()->json($this->formatGameState($game));
    }


    //          all hte ages are currently disabled and need testing

    private function applyOngoingAgeEffect(string $ageName, array &$hand, array &$deck, int &$genepool): void
    {
        switch ($ageName) {
            case 'Coastal Formations':
                if (!empty($deck)) {
                    $hand[] = array_shift($deck);
                }
                break;

            case 'Age of Wonder':
                $genepool = 4;
                break;
        }
    }

    /**
     * Apply automatic age effects that don't need player input
     */
    private function applyAutomaticAgeEffect(string $ageName, Game $game, $playerStates, array $playerOrder, array &$deck, array &$discardPile, int $nextPlayerId = 0): void
    {
        switch ($ageName) {
            case 'Flourish':
                foreach ($playerStates as $userId => $player) {
                    // Stabilize first before applying Flourish
                    $hand = $player->hand_cards ?? [];
                    $genepool = $player->genepool ?? 5;
                    $cardsToDraw = max(0, $genepool - count($hand));
                    for ($i = 0; $i < $cardsToDraw; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    // Now apply Flourish
                    for ($i = 0; $i < 2; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    $player->hand_cards = $hand;
                }
                break;


            case 'Birth of a Hero':
                foreach ($playerStates as $player) {
                    $hand = $player->hand_cards ?? [];
                    $heroicIdx = collect($hand)->search(fn($c) => $c['card_name'] === 'Heroic');
                    if ($heroicIdx !== false) {
                        $heroic = $hand[$heroicIdx];
                        array_splice($hand, $heroicIdx, 1);
                        $traitPool = $player->trait_pool ?? [];
                        $traitPool[] = $heroic;
                        $player->hand_cards = $hand;
                        $player->trait_pool = $traitPool;
                    }
                }
                break;

            case 'Comet Showers':
                foreach ($playerStates as $player) {
                    $hand = $player->hand_cards ?? [];
                    if (!empty($hand)) {
                        $idx = array_rand($hand);
                        $card = $hand[$idx];
                        array_splice($hand, $idx, 1);
                        $player->hand_cards = $hand;
                        if ($card['card_name'] !== 'Endurance') {
                            $discardPile[] = $card;
                        }
                    }
                }
                break;

            case 'Age of Dracula':
                foreach ($playerStates as $player) {
                    $traitPool = $player->trait_pool ?? [];
                    $hasVampirism = collect($traitPool)->contains(fn($t) => $t['card_name'] === 'Vampirism');
                    $hand = $player->hand_cards ?? [];
                    if (!$hasVampirism && !empty($hand)) {
                        $idx = array_rand($hand);
                        $card = $hand[$idx];
                        array_splice($hand, $idx, 1);
                        $player->hand_cards = $hand;
                        if ($card['card_name'] !== 'Endurance') {
                            $discardPile[] = $card;
                        }
                    }
                }
                break;
        }
    }




















    private function applyCatastropheEffect(string $ageName, Game $game, $playerStates, array $playerOrder, array &$deck, array &$discardPile): void
    {
        switch ($ageName) {
            case 'The Big One':
                foreach ($playerStates as $player) {
                    $player->genepool = max(0, $player->genepool - 1);
                }
                break;

            case 'Glacial Meltdown':
                foreach ($playerStates as $player) {
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < 2; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                            if ($card['card_name'] !== 'Endurance') {
                                $discardPile[] = $card;
                            }
                        }
                    }
                    $player->hand_cards = $hand;
                }
                break;

            case 'Ice Age':
                foreach ($playerStates as $player) {
                    $redCount = collect($player->trait_pool ?? [])
                        ->filter(fn($t) => $t['color'] === 'Red')
                        ->count();
                    $player->points -= $redCount;
                }
                break;

            case 'Overpopulation':
                foreach ($playerStates as $player) {
                    $player->genepool += 1;
                }
                break;

            case 'Grey Goo':
                $maxTraits = 0;
                $maxPlayer = null;
                foreach ($playerStates as $player) {
                    $count = count($player->trait_pool ?? []);
                    if ($count > $maxTraits) {
                        $maxTraits = $count;
                        $maxPlayer = $player;
                    }
                }
                if ($maxPlayer) {
                    $maxPlayer->points -= 5;
                }
                break;

            case 'The Four Horsemen':
                foreach ($playerStates as $player) {
                    $player->genepool = max(0, $player->genepool - 1);
                    $traitPool = $player->trait_pool ?? [];
                    if (!empty($traitPool)) {
                        $idx = array_rand($traitPool);
                        $card = $traitPool[$idx];
                        array_splice($traitPool, $idx, 1);
                        $player->trait_pool = $traitPool;
                        if ($card['card_name'] !== 'Endurance') {
                            $discardPile[] = $card;
                        }
                    }
                }
                break;

            case 'Nuclear Winter':
                foreach ($playerStates as $player) {
                    $player->genepool = max(0, $player->genepool - 1);
                }
                break;

            case 'Solar Flare':
                foreach ($playerStates as $player) {
                    $player->genepool = max(0, $player->genepool - 1);
                    $hand = $player->hand_cards ?? [];
                    $half = (int) floor(count($hand) / 2);
                    for ($i = 0; $i < $half; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                            if ($card['card_name'] !== 'Endurance') {
                                $discardPile[] = $card;
                            }
                        }
                    }
                    $player->hand_cards = $hand;
                }
                break;

            case 'Mass Extinction':
                foreach ($playerStates as $player) {
                    $traitPool = $player->trait_pool ?? [];
                    $player->trait_pool = collect($traitPool)
                        ->filter(function ($t) use (&$discardPile) {
                            if ($t['color'] === 'Colorless' && $t['card_name'] !== 'Endurance') {
                                $discardPile[] = $t;

                                return false;
                            }

                            return true;
                        })
                        ->values()
                        ->toArray();
                }
                break;

            case 'Pulse Event':
                foreach ($playerStates as $player) {
                    $traitPool = $player->trait_pool ?? [];
                    $player->trait_pool = collect($traitPool)
                        ->filter(function ($t) use (&$discardPile) {
                            if ($t['color'] === 'Purple' && $t['card_name'] !== 'Endurance') {
                                $discardPile[] = $t;

                                return false;
                            }

                            return true;
                        })
                        ->values()
                        ->toArray();
                }
                break;

            case 'Retrovirus':
                foreach ($playerStates as $player) {
                    $traitPool = $player->trait_pool ?? [];
                    $player->trait_pool = collect($traitPool)
                        ->filter(function ($t) use (&$discardPile) {
                            if ($t['color'] === 'Green' && $t['card_name'] !== 'Endurance') {
                                $discardPile[] = $t;

                                return false;
                            }

                            return true;
                        })
                        ->values()
                        ->toArray();
                }
                break;

            case 'Mega Tsunami':
                $hands = collect($playerOrder)->map(fn($id) => $playerStates[$id]->hand_cards ?? [])->toArray();
                $first = array_shift($hands);
                $hands[] = $first;
                foreach ($playerOrder as $i => $userId) {
                    if (isset($playerStates[$userId])) {
                        $playerStates[$userId]->hand_cards = $hands[$i];
                    }
                }
                break;

            case 'Super Volcano':
                foreach ($playerStates as $player) {
                    $hand = $player->hand_cards ?? [];
                    $player->hand_cards = collect($hand)
                        ->filter(function ($c) use (&$discardPile) {
                            if ($c['color'] === 'Blue' && $c['card_name'] !== 'Endurance') {
                                $discardPile[] = $c;

                                return false;
                            }

                            return true;
                        })
                        ->values()
                        ->toArray();
                }
                break;
        }
    }

    /**
     * Get interactive age effect type if the age needs player input
     */
    private function getInteractiveAgeEffect(string $ageName): ?array
    {
        $interactiveAges = [
            'Northern Winds' => ['type' => 'draw_discard', 'draw' => 1, 'discard' => 1, 'prompt' => 'Draw 1 card, then discard 1 card from your hand'],
            'Prosperity' => ['type' => 'yes_no', 'action' => 'stabilize', 'prompt' => 'Do you want to stabilize?'],
            'Age of Nietzsche' => ['type' => 'yes_no', 'action' => 'discard_draw3_or_stabilize', 'prompt' => 'Discard your hand and draw 3, or stabilize?'],
            'Enlightenment' => ['type' => 'discard_up_to', 'max' => 2, 'prompt' => 'Discard up to 2 cards from your hand, then stabilize'],
            'Alien Terraform' => ['type' => 'yes_no', 'action' => 'discard_dominants_stabilize', 'prompt' => 'Discard your dominant cards and stabilize?'],
            'Age of Wonder' => ['type' => 'set_hand_size', 'size' => 4, 'prompt' => 'Your hand size is set to 4 this round'],
            'Age of Reason' => ['type' => 'draw_discard', 'draw' => 3, 'discard' => 2, 'prompt' => 'Draw 3 cards, then discard 2'],
        ];

        return $interactiveAges[$ageName] ?? null;
    }

    public function startGame(Game $game)
    {
        $host = $game->players()->orderBy('seat')->first();
        if ($host->user_id !== auth()->id()) {
            return back()->with('error', 'Only the host can start the game');
        }

        if ($game->players()->count() < 2) {
            return back()->with('error', 'Need at least 2 players to start');
        }

        $allCards = DB::table('doomlings_deck')
            ->get()
            ->map(
                fn($c) => [
                    'id' => $c->id,
                    'card_name' => $c->card_name,
                    'points' => $c->points,
                    'img' => $c->img,
                    'text' => $c->text,
                    'color' => $c->color,
                    'dominant' => $c->dominant,
                    'action' => $c->action,
                ],
            )
            ->shuffle()
            ->values()
            ->toArray();

        $cardIndex = 0;
        foreach ($game->players as $player) {
            $handSize = $player->genepool > 0 ? $player->genepool : 5;
            $hand = array_slice($allCards, $cardIndex, $handSize);
            $cardIndex += $handSize;
            $player->update(['hand_cards' => $hand]);
        }
        $remainingDeck = array_slice($allCards, $cardIndex);

        $impatienceCard = DB::table('doomlings_deck')->where('card_name', 'Impatience')->first();
        if ($impatienceCard) {
            $firstPlayer = $game->players()->orderBy('seat')->first();
            $hand = $firstPlayer->hand_cards ?? [];
            $hand[] = [
                'id' => $impatienceCard->id,
                'card_name' => $impatienceCard->card_name,
                'points' => $impatienceCard->points,
                'img' => $impatienceCard->img,
                'text' => $impatienceCard->text,
                'color' => $impatienceCard->color,
                'dominant' => $impatienceCard->dominant,
                'action' => $impatienceCard->action,
            ];
            $firstPlayer->update(['hand_cards' => $hand]);
        }

        $birthOfLife = DB::table('doomlings_ages')->where('age_name', 'The Birth of Life')->first();

        $catastrophes = DB::table('doomlings_ages')
            ->where('catastrophe', 1)
            ->inRandomOrder()
            ->limit(3)
            ->get()
            ->map(
                fn($a) => [
                    'id' => $a->id,
                    'age_name' => $a->age_name,
                    'img' => $a->img,
                    'text' => $a->text,
                    'catastrophe' => (bool) $a->catastrophe,
                    'world_end_text' => $a->World_End_text,
                ],
            )
            ->toArray();

        $normalAges = DB::table('doomlings_ages')
            ->where('catastrophe', 0)
            ->where('age_name', '!=', 'The Birth of Life')
            ->inRandomOrder()
            ->limit(9)
            ->get()
            ->map(
                fn($a) => [
                    'id' => $a->id,
                    'age_name' => $a->age_name,
                    'img' => $a->img,
                    'text' => $a->text,
                    'catastrophe' => (bool) $a->catastrophe,
                    'world_end_text' => $a->World_End_text,
                ],
            )
            ->toArray();

        $shuffledAges = collect(array_merge($normalAges, $catastrophes))->shuffle()->values()->toArray();


        $birthOfLifeFormatted = [
            'id' => $birthOfLife->id,
            'age_name' => $birthOfLife->age_name,
            'img' => $birthOfLife->img,
            'text' => $birthOfLife->text,
            'catastrophe' => (bool) $birthOfLife->catastrophe,
            'world_end_text' => $birthOfLife->World_End_text,
        ];


        $ageDeck = array_merge([$birthOfLifeFormatted], $shuffledAges);
        $currentAge = array_shift($ageDeck);
        $agePiles = [[$currentAge], [], []];

        $playerOrder = $game->players()->orderBy('seat')->pluck('user_id')->map(fn($id) => (int) $id)->toArray();

        $game->update([
            'status' => 'active',
            'current_turn' => (int) $host->user_id,
            'current_age' => $currentAge,
            'catastrophe_count' => 0,
            'game_state' => [
                'deck' => $remainingDeck,
                'deckSize' => count($remainingDeck),
                'discardPile' => [],
                'age_deck' => $ageDeck,
                'age_piles' => $agePiles,
                'round_players' => [],
                'player_order' => $playerOrder,
                'age_effect_pending' => null,
            ],
        ]);

        return redirect("/game/{$game->slug}");
    }

    public function leave(Game $game)
    {
        GamePlayer::where('game_id', $game->id)
            ->where('user_id', auth()->id())
            ->delete();

        if ($game->players()->count() === 0) {
            $game->delete();
        } else {
            $newHost = $game->players()->orderBy('seat')->first();
            if ($newHost) {
                $newHost->update(['seat' => 1]);
            }
        }

        if (request()->expectsJson() || (request()->isMethod('post') && !request()->has('_token'))) {
            return response()->json(['status' => 'ok']);
        }

        return redirect('/lobby');
    }

    public function heartbeat(Game $game)
    {
        GamePlayer::where('game_id', $game->id)
            ->where('user_id', auth()->id())
            ->update(['last_seen' => now()]);

        return response()->json(['status' => 'ok']);
    }

    private function formatGameState(Game $game): array
    {
        \Log::info('formatGameState points', $game->players->map(fn($p) => ['id' => $p->user_id, 'points' => $p->points])->toArray());
        $gameState = $game->game_state ?? [];
        $agePiles = $gameState['age_piles'] ?? [[], [], []];

        return [
            'id' => $game->id,
            'age' => $game->current_age,
            'catastrophe' => $game->catastrophe_count >= 3,
            'catastrophe_count' => (int) $game->catastrophe_count,
            'current_turn' => (int) $game->current_turn,
            'status' => $game->status,
            'deckSize' => $gameState['deckSize'] ?? 0,
            'ageDeckSize' => count($gameState['age_deck'] ?? []),
            'discardPile' => $gameState['discardPile'] ?? [],
            'agePile1' => $agePiles[0] ?? [],
            'agePile2' => $agePiles[1] ?? [],
            'agePile3' => $agePiles[2] ?? [],
            'age_effect_pending' => $gameState['age_effect_pending'] ?? null,
            'players' => $game->players->map(
                fn($p) => [
                    'id' => (int) $p->user_id,
                    'name' => $p->user?->username ?? "Player {$p->user_id}",
                    'hand' => $p->hand_cards ?? [],
                    'traitpool' => $p->trait_pool ?? [],
                    'genepool' => (int) $p->genepool,
                    'points' => (int) ($p->points ?? 0),
                ],
            ),
        ];
    }
}
