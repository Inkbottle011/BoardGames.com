<?php

namespace App\Http\Controllers;

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
            return response()->json(['error' => 'Not your turn'], 403);
        }

        $validator = Validator::make($request->all(), [
            'card_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $gameState = $game->game_state ?? [];
        $deck = $gameState['deck'] ?? [];
        $discardPile = $gameState['discardPile'] ?? [];
        $ageDeck = $gameState['age_deck'] ?? [];
        $roundPlayers = $gameState['round_players'] ?? [];
        $playerOrder = $gameState['player_order'] ?? [];
        $agePiles = $gameState['age_piles'] ?? [[], [], []];
        $currentAge = $game->current_age ?? ['age_name' => ''];
        $game->load(['players.user']);
        $playerStates = $game->players->keyBy('user_id');

        $activePlayer = $playerStates[(int) auth()->id()] ?? null;
        if (!$activePlayer) {
            return response()->json(['error' => 'Player not found'], 403);
        }

        // Find card in hand
        $cardId = (int) $request->card_id;
        $hand = $activePlayer->hand_cards ?? [];
        $cardIndex = collect($hand)->search(fn($c) => (int)($c['id'] ?? 0) === $cardId);

        if ($cardIndex === false) {
            return response()->json(['error' => 'Card not in hand'], 422);
        }

        $card = $hand[$cardIndex];

        // Check age restrictions
        $ageRestriction = $this->checkAgeRestriction($card, $currentAge['age_name'] ?? '', $gameState);
        if (!$ageRestriction['allowed']) {
            return response()->json(['error' => $ageRestriction['reason']], 422);
        }

        array_splice($hand, $cardIndex, 1);
        //run the card effect
        $this->CardeffectRun($card, $activePlayer, $playerStates, $hand, $discardPile, $deck, $gameState);
        // Add to traitpool
        $traitPool = $activePlayer->trait_pool ?? [];
        $traitPool[] = $card;

        // Calculate points from traitpool
        $points = collect($traitPool)->sum('points');

        // Deal cards back up to genepool
        $genepool = $activePlayer->genepool ?? 5;
        $cardsToDraw = max(0, $genepool - count($hand));
        for ($i = 0; $i < $cardsToDraw; $i++) {
            if (empty($deck)) break;
            $hand[] = array_shift($deck);
        }

        // Trim hand if over genepool
        if (count($hand) > $genepool) {
            $excess = array_splice($hand, $genepool);
            foreach ($excess as $excessCard) {
                $discardPile[] = $excessCard;
            }
        }

        // Apply ongoing age effect
        $this->applyOngoingAgeEffect($currentAge['age_name'] ?? '', $hand, $deck, $genepool);

        // Save active player
        GamePlayer::where('game_id', $game->id)
            ->where('user_id', auth()->id())
            ->update([
                'hand_cards' => $hand,
                'trait_pool' => $traitPool,
                'genepool' => $genepool,
                'points' => $points,
            ]);

        $playerStates[(int) auth()->id()]->hand_cards = $hand;
        $playerStates[(int) auth()->id()]->trait_pool = $traitPool;
        $playerStates[(int) auth()->id()]->points = $points;

        // $this->calculatePoints($activePlayer, $playerStates);
        // Advance turn
        $roundPlayers[] = (int) auth()->id();
        $roundPlayers = array_unique($roundPlayers);
        $allPlayerIds = collect($playerOrder)->map(fn($id) => (int) $id)->toArray();
        $roundComplete = count(array_intersect($allPlayerIds, $roundPlayers)) === count($allPlayerIds);

        $nextPlayerId = $this->getNextPlayerId($playerOrder, (int) auth()->id());
        $catastropheCount = (int) $game->catastrophe_count;
        $newAge = $currentAge;
        $gameStatus = $game->status;
        $logMessage = null;

        if ($roundComplete) {
            $roundPlayers = [];
            \Log::info('ageDeck count', ['count' => count($ageDeck)]);
            $game->load(['players.user']);
            $playerStates = $game->players->keyBy('user_id');

            if (!empty($ageDeck)) {
                $newAge = array_shift($ageDeck);
                $pileIndex = min($catastropheCount, 2);
                $agePiles[$pileIndex][] = $newAge;

                if (($currentAge['age_name'] ?? '') === 'The Messiah') {
                    $playerOrder = array_reverse($playerOrder);
                    $nextPlayerId = $playerOrder[0];
                }

                $this->applyAutomaticAgeEffect(
                    $newAge['age_name'],
                    $game,
                    $playerStates,
                    $playerOrder,
                    $deck,
                    $discardPile,
                    $nextPlayerId
                );

                if ($newAge['age_name'] === 'Awakening' && !empty($ageDeck)) {
                    $logMessage = "🌅 Awakening: Next age will be <strong>{$ageDeck[0]['age_name']}</strong>";
                }

                if ($newAge['catastrophe']) {
                    $this->applyCatastropheEffect(
                        $newAge['age_name'],
                        $playerStates,
                        $playerOrder,
                        $deck,
                        $discardPile
                    );

                    $catastropheCount++;

                    if (!empty($playerOrder)) {
                        $first = array_shift($playerOrder);
                        $playerOrder[] = $first;
                        $nextPlayerId = $playerOrder[0];
                    }

                    if ($catastropheCount >= 3) {
                        $gameStatus = 'worlds_end';
                    }
                }
            } else {
                $catastropheCount = 3;
                $gameStatus = 'worlds_end';
            }
        }

        if ($gameStatus === 'worlds_end') {
            $game->load(['players.user']);
            $playerStates = $game->players->keyBy('user_id');
            $this->applyWorldsEndScoring($game, $playerStates);
        }

        $lastPlayedColor = ($currentAge['age_name'] ?? '') === 'Natural Harmony' ? ($card['color'] ?? null) : null;
        $game->update([
            'current_turn' => $nextPlayerId,
            'catastrophe_count' => $catastropheCount,
            'current_age' => $newAge,
            'status' => $gameStatus,
            'game_state' => [
                'deck' => $deck,
                'deckSize' => count($deck),
                'discardPile' => $discardPile,
                'age_deck' => $ageDeck,
                'age_piles' => $agePiles,
                'round_players' => $roundPlayers,
                'player_order' => $playerOrder,
                'last_played_color' => $lastPlayedColor,
                'last_played_card' => $card['card_name'] ?? null,
                'log_message' => $logMessage,
            ],
        ]);

        $game->load(['players.user']);
        broadcast(new TurnPlayed($game));


        return response()->json($this->formatGameState($game));
    }

    private function getNextPlayerId(array $playerOrder, int $currentId): int
    {
        $index = array_search($currentId, $playerOrder);
        if ($index === false) return $playerOrder[0];
        return $playerOrder[($index + 1) % count($playerOrder)];
    }
    private function Draw(int $num, &$hand, &$deck)
    {
        for ($i = 0; $i < $num; $i++) {
            if (empty($deck)) break;
            $hand[] = array_shift($deck);
        }
    }

    private function CardeffectRun($card, &$activePlayer, &$playerStates, &$hand, &$discardPile, &$deck, &$gameState = [])
    {
        switch ($card['card_name'] ?? '') {
            case 'Camouflage':
            case 'Teeth':
            case 'Dreamer':
            case 'Mitochondrion':
            case 'Just':
            case 'Fecundity':
            case 'Saliva':
                $activePlayer->genepool = min(8, $activePlayer->genepool + 1);
                break;
            case 'Brute Strength':
                $activePlayer->genepool = max(1, $activePlayer->genepool - 1);
                break;
            case 'Warm Blood':
                $activePlayer->genepool = min(8, $activePlayer->genepool + 2);
                break;
            case 'Introspective':
                $this->Draw(4, $hand, $deck);
                break;
            case 'Iridescent Scales':
                $this->Draw(3, $hand, $deck);
                break;
            case 'Photosynthesis':
                if (empty($deck)) break;
                $cardOne = array_shift($deck);
                $cardTwo = array_shift($deck);
                $hand[] = $cardOne;
                $hand[] = $cardTwo;
                if (($cardOne['color'] ?? '') === 'Green' || ($cardTwo['color'] ?? '') === 'Green') {
                    //play another card
                }
                break;

            case 'Cold Blood':
                //Have the drawn cards become active for play
                break;

            case 'Sweat':
                break;
            // These cards have no immediate effect — World's End handles them
            case 'Immunity':
            case 'Tiny':
            case 'Egg Clusters':
            case 'Overgrowth':
            case 'Heat Vision':
            case 'Sticky Secretions':
            case 'Mindful':
            case 'Pollination':
            case 'Fortunate':
            case 'Gratitude':
            case 'Altruistic':
            case 'Random Fertilization':
            case 'Boredom':
            case 'Saudade':
            case 'Apex Predator':
            case 'Brave':
            case 'Symbiosis':
            case 'Pack Behavior':
            case 'Branches':
                // No immediate effect — scored at World's End
                break;
            default:
                break;
        }
    }



    private function checkAgeRestriction(array $card, string $ageName, array $gameState = []): array
    {
        switch ($ageName) {
            case 'Glacial Drift':
                if (($card['points'] ?? 0) > 3)
                    return ['allowed' => false, 'reason' => 'Glacial Drift: only traits worth 3 or less'];
                break;

            case 'Lunar Retreat':
                if (($card['color'] ?? '') === 'Purple')
                    return ['allowed' => false, 'reason' => 'Lunar Retreat: cannot play purple traits'];
                break;

            case 'Tropical Lands':
                if (($card['color'] ?? '') === 'Colorless')
                    return ['allowed' => false, 'reason' => "{$ageName}: cannot play colorless traits"];
                break;

            case 'Tectonic Shifts':
                if (($card['color'] ?? '') === 'Green')
                    return ['allowed' => false, 'reason' => 'Tectonic Shifts: cannot play green traits'];
                break;

            case 'Eclipse':
                if (($card['color'] ?? '') === 'Red')
                    return ['allowed' => false, 'reason' => 'Eclipse: cannot play red traits'];
                break;

            case 'Arid Lands':
                if (($card['color'] ?? '') === 'Blue')
                    return ['allowed' => false, 'reason' => 'Arid Lands: cannot play blue traits'];
                break;
            case 'Natural Harmony':
                $lastPlayedColor = $gameState['last_played_color'] ?? null;
                if ($lastPlayedColor && ($card['color'] ?? '') === $lastPlayedColor) {
                    return ['allowed' => false, 'reason' => "Natural Harmony: cannot play another {$lastPlayedColor} trait"];
                }
                break;
        }

        return ['allowed' => true, 'reason' => ''];
    }

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
            ->map(fn($c) => [
                'id' => $c->id,
                'card_name' => $c->card_name,
                'points' => $c->points,
                'img' => $c->img,
                'text' => $c->text,
                'color' => $c->color,
                'dominant' => $c->dominant,
                'action' => $c->action,
            ])
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

        $birthOfLife = DB::table('doomlings_ages')->where('age_name', 'The Birth of Life')->first();

        $catastrophes = DB::table('doomlings_ages')
            ->where('catastrophe', 1)
            ->inRandomOrder()
            ->limit(3)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'age_name' => $a->age_name,
                'img' => $a->img,
                'text' => $a->text,
                'catastrophe' => (bool) $a->catastrophe,
                'world_end_text' => $a->World_End_text,
            ])
            ->toArray();

        $normalAges = DB::table('doomlings_ages')
            ->where('catastrophe', 0)
            ->where('age_name', '!=', 'The Birth of Life')
            ->inRandomOrder()
            ->limit(9)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'age_name' => $a->age_name,
                'img' => $a->img,
                'text' => $a->text,
                'catastrophe' => (bool) $a->catastrophe,
                'world_end_text' => $a->World_End_text,
            ])
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
            'agePile1' => $agePiles[0] ?? [],
            'agePile2' => $agePiles[1] ?? [],
            'agePile3' => $agePiles[2] ?? [],
            'discardPile' => collect($gameState['discardPile'] ?? [])->map(fn($c) => [
                'id'        => $c['id'] ?? null,
                'card_name' => $c['card_name'] ?? '',
                'color'     => $c['color'] ?? '',
                'points'    => $c['points'] ?? 0,
                'img'       => $c['img'] ?? '',
            ])->toArray(),
            'players' => $game->players->map(fn($p) => [
                'id' => (int) $p->user_id,
                'name' => $p->user?->username ?? "Player {$p->user_id}",
                'hand' => $p->hand_cards ?? [],
                'traitpool' => $p->trait_pool ?? [],
                'genepool' => (int) $p->genepool,
                'points' => (int) ($p->points ?? 0),
            ]),
        ];
    }

    private function applyAutomaticAgeEffect(string $ageName, Game $game, $playerStates, array $playerOrder, array &$deck, array &$discardPile, int $nextPlayerId = 0): void
    {
        switch ($ageName) {
            case 'Flourish':
                foreach ($playerStates as $userId => $player) {
                    $hand = $player->hand_cards ?? [];
                    $genepool = $player->genepool ?? 5;
                    $cardsToDraw = max(0, $genepool - count($hand));
                    for ($i = 0; $i < $cardsToDraw; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    for ($i = 0; $i < 2; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('game_id', $game->id)
                        ->where('user_id', $userId)
                        ->update(['hand_cards' => $hand]);
                }
                break;
            case 'Comet Showers':
                foreach ($playerStates as $userId => $player) {
                    $hand = $player->hand_cards ?? [];
                    if (!empty($hand)) {
                        $idx = array_rand($hand);
                        $card = $hand[$idx];
                        array_splice($hand, $idx, 1);
                        $player->hand_cards = $hand;
                        if ($card['card_name'] !== 'Endurance') {
                            $discardPile[] = $card;
                        }
                        GamePlayer::where('game_id', $game->id)
                            ->where('user_id', $userId)
                            ->update(['hand_cards' => $hand]);
                    }
                }
                break;
            case 'Birth of a Hero':
                foreach ($playerStates as $userId => $player) {
                    $hand = $player->hand_cards ?? [];
                    $heroicIdx = collect($hand)->search(fn($c) => $c['card_name'] === 'Heroic');
                    if ($heroicIdx !== false) {
                        $heroic = $hand[$heroicIdx];
                        array_splice($hand, $heroicIdx, 1);
                        $traitPool = $player->trait_pool ?? [];
                        $traitPool[] = $heroic;
                        $points = collect($traitPool)->sum('points');
                        $player->hand_cards = $hand;
                        $player->trait_pool = $traitPool;
                        GamePlayer::where('game_id', $game->id)
                            ->where('user_id', $userId)
                            ->update([
                                'hand_cards' => $hand,
                                'trait_pool' => $traitPool,
                                'points' => $points,
                            ]);
                    }
                }
                break;

            case 'Age of Dracula':
                foreach ($playerStates as $userId => $player) {
                    $traitPool = $player->trait_pool ?? [];
                    $hasVampirism = collect($traitPool)->contains(fn($t) => $t['card_name'] === 'Vampirism');
                    $hand = $player->hand_cards ?? [];
                    if ($hasVampirism) {
                        $opponents = $playerStates->filter(fn($p, $id) => $id !== $userId);
                        $opponent = $opponents->first();
                        $opponentId = $opponents->keys()->first();
                        if ($opponent && !empty($opponent->hand_cards)) {
                            $idx = array_rand($opponent->hand_cards);
                            $stolen = $opponent->hand_cards[$idx];
                            $opponentHand = $opponent->hand_cards;
                            array_splice($opponentHand, $idx, 1);
                            $opponent->hand_cards = $opponentHand;
                            $hand[] = $stolen;
                            $player->hand_cards = $hand;
                            GamePlayer::where('game_id', $game->id)
                                ->where('user_id', $userId)
                                ->update(['hand_cards' => $hand]);
                            GamePlayer::where('game_id', $game->id)
                                ->where('user_id', $opponentId)
                                ->update(['hand_cards' => $opponentHand]);
                        }
                    } else {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                            $player->hand_cards = $hand;
                            if ($card['card_name'] !== 'Endurance') {
                                $discardPile[] = $card;
                            }
                            GamePlayer::where('game_id', $game->id)
                                ->where('user_id', $userId)
                                ->update(['hand_cards' => $hand]);
                        }
                    }
                }
                break;
            case 'The Messiah':
                $playerOrder = array_reverse($playerOrder);
                $nextPlayerId = $playerOrder[0];
                break;
        }
    }
    private function applyCatastropheEffect(string $ageName, $playerStates, array $playerOrder, array &$deck, array &$discardPile): void
    {
        switch ($ageName) {
            case 'The Big One':
                // -1 Gene Pool. Give 1 card to opponent on left and right.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    GamePlayer::where('user_id', $userId)->update(['genepool' => $player->genepool]);
                }
                // Pass 1 card to each neighbour
                $orderKeys = array_values($playerOrder);
                $count = count($orderKeys);
                foreach ($orderKeys as $i => $userId) {
                    $player = $playerStates[$userId];
                    $hand = $player->hand_cards ?? [];
                    if (empty($hand)) continue;
                    $leftId = $orderKeys[($i - 1 + $count) % $count];
                    $rightId = $orderKeys[($i + 1) % $count];
                    // Give leftmost card to left, rightmost to right
                    $leftCard = array_shift($hand);
                    $rightCard = array_pop($hand);
                    $player->hand_cards = $hand;
                    if ($leftCard) {
                        $leftHand = $playerStates[$leftId]->hand_cards ?? [];
                        $leftHand[] = $leftCard;
                        $playerStates[$leftId]->hand_cards = $leftHand;
                    }
                    if ($rightCard) {
                        $rightHand = $playerStates[$rightId]->hand_cards ?? [];
                        $rightHand[] = $rightCard;
                        $playerStates[$rightId]->hand_cards = $rightHand;
                    }
                }
                foreach ($playerStates as $userId => $player) {
                    GamePlayer::where('user_id', $userId)->update(['hand_cards' => $player->hand_cards]);
                }
                break;

            case 'Deus Ex Machina':
                // +0 Gene Pool. Stabilize
                foreach ($playerStates as $userId => $player) {
                    $hand = $player->hand_cards ?? [];
                    $genepool = $player->genepool ?? 5;
                    $cardsToDraw = max(0, $genepool - count($hand));
                    for ($i = 0; $i < $cardsToDraw; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update(['hand_cards' => $hand]);
                }
                break;

            case 'Overpopulation':
                // +1 Gene Pool. Draw 1 card per color type in trait pile.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool += 1;
                    $colors = collect($player->trait_pool ?? [])->pluck('color')->unique()->count();
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < $colors; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Glacial Meltdown':
                // -1 Gene Pool. Discard 2 random hand cards.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < 2; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Ice Age':
                // -1 Gene Pool. Discard 1 hand card per red trait in trait pile.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $redCount = collect($player->trait_pool ?? [])->filter(fn($t) => $t['color'] === 'Red')->count();
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < $redCount; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Mega Tsunami':
                // -1 Gene Pool. Pass hand to the right.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    GamePlayer::where('user_id', $userId)->update(['genepool' => $player->genepool]);
                }
                $hands = collect($playerOrder)->map(fn($id) => $playerStates[$id]->hand_cards ?? [])->toArray();
                $last = array_pop($hands);
                array_unshift($hands, $last);
                foreach ($playerOrder as $i => $userId) {
                    $playerStates[$userId]->hand_cards = $hands[$i];
                    GamePlayer::where('user_id', $userId)->update(['hand_cards' => $hands[$i]]);
                }
                break;

            case 'The Four Horsemen':
                // -1 Gene Pool. Discard 1 random trait.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $traitPool = $player->trait_pool ?? [];
                    if (!empty($traitPool)) {
                        $idx = array_rand($traitPool);
                        $card = $traitPool[$idx];
                        array_splice($traitPool, $idx, 1);
                        if ($card['card_name'] !== 'Endurance') $discardPile[] = $card;
                        $player->trait_pool = $traitPool;
                    }
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'trait_pool' => $traitPool,
                        'points' => collect($traitPool)->sum('points'),
                    ]);
                }
                break;

            case 'Grey Goo':
                // +0 Gene Pool. Discard entire hand and stabilize.
                foreach ($playerStates as $userId => $player) {
                    $hand = $player->hand_cards ?? [];
                    foreach ($hand as $handCard) {
                        $discardPile[] = $handCard;
                    }
                    $hand = [];
                    // Stabilize — draw back up to genepool
                    $genepool = $player->genepool ?? 5;
                    for ($i = 0; $i < $genepool; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update(['hand_cards' => $hand]);
                }
                break;

            case 'Mass Extinction':
                // -1 Gene Pool. Discard 1 hand card per colorless trait in trait pile.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $colorlessCount = collect($player->trait_pool ?? [])->filter(fn($t) => $t['color'] === 'Colorless')->count();
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < $colorlessCount; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Nuclear Winter':
                // -1 Gene Pool. Stabilize. Then discard 1 hand card.
                foreach ($playerStates as $userId => $player) {
                    \Log::info('Nuclear Winter player', [
                        'userId' => $userId,
                        'handBefore' => count($player->hand_cards ?? []),
                        'genepool' => $player->genepool,
                    ]);
                    $player->genepool = max(1, $player->genepool - 1);
                    $hand = $player->hand_cards ?? [];
                    // Stabilize
                    $cardsToDraw = max(0, $player->genepool - count($hand));
                    for ($i = 0; $i < $cardsToDraw; $i++) {
                        if (empty($deck)) break;
                        $hand[] = array_shift($deck);
                    }
                    // Discard 1
                    if (!empty($hand)) {
                        $idx = array_rand($hand);
                        $card = $hand[$idx];
                        array_splice($hand, $idx, 1);
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Solar Flare':
                // -1 Gene Pool. Discard half hand rounded up.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $hand = $player->hand_cards ?? [];
                    $half = (int) ceil(count($hand) / 2);
                    for ($i = 0; $i < $half; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Super Volcano':
                // Discard 1 hand card per blue trait in trait pile.
                foreach ($playerStates as $userId => $player) {
                    $blueCount = collect($player->trait_pool ?? [])->filter(fn($t) => $t['color'] === 'Blue')->count();
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < $blueCount; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update(['hand_cards' => $hand]);
                }
                break;

            case 'AI Takeover':
                // -1 Gene Pool. Discard all but 1 card from hand.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $hand = $player->hand_cards ?? [];
                    while (count($hand) > 1) {
                        $idx = array_rand($hand);
                        $card = $hand[$idx];
                        array_splice($hand, $idx, 1);
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Pulse Event':
                // -1 Gene Pool. Discard 1 hand card per purple trait in trait pile.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $purpleCount = collect($player->trait_pool ?? [])->filter(fn($t) => $t['color'] === 'Purple')->count();
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < $purpleCount; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;

            case 'Retrovirus':
                // -1 Gene Pool. Discard 1 hand card per green trait in trait pile.
                foreach ($playerStates as $userId => $player) {
                    $player->genepool = max(1, $player->genepool - 1);
                    $greenCount = collect($player->trait_pool ?? [])->filter(fn($t) => $t['color'] === 'Green')->count();
                    $hand = $player->hand_cards ?? [];
                    for ($i = 0; $i < $greenCount; $i++) {
                        if (!empty($hand)) {
                            $idx = array_rand($hand);
                            $card = $hand[$idx];
                            array_splice($hand, $idx, 1);
                        }
                    }
                    $player->hand_cards = $hand;
                    GamePlayer::where('user_id', $userId)->update([
                        'genepool' => $player->genepool,
                        'hand_cards' => $hand,
                    ]);
                }
                break;
        }
    }
    private function applyWorldsEndScoring(Game $game, $playerStates): void
    {
        foreach ($playerStates as $userId => $player) {
            $traitPool = $player->trait_pool ?? [];
            $hand = $player->hand_cards ?? [];
            $points = collect($traitPool)->sum('points');
            $breakdown = ["Base: {$points}"];

            foreach ($traitPool as $card) {
                switch ($card['card_name']) {
                    case 'Immunity':
                        $negativeCount = collect($traitPool)->filter(fn($t) => ($t['points'] ?? 0) < 0)->count();
                        $bonus = $negativeCount * 2;
                        $points += $bonus;
                        if ($bonus) $breakdown[] = "Immunity +{$bonus} ({$negativeCount} negative traits)";
                        break;

                    case 'Tiny':
                        $penalty = count($traitPool);
                        $points -= $penalty;
                        $breakdown[] = "Tiny -{$penalty} ({$penalty} traits total)";
                        break;

                    case 'Egg Clusters':
                        $count = collect($traitPool)->filter(fn($t) => $t['color'] === 'Blue')->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Egg Clusters +{$count} ({$count} blue traits)";
                        break;

                    case 'Overgrowth':
                        $count = collect($traitPool)->filter(fn($t) => $t['color'] === 'Green')->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Overgrowth +{$count} ({$count} green traits)";
                        break;

                    case 'Heat Vision':
                        $count = collect($traitPool)->filter(fn($t) => $t['color'] === 'Red')->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Heat Vision +{$count} ({$count} red traits)";
                        break;

                    case 'Sticky Secretions':
                        $count = collect($traitPool)->filter(fn($t) => $t['color'] === 'Purple')->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Sticky Secretions +{$count} ({$count} purple traits)";
                        break;

                    case 'Mindful':
                        $count = collect($traitPool)->filter(fn($t) => $t['color'] === 'Colorless')->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Mindful +{$count} ({$count} colorless traits)";
                        break;

                    case 'Pollination':
                        $count = collect($traitPool)->filter(fn($t) => ($t['points'] ?? 0) === 1)->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Pollination +{$count} ({$count} 1-point traits)";
                        break;

                    case 'Fortunate':
                        $count = count($hand);
                        $points += $count;
                        if ($count) $breakdown[] = "Fortunate +{$count} ({$count} cards in hand)";
                        break;

                    case 'Gratitude':
                        $count = collect($traitPool)->pluck('color')->unique()->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Gratitude +{$count} ({$count} unique colors)";
                        break;

                    case 'Altruistic':
                        $genepool = $player->genepool ?? 5;
                        $points += $genepool;
                        $breakdown[] = "Altruistic +{$genepool} (genepool size)";
                        break;

                    case 'Random Fertilization':
                        $genepool = $player->genepool ?? 5;
                        $points += $genepool;
                        $breakdown[] = "Random Fertilization +{$genepool} (genepool size)";
                        break;

                    case 'Camouflage':
                        $genepool = $player->genepool ?? 5;
                        $points += $genepool;
                        $breakdown[] = "Camouflage +{$genepool} (genepool size)";
                        break;

                    case 'Boredom':
                        $count = collect($traitPool)->filter(fn($t) => !empty($t['text']))->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Boredom +{$count} ({$count} traits with text)";
                        break;

                    case 'Saudade':
                        $count = collect($hand)->pluck('color')->unique()->count();
                        $points += $count;
                        if ($count) $breakdown[] = "Saudade +{$count} ({$count} unique colors in hand)";
                        break;

                    case 'Apex Predator':
                        $myCount = count($traitPool);
                        $mostTraits = true;
                        foreach ($playerStates as $otherId => $other) {
                            if ($otherId !== $userId && count($other->trait_pool ?? []) > $myCount) {
                                $mostTraits = false;
                                break;
                            }
                        }
                        if ($mostTraits) {
                            $points += 4;
                            $breakdown[] = "Apex Predator +4 (most traits)";
                        }
                        break;

                    case 'Brave':
                        $dominantCount = collect($traitPool)->filter(fn($t) => !empty($t['dominant']))->count();
                        $bonus = $dominantCount * 2;
                        $points += $bonus;
                        if ($bonus) $breakdown[] = "Brave +{$bonus} ({$dominantCount} dominant traits)";
                        break;

                    case 'Symbiosis':
                        $colorCounts = collect($traitPool)->groupBy('color')->map->count();
                        $max = $colorCounts->max() ?? 0;
                        $points += $max;
                        if ($max) $breakdown[] = "Symbiosis +{$max} (largest color group)";
                        break;

                    case 'Pack Behavior':
                        $colorCounts = collect($traitPool)->groupBy('color')->map->count();
                        $bonus = $colorCounts->sum(fn($c) => (int) floor($c / 2));
                        $points += $bonus;
                        if ($bonus) $breakdown[] = "Pack Behavior +{$bonus} (floor(count/2) per color)";
                        break;

                    case 'Branches':
                        $greenCount = collect($traitPool)->filter(fn($t) => $t['color'] === 'Green')->count();
                        $bonus = (int) floor($greenCount / 2);
                        $points += $bonus;
                        if ($bonus) $breakdown[] = "Branches +{$bonus} (floor({$greenCount} green / 2))";
                        break;
                }

                if (str_starts_with($card['card_name'], 'Kidney')) {
                    $kidneysCount = collect($traitPool)->filter(fn($t) => str_starts_with($t['card_name'], 'Kidney'))->count();
                    $points += $kidneysCount;
                    $breakdown[] = "{$card['card_name']} +{$kidneysCount} ({$kidneysCount} Kidney traits)";
                }
            }

            $hasSwarm = collect($traitPool)->contains(fn($t) => str_starts_with($t['card_name'], 'Swarm'));
            if ($hasSwarm) {
                $totalSwarms = 0;
                foreach ($playerStates as $other) {
                    $totalSwarms += collect($other->trait_pool ?? [])->filter(fn($t) => str_starts_with($t['card_name'], 'Swarm'))->count();
                }
                $swarmCardsInPool = collect($traitPool)->filter(fn($t) => str_starts_with($t['card_name'], 'Swarm'))->count();
                $bonus = $swarmCardsInPool * $totalSwarms;
                $points += $bonus;
                $breakdown[] = "Swarm +{$bonus} ({$swarmCardsInPool} own x {$totalSwarms} total)";
            }

            $breakdown[] = "Final: {$points}";

            \Log::info("World's End scoring", [
                'userId' => $userId,
                'breakdown' => $breakdown,
            ]);

            GamePlayer::where('game_id', $game->id)
                ->where('user_id', $userId)
                ->update(['points' => $points]);
        }
    }
}
