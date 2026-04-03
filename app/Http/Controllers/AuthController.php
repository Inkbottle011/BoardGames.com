<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
public function showLogin()
{
return view('authentification');
} 

public function login(Request $request)
{
$credentials = $request->validate([
'username' => 'required',
'password' => 'required',
]) ; 

// Debug — check if user exists
$user = \App\Models\User::where('username', $request->username)->first();
\Log::info('Login attempt', [
'username' => $request->username,
'user_found' => $user ? 'yes' : 'no',
'user_id' => $user?->id,
]);


if (Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
$request->session()->regenerate();
return redirect('/');
}

return back()->withErrors([
'username' => 'Wrong username or password.',
]); 
} 

public function register(Request $request)
{
$request->validate([
'username' => 'required|unique:users|min:3',
'email'    => 'required|email|unique:users',
'password' => 'required|min:6|confirmed',
]);

$user = User::create([
'username' => $request->username,
'email'    => $request->email,
'password' => bcrypt($request->password),
]);

Auth::login($user);
return redirect('/');
}

}
