@extends('frontend.layouts.main')

@section('main-section')
<div id="site-content" class="site-content">
				<div id="content-body" class="content-body">
					<div class="content-body-inner wrap">
						<!-- The main content -->
						<main id="main-content" class="main-content" itemprop="mainContentOfPage">
							<div class="main-content-inner">
								<div class="content">
									<section  class="vc_section vc_custom_1575621496598 vc_section-has-fill">
										<div 
											class="vc_row wpb_row vc_row-fluid vc_custom_1575621503753 vc_row-has-fill">
											<div class="row-inner">
												<div class="wpb_column vc_column_container vc_col-sm-2">
													<div class="vc_column-inner">
														<div class="wpb_wrapper"></div>
													</div>
												</div>
												<div class="wpb_column vc_column_container vc_col-sm-8">
													<div class="vc_column-inner">
														<div class="wpb_wrapper">
															<div
																class="vc_icon_element vc_icon_element-outer vc_icon_element-align-center">
																<div
																	class="vc_icon_element-inner vc_icon_element-color-white vc_icon_element-size-xl vc_icon_element-style- vc_icon_element-background-color-grey">
																	<span
																		class="vc_icon_element-icon entypo-icon entypo-icon-chat"></span>
																</div>
															</div>
															<div class="vc_row wpb_row vc_inner vc_row-fluid">
																<div class="wpb_column vc_column_container vc_col-sm-2">
																	<div class="vc_column-inner">
																		<div class="wpb_wrapper"></div>
																	</div>
																</div>
																<div class="wpb_column vc_column_container vc_col-sm-8">
																	<div class="vc_column-inner">
																		<div class="wpb_wrapper">
																			<h2 style="color: #ffffff;text-align: center"
																				class="vc_custom_heading text-shadow">What
																				are you looking for?
																			</h2>
																			<div class="vc_empty_space"
																				style="height: 10px"><span
																				class="vc_empty_space_inner"></span>
																			</div>
																			<div style="color: rgba(255,255,255,0.9);text-align: center"
																				class="vc_custom_heading">Find answers and
																				solutions to common IT issues. If you cant
																				find an answer, contact us and we will be
																				happy to help.
																			</div>
																		</div>
																	</div>
																</div>
																<div class="wpb_column vc_column_container vc_col-sm-2">
																	<div class="vc_column-inner">
																		<div class="wpb_wrapper"></div>
																	</div>
																</div>
															</div>
															<div class="vc_empty_space" style="height: 40px"><span
																class="vc_empty_space_inner"></span></div>
															<div class="vc_wp_search wpb_content_element faq">
																<div class="widget widget_search">
																	<form role="search" method="get" class="search-form"
																		action="https://live.21lab.co/nanosoft/">
																		<label>
																		<span class="screen-reader-text">Search
																		for:</span>
																		<input type="search" class="search-field"
																			placeholder="Search &hellip;" value=""
																			name="s" />
																		</label>
																		<input type="submit" class="search-submit"
																			value="Search" />
																	</form>
																</div>
															</div>
															<div class="vc_empty_space" style="height: 30px"><span
																class="vc_empty_space_inner"></span></div>
															<div style="font-size: 14px;color: rgba(255,255,255,0.9);text-align: center"
																class="vc_custom_heading">Please call our office at
																712-819-5555 or email us with your question
															</div>
														</div>
													</div>
												</div>
												<div class="wpb_column vc_column_container vc_col-sm-2">
													<div class="vc_column-inner">
														<div class="wpb_wrapper"></div>
													</div>
												</div>
											</div>
										</div>
									</section>
									<div  class="vc_row wpb_row vc_row-fluid">
										<div class="row-inner">
											<div
												class="wpb_column vc_column_container vc_col-sm-12 vc_hidden-sm vc_hidden-xs">
												<div class="vc_column-inner">
													<div class="wpb_wrapper">
														<div class="wpb_widgetised_column wpb_content_element">
															<div class="wpb_wrapper">
																<div id="nav_menu-6"
																	class="widget-odd widget-last widget-first widget-1 fixed-menu widget widget_nav_menu">
																	<h3 class="widget-title">Company</h3>
																	<div class="menu-company-container">
																		<ul id="menu-company" class="menu">
																			<li id="menu-item-823" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-823">
																				<a href="{{url('/company/about')}}" aria-current="page" data-ps2id-api="true">About</a>
																			</li>
																			<li id="menu-item-826" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-826">
																				<a href="{{url('/company/leadership')}}" data-ps2id-api="true">Leadership</a>
																			</li>
																			<li id="menu-item-828" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-828">
																				<a href="{{url('/company/mission')}}" data-ps2id-api="true">Mission</a>
																			</li>
																			<li id="menu-item-824" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-824">
																				<a href="{{url('/company/career')}}" data-ps2id-api="true">Careers</a>
																			</li>
																			<li id="menu-item-825" class="menu-item menu-item-type-post_type menu-item-object-page current-menu-item page_item page-item-697 current_page_item menu-item-825">
																				<a href="#" aria-current="page" data-ps2id-api="true">FAQ</a>
																			</li>
																			<li id="menu-item-827" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-827">
																				<a href="{{url('/company/locations')}}" data-ps2id-api="true">Locations</a>
																			</li>
																			<li id="menu-item-829" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-829">
																				<a href="{{url('/company/whychooseus')}}" data-ps2id-api="true">Why Choose Us</a>
																			</li>
																		</ul>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div  class="vc_row wpb_row vc_row-fluid vc_custom_1575621518082">
										<div class="row-inner">
											<div class="wpb_column vc_column_container vc_col-sm-12">
												<div class="vc_column-inner">
													<div class="wpb_wrapper">
														<h3 style="text-align: center" class="vc_custom_heading">Top ten
															most popular FAQs
														</h3>
														<div class="vc_empty_space" style="height: 40px"><span
															class="vc_empty_space_inner"></span></div>
														<div class="vc_row wpb_row vc_inner vc_row-fluid">
															<div class="wpb_column vc_column_container vc_col-sm-6">
																<div class="vc_column-inner">
																	<div class="wpb_wrapper">
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>Are free Anti-Virus software any good?
																				</h4>
																				<i class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>First and foremost, you never want to go
																					without security protection on your
																					computer. Free Anti-Virus has very low
																					detection rates. Give us a call and we
																					will be happy to inform you of the
																					latest security software we recommend
																					and sell to all our clients for Spyware,
																					Malware and Virus protection.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What exactly are Managed IT Services?
																				</h4>
																				<i class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>Simply put, NanoSoft Managed IT Services
																					means we take care of your entire
																					information technology requirement. We
																					manage all your hardware and software
																					sourcing, installation, technical
																					support, and IT staffing needs. It also
																					means NanoSoft acts as your go-to
																					consultancy and support team, providing
																					scheduled maintenance and upgrading of
																					your systems, along with emergency
																					assistance to keep your business up and
																					running.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What is cloud backup?</h4>
																				<i
																					class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>Cloud backup also known as Online Backup
																					is the process where your onsite backups
																					are transferred to an offsite server
																					every night. The server is located in a
																					secure data centre in Perth. Cloud
																					Backup replaces the need for someone to
																					take a backup home each night. It is
																					more secure, reliable and easier to
																					manage and monitor.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What kind of response times can I
																					expect?
																				</h4>
																				<i
																					class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>We work with each client to establish
																					specific expectations. Our measurable
																					service levels specify clear
																					consequences for not living up to
																					agreed-upon expectations.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>How Long is a Managed Services Contract
																					For?
																				</h4>
																				<i class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<div class="panel-heading">
																					<div class="fusion-toggle-heading">
																						<div
																							class="panel-body toggle-content post-content">
																							<p>Managed IT Services Contracts
																								vary by provider. Some
																								providers offer
																								month-to-month programs,
																								while others require a
																								multi-year contract. Some
																								have a very high startup
																								cost and lower monthly,
																								while others require a
																								multi-year contract. Some
																								have a very high startup
																								cost and lower monthly,
																								while others offer a middle
																								of the road monthly cost and
																								spread the cost of startup
																								over the term of the
																								agreement.
																							</p>
																						</div>
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
															<div class="wpb_column vc_column_container vc_col-sm-6">
																<div class="vc_column-inner">
																	<div class="wpb_wrapper">
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What should I do before I call for help?
																				</h4>
																				<i class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>When possible, write down any information
																					about error messages and take screen
																					shots your issue. Next, attempt to
																					recreate the issue. Often times, it
																					helps to close the program and restart
																					the computer to reset the system, and
																					possibly resolve the problem.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What does having Managed IT Services
																					cost?
																				</h4>
																				<i class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>Our service model uses a fixed monthly
																					fee, which is based on the size and
																					complexity of your particular network.
																					Once contracted, your Managed IT
																					Services will cover maintenance and
																					support for every component of your
																					network, providing you with peace of
																					mind and the ability to accurately
																					forecast your IT maintenance costs.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What if we already have an internal IT
																					department?
																				</h4>
																				<i
																					class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>No problem! We offer scalable solutions
																					that can be tailored to meet your
																					specific needs. Whether you need a full
																					package of managed IT services and
																					consulting, security solutions or
																					service desk support, NanoSoft makes it
																					simple with an affordable and customized
																					flat rate service plan.
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>How does a flat rate billing save me
																					money?
																				</h4>
																				<i
																					class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>Flat-rate billing gives you the ability
																					to budget your IT expenses so you can
																					better focus on your core business
																					goals. We customize each service package
																					for your unique business, so you only
																					pay for what you need. NanoSoft serves
																					as your “one stop shop” for all your
																					managed IT services needs. And we do it
																					all for one fixed monthly cost – We
																					Don’t Profit from your Pain!
																				</p>
																			</div>
																		</div>
																		<div
																			class="vc_toggle vc_toggle_default vc_toggle_color_default  vc_toggle_size_md">
																			<div class="vc_toggle_title">
																				<h4>What types of systems do you support?
																				</h4>
																				<i class="vc_toggle_icon"></i>
																			</div>
																			<div class="vc_toggle_content">
																				<p>We pride ourselves on being “ecosystem
																					agnostic”: whether you use Google Apps
																					or Office365, Windows or Mac, Android or
																					iOS, we will support your team.  Need to
																					install a server onsite or host one
																					virtually on Amazon or Azure? We will
																					support you.  Need to transition from
																					one ecosystem to another?  We’ll be
																					there for you.
																				</p>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<div class="vc_empty_space" style="height: 30px"><span
															class="vc_empty_space_inner"></span></div>
														<div class="wpb_text_column wpb_content_element ">
															<div class="wpb_wrapper">
																<p style="text-align: center;">Couldn&#8217;t find your
																	answer? <a class="dot"
																		href="../contact-us/index.html">Ask a question</a>
																</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<!-- /.content -->
							</div>
							<!-- /.main-content-inner -->
						</main>
						<!-- /.main-content -->
					</div>
					<!-- /.content-body-inner -->
				</div>
				<!-- /.content-body -->
			</div>
            @endsection