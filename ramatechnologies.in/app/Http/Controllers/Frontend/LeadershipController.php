<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LeadershipController extends Controller
{
    public function index() 
    {
        return view('frontend.company.leadership');
    }
}
