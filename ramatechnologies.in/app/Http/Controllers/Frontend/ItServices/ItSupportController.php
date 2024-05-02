<?php

namespace App\Http\Controllers\Frontend\ItServices;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ItSupportController extends Controller
{
    public function index()
    {
        return view('frontend.itsolutions.itservices.itsupport');
    }
}
