@extends('layouts.app')
<link rel="stylesheet" href="{{ asset('css/home.css') }}">

@section('ughhh')
    <div class="feed">
        <div class="feed-title">— PlayPlex —</div>
        <h1>Profile</h1>

        <p>Welcome {{ auth()->user()->username }}</p>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">Logout</button>
        </form>
    </div>
@endsection

