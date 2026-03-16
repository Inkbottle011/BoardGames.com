@extends('layouts.app')

@section('ughhh')
        <!-- Page header with logo and tagline-->
        <header class="py-5 bg-light border-bottom mb-4">
            <div class="container">
                <div class="text-center my-5">
                    <h1 class="fw-bolder">PlayPlex</h1>
                    <p class="lead mb-0">Online Board Games</p>
                </div>
            </div>
        </header>
        <!-- Page content-->
        <div class="container">
            <div class="row" style="flex-wrap: wrap;">
                <!-- Blog entries--> 
                
                <div class="col-lg-8">
        
                    <!-- Nested row for non-featured blog posts-->
                    <div class="row" >
                       
                        <div class="col-lg-6">
                            <!-- Blog post-->
                            <div class="card mb-4">
                                <a href="#!"><img class="card-img-top" src="https://dummyimage.com/700x350/dee2e6/6c757d.jpg" alt="..." /></a>
                                <div class="card-body">
                                    <div class="small text-muted">Strategy Card Game</div>
                                    <h2 class="card-title h4">Doomlings</h2>
                                    <p class="card-text">Build the highest-scoring species before the world ends. 2-4 players</p>
                                    <a class="btn btn-primary" href="{{ route('doomling') }}">Play →</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <!-- Blog post-->
                            <div class="card mb-4">
                                <a href="#!"><img class="card-img-top" src="https://dummyimage.com/700x350/dee2e6/6c757d.jpg" alt="..." /></a>
                                <div class="card-body">
                                    <div class="small text-muted">January 1, 2023</div>
                                    <h2 class="card-title h4">Post Title</h2>
                                    <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis aliquid atque, nulla? Quos cum ex quis soluta, a laboriosam.</p>
                                    <a class="btn btn-primary" href="#!">Read more →</a>
                                </div>
                            </div>
                        </div> 
                    </div>
                </div>
                <!-- Side widgets-->
                <div class="col-lg-4">
                    <!-- Search widget-->
                    {{-- <div class="card mb-4">
                        <div class="card-header">Search</div>
                        <div class="card-body">
                            <div class="input-group">
                                <input class="form-control" type="text" placeholder="Enter search term..." aria-label="Enter search term..." aria-describedby="button-search" />
                                <button class="btn btn-primary" id="button-search" type="button">Go!</button>
                            </div>
                        </div>
                    </div> --}}
                    <!-- Categories widget-->
                    <div class="card mb-4">
                        <div class="card-header">Categories</div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <ul class="list-unstyled mb-0">
                                        {{-- <li><a href="#!">Web Design</a></li>
                                        <li><a href="#!">HTML</a></li>
                                        <li><a href="#!">Freebies</a></li> --}}
                                        {{-- @foreach($categories as $category)
                                            <li><a href="{{route('home')}}?category_id={{$category->id}}">{{$category->name}}</a></li>
                                        @endforeach --}}
                                    </ul>
                                </div>
                                {{-- <div class="col-sm-6">
                                    <ul class="list-unstyled mb-0">
                                        <li><a href="#!">JavaScript</a></li>
                                        <li><a href="#!">CSS</a></li>
                                        <li><a href="#!">Tutorials</a></li>
                                    </ul>
                                </div> --}}
                            </div>
                        </div>
                    </div>
                    <!-- Side widget-->
                </div>
            </div>
        </div>
       
@endsection
