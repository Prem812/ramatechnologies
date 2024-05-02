<?php

namespace App\Http\Controllers\Frontend\Industries;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EnterpriseTechnologyController extends Controller
{
    public function index()
    {
        return view('frontend.itsolutions.industries.enterprisetechnology');
    }
}
