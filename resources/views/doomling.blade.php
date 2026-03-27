 @extends ('layouts.game')

{{--@section('blahhh')
    <div id="app"></div>

    @vite('resources/js/app.js')

@endsection --}}

<div id="app" class="w-screen h-screen"></div>

@viteReactRefresh
@vite('resources/js/app.jsx', 'resources/css/app.css')
