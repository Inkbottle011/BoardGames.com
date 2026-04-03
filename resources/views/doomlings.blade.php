@extends('layouts.app')

@push('styles')
    <link href="{{ asset('css/doomlings.css') }}" rel="stylesheet" />
@endpush

@section('ughhh')
    <div id="app" class="w-screen h-screen" data-user-id="{{ auth()->id() }}" data-game-id="{{ request()->segment(2) }}">
    </div>
@endsection

@push('scripts')
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
@endpush
