<?php

namespace App\Http\Controllers\Frontend\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function index() 
    {
        return view('frontend.company.mission');
    }
}
