@extends('layouts.app')

@section('ughhh')
    <div id="app"></div>
@endsection

@push('scripts')
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
@endpush
