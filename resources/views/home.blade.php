@extends('layouts.app')
<link rel="stylesheet" href="{{ asset('css/home.css') }}">

@section('ughhh')
    <div class="feed">
        <div class="feed-title">— PlayPlex —</div>

        <div class="game-grid">

            @foreach ($games as $game)
                <div class="game-card" style="background-image: url('{{ asset('assets/thumbnails/' . $game->thumbnail) }}')">
                    <div class="pixel-border-left"></div>
                    <div class="card-main">
                        <div class="hover-text game-title">★ {{ $game->title }} ★</div>
                    </div>
                </div>
            @endforeach

            <div class="card-cta">
                <a href="{{ route('doomling') }}" class="play-btn">PLAY ▶</a>
            </div>


        </div>

    </div>
@endsection

{{-- <div class="card-cta">
                <a href="{{ route('doomling') }}" class="play-btn">PLAY ▶</a>
            </div> --}}
