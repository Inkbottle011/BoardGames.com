@extends('layouts.app')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/authentification.css') }}" />
@endpush

@section('ughhh')
    <div class="feed">
        <div class="feed-title">— PlayPlex —</div>

        {{-- Error messages --}}
        @if ($errors->any())
            <p style="color: var(--arcade-pink); font-size: 0.75rem; margin-bottom: 1rem;">
                {{ $errors->first() }}
            </p>
        @endif

        {{-- LOGIN FORM --}}
        <form method="POST" action="/profile/login" id="loginForm">
            @csrf
            <div class="logBox">
                <div class="authButtons login">Log In</div>
                <input class="authFills" type="text" name="username" placeholder="Username" />
                <input class="authFills" type="password" name="password" placeholder="Password" />
                <button class="authButtons play" type="submit">▶ Play</button>
                <div class="authSwitch">No account? <span onclick="toggleForms()">Register</span></div>
            </div>
        </form>

        {{-- REGISTER FORM --}}
        <form method="POST" action="/profile/register" id="registerForm" style="display:none;">
            @csrf
            <div class="logBox">
                <div class="authButtons login">Register</div>
                <input class="authFills" type="text" name="username" placeholder="Username" />
                <input class="authFills" type="email" name="email" placeholder="Email" />
                <input class="authFills" type="password" name="password" placeholder="Password" />
                <input class="authFills" type="password" name="password_confirmation" placeholder="Confirm Password" />
                <button class="authButtons play" type="submit">▶ Join</button>
                <div class="authSwitch">Have an account? <span onclick="toggleForms()">Log In</span></div>
            </div>
        </form>
    </div>

    <script>
        function toggleForms() {
            const login = document.getElementById('loginForm');
            const register = document.getElementById('registerForm');
            login.style.display = login.style.display === 'none' ? 'block' : 'none';
            register.style.display = register.style.display === 'none' ? 'block' : 'none';
        }
    </script>
@endsection
