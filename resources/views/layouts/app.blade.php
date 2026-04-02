<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <!-- Add this line -->
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>PlayPlex</title>
    <!-- Favicon-->
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
    <!-- Google Fonts: pixel + display -->
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap"
        rel="stylesheet" />
    <!-- Core theme CSS (includes Bootstrap)-->
    <link href="{{ asset('css/styles.css') }}" rel="stylesheet" />
    <link href="{{ asset('css/app.css') }}" rel="stylesheet" />
    @stack('styles')
</head>

<body>
    <!-- Scanline overlay -->
    <div class="scanlines" aria-hidden="true"></div>

    <!-- Responsive navbar-->
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <a class="navbar-brand" href="{{ route('home') }}">
                    <span class="brand-pixel">PLAY</span><span class="brand-accent">PLEX</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="{{ route('home') }}">Home</a></li>
                    @auth
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('profile') }}">Profile</a>
                        </li>
                        @else
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('authentication') }}">Login</a>
                        </li>
                        @endauth
                </ul>
            </div>
        </div>
    </nav>

    if : logged in show views:profile
    if not show views authentication
    <div class="largecontainer">
        @yield('ughhh')
    </div>

    <!-- Footer-->
    <footer class="py-3 site-footer">
        <div class="container">
            <p class="m-0 text-center footer-text">
                <span class="footer-pixel">© PLAYPLEX 2026</span>
                <span class="footer-blink">▮</span>
            </p>
        </div>
    </footer>

    <!-- Bootstrap core JS-->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Core theme JS-->
    <script src="{{ asset('js/scripts.js') }}"></script>
    @stack('scripts')

</body>

</html>
