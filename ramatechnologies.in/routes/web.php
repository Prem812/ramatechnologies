<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\AboutController;
use App\Http\Controllers\Frontend\LeadershipController;
use App\Http\Controllers\Frontend\MissionController;
use App\Http\Controllers\Frontend\CareerController;
use App\Http\Controllers\Frontend\FaqController;
use App\Http\Controllers\Frontend\LocationsController;
use App\Http\Controllers\Frontend\WhyChooseUsController;
// it services controllers
use App\Http\Controllers\Frontend\ItServices\ManagedItController;

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
Route::get('/company/about', [AboutController::class, 'index']);
Route::get('/company/leadership', [LeadershipController::class, 'index']);
Route::get('/company/mission', [MissionController::class, 'index']);
Route::get('/company/career', [CareerController::class, 'index']);
Route::get('/company/faq', [FaqController::class, 'index']);
Route::get('/company/locations', [LocationsController::class, 'index']);
Route::get('/company/whychooseus', [WhyChooseUsController::class, 'index']);
// creating it services routes
Route::get('/itservices/managedit', [ManagedItController::class, 'index']);
