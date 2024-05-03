<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\CaseStudiesController;
use App\Http\Controllers\Frontend\BlogsController;
use App\Http\Controllers\Frontend\ContactsController;
// company controllers
use App\Http\Controllers\Frontend\Company\AboutController;
use App\Http\Controllers\Frontend\Company\LeadershipController;
use App\Http\Controllers\Frontend\Company\MissionController;
use App\Http\Controllers\Frontend\Company\CareerController;
use App\Http\Controllers\Frontend\Company\FaqController;
use App\Http\Controllers\Frontend\Company\LocationsController;
use App\Http\Controllers\Frontend\Company\WhyChooseUsController;
// it services controllers
use App\Http\Controllers\Frontend\ItServices\ServicesController;
use App\Http\Controllers\Frontend\ItServices\ManagedItController;
use App\Http\Controllers\Frontend\ItServices\CloudComputingController;
use App\Http\Controllers\Frontend\ItServices\CustomSoftwareController;
use App\Http\Controllers\Frontend\ItServices\CyberSecurityController;
use App\Http\Controllers\Frontend\ItServices\ItConsultancyController;
use App\Http\Controllers\Frontend\ItServices\ItSupportController;
// industrie controlllers
use App\Http\Controllers\Frontend\Industries\BankingController;
use App\Http\Controllers\Frontend\Industries\CapitalMarketController;
use App\Http\Controllers\Frontend\Industries\EducationController;
use App\Http\Controllers\Frontend\Industries\EnterpriseTechnologyController;
use App\Http\Controllers\Frontend\Industries\HealthcareController;
use App\Http\Controllers\Frontend\Industries\IndustriesController;
use App\Http\Controllers\Frontend\Industries\LogisticsController;
use App\Http\Controllers\Frontend\Industries\ManufacturingController;

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
Route::get('/casestudies', [CaseStudiesController::class, 'index']);
Route::get('/blogs', [BlogsController::class, 'index']);
Route::get('/contacts', [ContactsController::class, 'index']);
// creating company routes
Route::get('/company/about', [AboutController::class, 'index']);
Route::get('/company/leadership', [LeadershipController::class, 'index']);
Route::get('/company/mission', [MissionController::class, 'index']);
Route::get('/company/career', [CareerController::class, 'index']);
Route::get('/company/faq', [FaqController::class, 'index']);
Route::get('/company/locations', [LocationsController::class, 'index']);
Route::get('/company/whychooseus', [WhyChooseUsController::class, 'index']);
// creating it services routes
Route::get('/itservices', [ServicesController::class, 'index']);
// creating it services - types routes
Route::get('/itservices/managedit', [ManagedItController::class, 'index']);
Route::get('/itservices/cloudcomputing', [CloudComputingController::class, 'index']);
Route::get('/itservices/customsoftware', [CustomSoftwareController::class, 'index']);
Route::get('/itservices/cybersecurity', [CyberSecurityController::class, 'index']);
Route::get('/itservices/itconsultancy', [ItConsultancyController::class, 'index']);
Route::get('/itservices/itsupport', [ItSupportController::class, 'index']);
// creating industries routes
Route::get('/industries', [IndustriesController::class, 'index']);
// creating industries and its type routes
Route::get('/industries/banking', [BankingController::class, 'index']);
Route::get('/industries/capitalmarket', [CapitalMarketController::class, 'index']);
Route::get('/industries/education', [EducationController::class, 'index']);
Route::get('/industries/enterprisetechnology', [EnterpriseTechnologyController::class, 'index']);
Route::get('/industries/healthcare', [HealthcareController::class, 'index']);
Route::get('/industries/logistics', [LogisticsController::class, 'index']);
Route::get('/industries/manufacturing', [ManufacturingController::class, 'index']);