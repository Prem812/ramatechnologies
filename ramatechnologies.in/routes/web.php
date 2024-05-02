<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\HomeController;
// company controllers
use App\Http\Controllers\Frontend\AboutController;
use App\Http\Controllers\Frontend\LeadershipController;
use App\Http\Controllers\Frontend\MissionController;
use App\Http\Controllers\Frontend\CareerController;
use App\Http\Controllers\Frontend\FaqController;
use App\Http\Controllers\Frontend\LocationsController;
use App\Http\Controllers\Frontend\WhyChooseUsController;
// it services controllers
use App\Http\Controllers\Frontend\ItServices\ServicesController;
use App\Http\Controllers\Frontend\ItServices\ManagedItController;
use App\Http\Controllers\Frontend\ItServices\CloudComputingController;
use App\Http\Controllers\Frontend\ItServices\CustomSoftwareController;
use App\Http\Controllers\Frontend\ItServices\CyberSecurityController;
use App\Http\Controllers\Frontend\ItServices\ItConsultancyController;
use App\Http\Controllers\Frontend\ItServices\ItSupportController;

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
// creating company routes
Route::get('/company/about', [AboutController::class, 'index']);
Route::get('/company/leadership', [LeadershipController::class, 'index']);
Route::get('/company/mission', [MissionController::class, 'index']);
Route::get('/company/career', [CareerController::class, 'index']);
Route::get('/company/faq', [FaqController::class, 'index']);
Route::get('/company/locations', [LocationsController::class, 'index']);
Route::get('/company/whychooseus', [WhyChooseUsController::class, 'index']);
// creating it services routes
Route::get('/itservices/services', [ServicesController::class, 'index']);
Route::get('/itservices/managedit', [ManagedItController::class, 'index']);
Route::get('/itservices/cloudcomputing', [CloudComputingController::class, 'index']);
Route::get('/itservices/customsoftware', [CustomSoftwareController::class, 'index']);
Route::get('/itservices/cybersecurity', [CyberSecurityController::class, 'index']);
Route::get('/itservices/itconsultancy', [ItConsultancyController::class, 'index']);
Route::get('/itservices/itsupport', [ItSupportController::class, 'index']);
