@extends('layouts.app')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/lobby.css') }}" />
@endpush

@section('ughhh')
    <div class="feed">
        <div class="feed-title">— Lobby —</div>

        {{-- Create game form --}}
        <form method="POST" action="/lobby/create" class="create-form">
            @csrf
            <select name="visibility" class="authFills" style="width:auto; padding: 8px 12px;">
                <option value="public">🌐 Public</option>
                <option value="private">🔒 Private</option>
            </select>
            <select name="max_players" class="authFills" style="width:auto; padding: 8px 12px;">
                <option value="2">2 Players</option>
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
            </select>
            <input class="authFills" type="password" name="password" placeholder="Password (private only)"
                style="width: 200px;" />
            <button class="btn-arcade" type="submit">▶ Create Game</button>
        </form>

        {{-- Error message --}}
        @if (session('error'))
            <p style="color: var(--arcade-pink); margin-top: 1rem; font-size: 0.85rem;">⚠ {{ session('error') }}</p>
        @endif

        {{-- Filter buttons --}}
        <div class="lobby-filter">
            <button class="filter-btn active" onclick="filterGames('all', this)">ALL</button>
            <button class="filter-btn" onclick="filterGames('public', this)">🌐 PUBLIC</button>
            <button class="filter-btn" onclick="filterGames('private', this)">🔒 PRIVATE</button>
            <span id="refresh-indicator">↻ refreshing...</span>
        </div>

        {{-- Games list --}}
        <div class="lobby-grid" id="games-list">
            @forelse($games as $game)
                @php
                    $isYourGame = $game->players->contains('user_id', auth()->id());
                    $host = $game->players->firstWhere('seat', 1)?->user;
                    $playerCount = $game->players->count();
                    $maxPlayers = $game->max_players ?? 4;
                @endphp

                <div class="arcade-card lobby-card" data-visibility="{{ $game->visibility }}">
                    <div class="lobby-card-left">
                        <div class="lobby-game-title">
                            GAME #{{ $game->id }}
                            @if ($isYourGame)
                                <span class="badge-your-game">YOUR GAME</span>
                            @endif
                            @if ($game->visibility === 'private')
                                <span class="badge-private">🔒 PRIVATE</span>
                            @endif
                        </div>

                        {{-- Host name --}}
                        <div class="lobby-host">
                            Host: <span>{{ $host?->username ?? 'Unknown' }}</span>
                        </div>

                        {{-- Player dots --}}
                        <div class="player-dots">
                            @for ($i = 0; $i < $maxPlayers; $i++)
                                <div class="dot {{ $i < $playerCount ? 'filled' : 'empty' }}"></div>
                            @endfor
                            <span style="font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-left: 6px;">
                                {{ $playerCount }}/{{ $maxPlayers }}
                            </span>
                        </div>
                    </div>

                    <div class="lobby-right">
                        @if ($isYourGame)
                            <a href="/game/{{ $game->id }}" class="btn-arcade">ENTER ▶</a>
                        @else
                            <form method="POST" action="/lobby/join/{{ $game->slug }}"
                                style="display:flex; gap:8px; align-items:center;">
                                @csrf
                                @if ($game->visibility === 'private')
                                    <input class="authFills" type="password" name="password" placeholder="Password"
                                        style="width: 130px; padding: 6px 10px; font-size: 0.75rem;" />
                                @endif
                                <button class="btn-arcade" type="submit"
                                    {{ $playerCount >= $maxPlayers ? 'disabled' : '' }}>
                                    {{ $playerCount >= $maxPlayers ? 'FULL' : 'JOIN ▶' }}
                                </button>
                            </form>
                        @endif
                    </div>
                </div>
            @empty
                <div class="lobby-empty">No open games. Create one!</div>
            @endforelse
        </div>
    </div>

    <script>
        // Filter games by visibility
        function filterGames(type, btn) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.lobby-card').forEach(card => {
                if (type === 'all' || card.dataset.visibility === type) {
                    card.parentElement.style.display = 'block';
                } else {
                    card.parentElement.style.display = 'none';
                }
            });
        }

        // Auto-refresh lobby every 10 seconds
        let countdown = 10;
        const indicator = document.getElementById('refresh-indicator');

        setInterval(() => {
            countdown--;
            indicator.textContent = `↻ refresh in ${countdown}s`;
            if (countdown <= 0) {
                window.location.reload();
            }
        }, 1000);
    </script>
@endsection
