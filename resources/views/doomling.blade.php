@extends('layouts.app')

@section('ughhh')
    <div id="app" class="w-screen h-screen"></div>
@endsection

@push('scripts')
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
@endpush
