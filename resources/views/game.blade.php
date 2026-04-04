@extends('layouts.app')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/doomlings.css') }}" />
    <link rel="stylesheet" href="/css/app.css">
    <link rel="stylesheet" href="{{ asset('css/waiting-room.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/chat.css') }}">
    <style>
        .scanlines {
            display: none !important;
        }
    </style>
@endpush

@section('ughhh')
    @if ($game->status === 'waiting')
        {{-- Waiting Room --}}
        <div class="waiting-room">
            <div>
                <div class="waiting-code-label">GAME CODE</div>
                <div class="waiting-code">{{ $game->slug }}</div>
            </div>

            <p class="waiting-title">Waiting for players
                <span class="waiting-dots" style="display:inline-flex; margin-left:8px;">
                    <span class="waiting-dot"></span>
                    <span class="waiting-dot"></span>
                    <span class="waiting-dot"></span>
                </span>
            </p>

            {{-- Player slots --}}
            <div class="player-list">
                @for ($i = 0; $i < $game->max_players; $i++)
                    @php $player = $game->players->get($i); @endphp
                    @if ($player)
                        <div class="player-slot filled">
                            <span class="slot-number">{{ $i + 1 }}</span>
                            <span class="slot-name">{{ $player->user->username }}</span>
                            @if ($player->seat === 1)
                                <span class="host-badge">HOST</span>
                            @endif
                        </div>
                    @else
                        <div class="player-slot empty">
                            <span class="slot-number">{{ $i + 1 }}</span>
                            <span class="slot-empty-text">waiting...</span>
                        </div>
                    @endif
                @endfor
            </div>

            {{-- Start button — only for host --}}
            @if ($game->players->firstWhere('seat', 1)?->user_id === auth()->id())
                <form method="POST" action="/game/{{ $game->slug }}/start">
                    @csrf
                    <button class="start-btn" type="submit" {{ $game->players->count() < 2 ? 'disabled' : '' }}>
                        {{ $game->players->count() < 2 ? 'NEED MORE PLAYERS' : '▶ START GAME' }}
                    </button>
                </form>
            @else
                <p
                    style="font-family: var(--font-pixel); font-size: 0.5rem; color: rgba(255,255,255,0.3); letter-spacing: 0.1em;">
                    WAITING FOR HOST TO START
                </p>
            @endif

            {{-- Leave button --}}
            <form method="POST" action="/game/{{ $game->slug }}/leave">
                @csrf
                <button class="btn-arcade" type="submit" style="font-size:0.5rem;">✕ LEAVE GAME</button>
            </form>
        </div>

        {{-- Auto refresh every 5 seconds to show new players --}}
        <script>
            const currentStatus = '{{ $game->status }}';
            let isReloading = false;

            setInterval(function() {
                fetch('/game/{{ $game->slug }}', {
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        },
                        credentials: 'include',
                    })
                    .then(res => {
                        if (res.status === 404) {
                            window.location.href = '/lobby';
                            return null;
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (!data) return;
                        if (data.status !== currentStatus || data.players.length !==
                            {{ $game->players->count() }}) {
                            isReloading = true;
                            window.location.reload();
                        }
                    })
                    .catch(() => {});
            }, 5000);

            setInterval(function() {
                fetch('/game/{{ $game->slug }}/heartbeat', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
            }, 30000);
        </script>
    @else
        {{-- Active Game — load React --}}
        <div id="app" class="w-screen h-screen" data-user-id="{{ auth()->id() }}"
            data-game-id="{{ $game->id }}" data-game-slug="{{ $game->slug }}"></div>
    @endif
@endsection

@push('scripts')
    @if ($game->status !== 'waiting')
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
    @endif
@endpush
