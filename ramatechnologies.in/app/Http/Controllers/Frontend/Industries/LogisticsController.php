<?php

namespace App\Http\Controllers\Frontend\Industries;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogisticsController extends Controller
{
    public function index()
    {
        return view('frontend.itsolutions.industries.logistics');
    }
}
