<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\AboutController;
use App\Http\Controllers\Frontend\LeadershipController;
use App\Http\Controllers\Frontend\MissionController;
use App\Http\Controllers\Frontend\CareerController;
use App\Http\Controllers\Frontend\FaqController;
use App\Http\Controllers\Frontend\LocationsController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/', [HomeController::class, 'index']);
Route::get('/about', [AboutController::class, 'index']);
Route::get('/leadership', [LeadershipController::class, 'index']);
Route::get('/mission', [MissionController::class, 'index']);
Route::get('/career', [CareerController::class, 'index']);
Route::get('/faq', [FaqController::class, 'index']);
Route::get('/locations', [LocationsController::class, 'index']);
