// Applications that will be loaded in the interface

/**
 * This class contains all the common functionality for the interface.
 * All the functions and variables are in global namespace so they can be easily accessed by the various modules
 * 
 * @class Global
 */
APPS = { notepad : {name : 'notepad', title : 'OI Notepad'},
	 shoppinglist : { name : 'shoppinglist', title : 'OI Shopping List'}
};

var ua = navigator.userAgent.toLowerCase();
var isAndroid = ua.indexOf("android") > -1;

// Uncomment the line below to disable console logging
//if(window.console || console) console = {log: function() {}};

// Disable AJAX caching, since it leads to problems on webkit browsers
$.ajaxSetup({
	cache: false,
});

$(document).ajaxError(function(xhr, evt, settings) {
	if(settings.suppressErrors)
		return;
	hideThrobber();
	notify('Error performing operation', 'alert-error'); 
});

loadScripts();

head.ready(function() {
	
	// Resize UI if Window is resized
	$(window).resize(function() { resizeUI(); });
	
	$('.nav-active').show();
	$('#nav-home').parent().addClass('nav-active'); // Set home as the default active link
	$('#content-home').addClass('content-active');
	
	initialize();
	
	setupEvents();
	setupUI();
	
	//$('#nav').addClass('shown');
	
	refreshUI();
	
	$('#menuToggleSidebar, #menuToggleSidebarMobile, #sidebar-toggle button').click(function() {
		toggleSidebar();
	});
	
	if(isAndroid) { // Apply Android specific stuff here
		// TODO: Possible fix for wild scrolling in Android. Needs more testing.
		
		/*$('input').css('outline', 'none');
		$(document).on('focus', 'input[type=text], textarea', function() {
			$(document.body).css('overflow', 'hidden');
			$(document.body).scrollTo($(this));
			$(document.body).attr('data-scroll-top', $(window).scrollTop());
		});
		$(document).on('blur', 'input[type=text], textarea', function() {
			$(document.body).css('overflow', 'auto');
			//$(window).scrollTop($(document.body).attr('data-scroll-top'));
		});*/
	}
	
	//Hide the loading screen
	$('.lightbox_bg').hide();
	$('#loading').hide();
	
});

// Provides settings retrieving and saving via cookies

var Settings = new function() {
	
	var self = this;
	
	this.get = function () {
		
		settings = {};
		data = $.cookie('OIWebClientSettings');
		
		if(data) {
			settings = $.secureEvalJSON(data);
		}
		
		return settings;
	}
	
	this.set = function (key, value) {
		settings = self.get();
		settings[key] = value;
		$.cookie('OIWebClientSettings', $.toJSON(settings));
	}
}

// Loads App scripts
function loadScripts() {
	console.log('Loading scripts');
	for(a in APPS) {
	    value = APPS[a];
	    head.js('apps/'+value['name']+'/'+value['name']+'.js')
	    //addScript('apps/'+value['name']+'/'+value['name']+'.js');
	}
}


// Initializes the interface and fetches any data from the server
// Does not do anything useful for now, just displays a simple progressbar dialog
// Also initializes settings

function initialize() {
  
	// Initialize the settings
	set = Settings.get();
	
	if(typeof set['showSidebar'] === 'undefined') {
		Settings.set('showSidebar', true);
	}
	
	if(typeof set['showApps'] === 'undefined') {
		apps = {};
		$.each(APPS, function(index, value) {
		    apps[value['name']] = true;
		});
		
		Settings.set('showApps', apps);
	}
	
	if(typeof set['theme'] === 'undefined') {
		Settings.set('theme', 'default');
	}
	
	if(typeof set['enableAnimations'] == 'undefined') {
		Settings.set('enableAnimations', true);
	}
	else if(set['enableAnimations'] == false)
		$.fx.off = true;
	
	$.each(APPS, function(index, value) {
	    //text = '<label><input id="settingShow-'+value['name']+'" type="checkbox"/>&nbsp;'+value['title']+'</input></label>';
	    //$('#settingShowApplications').append(text);
	    $('<link>').attr('rel', 'stylesheet')
	    .attr('href', 'apps/'+value['name']+'/style.css')
	    .attr('type', 'text/css')
	    .appendTo('head');
	    
	    //$.getScript('apps/'+value['name']+'/'+value['name']+'.js').done(function() { $('body').trigger(value['name']+'-initialize'); });
	});
	
	$(document.body).trigger('initialize');
}

/**
 * Append a script to the body tag
 * 
 * @method addScript
 * @param {String} url URL of the script
 */
function addScript(url){
        // add script
        var script   = document.createElement("script");
        script.type  = "text/javascript";
        script.src   = url;
        document.body.appendChild(script);

        // remove from the dom
        //document.body.removeChild(document.body.lastChild);
}

/**
 * Triggers the 'setupUI' event
 * 
 * @method setupUI
 */
function setupUI() {
	$(document.body).trigger('setupUI');
}

/**
 * Sets up events for the whole interface and sends the setupEvents trigger
 * 
 * @method setupEvents
 */
function setupEvents() {
	
	$(document).on('click', 'a[data-switch], button[data-switch]', function(event) {
		switchTo($(this).attr('data-switch'));
	});
	
	// Show settings dialog when settings menu item is clicked
	$('.showSettings').click(function() {
		$('#settings').addClass('modal');
		$('#settings').modal();
	});
	
	// Show mobile-friendly version of the settings dialog
	//TODO: Utilize the convertToModal and convertToInline functions here
	$('.showSettingsMobile').click(function() {
		if($('#settings').is(':visible')) {
			$('#settings').slideUp();
		}
		else {
			$('#settings').removeClass('modal');
			$('#settings').slideDown();
			$('#settingsClose').click(function() { $('#menu-mobile .nav-collapse').collapse('hide'); $('#settings').slideUp(); $(this).off(); });
		}
	});
	
	$('#settingsSave').click(function() {
		array = {};
		$.each(APPS, function(index, value) {
		    array[value['name']] = $('#settingShow-'+value['name']).is(':checked')
		});
		
		Settings.set('showApps', array);
		theme = $('#settingThemeSelect option').filter(':selected').text().toLowerCase();
		Settings.set('theme', theme);
		Settings.set('showSidebar', $('#settingShowSidebar').is(':checked'));
		$('#settings').modal('hide');
		Settings.set('enableAnimations', $('#settingEnableAnimations').is(':checked'));
		$('#menu-mobile .nav-collapse').collapse('hide');
		$('#settings').slideUp();
		refreshUI();
	});
	
	$('.menuLogout').click(function() {
			logout();		
	});
	
	$(document.body).trigger('setupEvents');
}

/**
 * Refreshes the UI, which includes getting the settings and modifying the UI based on the settings
 * Also sends the 'refreshUI' trigger
 * 
 * @method refreshUI
 */
function refreshUI() {
	set = Settings.get();
	
	if(set['showSidebar'] == 0) { // Hide the sidebar
		$('#nav').addClass('hide');
		sidebar('hide');
	}
	else {
		sidebar('show');
	}
	
	if(set['enableAnimations'] == true)
		$.fx.off = false;
	else
		$.fx.off = true;
	
	$('#settingEnableAnimations').prop('checked', set['enableAnimations']);
	
	$('#settingThemeSelect').val(''+set['theme']);

	$('#settingShowSidebar').attr('checked', set['showSidebar']);
	
	// Add the stylesheet
	$('link[data-theme=theme]').attr('href', 'themes/'+set['theme']+'/theme.css');
	$('link[data-theme=bootstrap]').attr('href', 'themes/'+set['theme']+'/bootstrap.min.css');
	
	$.each(APPS, function(index, value) {
	    $('#settingShow-'+value['name']).attr('checked', set['showApps'][value['name']]);
	});
	
	$(document.body).trigger('refreshUI', [set]);
	
	resizeUI();
}

/**
 * Switches to an application based on it's ID (eg: OI Notepad has the ID of 'notepad').
 * Also triggers the 'appid-switched' event where 'appid' is replaced by the application's ID
 * 
 * @method switchTo
 * @param {String} id ID of the application to switch to
 */
function switchTo(id) {
	
	navid = "#nav-"+id;
	contentid = "#content-"+id;
	
	fromnavid = $('.nav-active a').attr('id'); // Get current active element's id
	fromcontid = "#content-"+fromnavid.split('-')[1];
	
	removeActiveClass(); // Remove active class from all elements
	
	$(navid).parent().addClass('nav-active'); // Add active class to the current element
	
	$(fromcontid).hide('slideUp', function() { $(contentid).slideDown({duration:'slow'}); });
	
	$(fromcontid).removeClass('content-active');
	$(contentid).addClass('content-active');
	$(contentid).focus();
	
	// Call trigger for the app that has been switched to
	$(document.body).trigger(id+'-switched');
}

/**
 * Adds / Registers an application to the interface.
 * It takes an 'app' object as a parameter which contains information about the application
 * 
 * @method addApplication
 * @param {Application} app Object containing information about the application to be added
 */
function addApplication(app) {
	text = '<label><input id="settingShow-'+app['name']+'" type="checkbox"/>&nbsp;'+app['title']+'</input></label>';
    $('#settingShowApplications').append(text);
	li = '<li><a href="#" id="nav-'+app['name']+'" data-switch="'+app['name']+'" title="'+app['title']+'"><img src="'+app['icon-small']+'"/>'+app['title']+'</a></li>';
	$('#nav .nav-list').append(li);
	tr = '<tr><td><a href="#" data-switch="'+app['name']+'" title="'+app['title']+'"><img src="'+app['icon-big']+'"/>'+app['title']+'</a></td></tr>';
	$('#table-launchers').append(tr);
	refreshUI();
}

function removeActiveClass() {
	$('.nav-active').removeClass('nav-active');
}

/**
 * Displays a small notification on the top of the screen
 * 
 * @method notify
 * @param {String} text Text to display
 * @param {String} type A class to apply to the notification like 'alert-info', 'alert-success', 'alert-error' etc. Defaults to 'alert-info'
 * @param {Boolean} persist Whether to persist the notification or hide it after some time
 * @param {String} container Container where to place the notification
 */

function notify(text, type, persist, container)
{
	type = (typeof type === "undefined")?'alert-info':type;
	container = (typeof container === "undefined")?'#notification-wrapper':container;
	persist = (typeof persist === "undefined")?false:persist;
	
	id = Math.round(Math.random()*100);
	content = '<div id="'+id+'" class="'+type+' alert hide notification">'+
	'<a href="#" class="close" data-dismiss="alert">x</a>'+
	text+'</div>';
	
	$(container).prepend(content);
	$('#'+id).fadeIn();
	
	// Hide notification after 5 seconds if persist is false
	if(!persist)
		setTimeout("$('#"+id+"').fadeOut('slow', function() { $(this).remove() })", 5 * 1000);
	
	return id;
}


function hideMenu()
{
	var classes = $('#menu ul').attr('class');
	if(!classes || classes.indexOf('shown') < 0) // Not shown, so nothing to hide
	{
		return false;
	}
		
	$('#menu ul').hide('slideUp', function() 
	{
			$('#menu ul').css('top', '600%'); // Hide the element from view
			$('#menu ul').removeClass('shown');
	});
	
	return true;
}

/**
 * Toggles sidebar. Calls refreshUI when done
 * 
 * @method toggleSidebar
 */

function toggleSidebar()
{
	var classes = $('#nav').attr('class');
	if(!$('#nav').is(':visible')) // Sidebar is hidden
	{
		sidebar('show');
		Settings.set('showSidebar', true);
	}
	else // Sidebar is visible
	{
		sidebar('hide');
		Settings.set('showSidebar', false);
	}
	
	refreshUI();
}

/**
 * Shows / hides the sidebar depending upon the action specified
 * 
 * @method sidebar
 * @param {String} action Action to perform on the sidebar. Can be 'hide' or 'show'. 
 */

function sidebar(action)
{
	if(action == 'hide') {
		$('#nav').animate({left:-1000}, 1000, function() { $(this).hide(); resizeUI();});
	}
	else {
		resizeUI();
		$('#nav').show();
		$('#nav').animate({left:0}, 1000);
	}
}

/**
 *  Resize interface, applying various classes
 *  
 *  @method resizeUI
 */
function resizeUI()
{
	if($('#nav').is(':visible')) // Navbar is Shown
	{
		shown = true;
		span = $('#content').attr('data-span-min');
		margin = $('#content').attr('data-margin-min');
		$('#sidebar-toggle').addClass('sidebar-toggle-hide');
	}
	else
	{
		shown = false;
		span = $('#content').attr('data-span-max');
		margin = $('#content').attr('data-margin-max');
		$('#sidebar-toggle').removeClass('sidebar-toggle-hide');
	}
	
	var classes = $('#content').attr('class');
	if(classes && (classes = classes.match(/span[0-9][0-9]*/ig)))
	{
		$('#content').removeClass(classes[0]);
		$('#content').addClass(span);
		$('#content').animate({'margin':margin});
	}
}

/**
 * Shows a 'Loading' throbber inside the context
 * 
 * @method showThrobber
 * @param {String} context The context where to place the throbber
 */
function showThrobber(context)
{
	content = '<div id="throbber" class="well"><p>Loading....</p>'+
	'<div class="progress progress-striped active">'+
	'<div class="bar" style="width:100%"></div></div></div>';
	$(context).append(content);
}

/**
 * Hides throbber
 * 
 * @method hideThrobber
 */
function hideThrobber()
{
	$('#throbber').remove();
}

/**
 * Converts the given container to inline by adding classes defined 
 * in the custom attribute 'data-inline-class'
 * It places the value of the custom attribute data-inline-class for all the child elements
 * into their class attribute
 * NOTE: It does not alter the visibility of the container
 * 
 * @method convertToInline
 * @param {String} container Container that is to be converted to inline
 */
function convertToInline(container)
{
	$(container).removeClass('modal');
	items = $(container+' [data-inline-class]');
	$.each(items, function(i, v) {
		$(v).removeClass($(v).attr('data-modal-class'))
		$(v).addClass($(v).attr('data-inline-class'));
	});
}


/**
 * Converts the given container to modal by adding classes defined 
 * in the custom attribute 'data-modal-class'
 * It places the value of the custom attribute data-modal-class for all the child elements
 * into their class attribute
 * NOTE: It does not alter the visibility of the container
 * 
 * @method convertToModal
 * @param {String} container Container that is to be converted to modal
 */

function convertToModal(container)
{
	$(container).addClass('modal');
	items = $(container+' [data-modal-class]');
	$.each(items, function(i, v) {
		$(v).removeClass($(v).attr('data-inline-class'));
		$(v).addClass($(v).attr('data-modal-class'));
	});
}

/**
 * Clears all input (type text and hidden) under the parent
 * 
 * @method clearInput
 * @param {String} parent Parent that contains inputs that are to be cleared
 */
function clearInput(parent)
{
	$(parent+' input[type=text], '+parent+' input[type=hidden]').val('');
}


/**
 * Parses strings in the format 'a-b-id' and returns the stripped id
 * 
 * @method getID
 * @param {String} id The ID to parse
 * @return {Integer} Parsed ID
 */
function getID(id) {
	id = id.split('-');
	id = id[id.length-1];
	return id;
}

/**
 * Checks if the device is a touch enabled device or not
 * @return {Boolean}
 */
function isTouchDevice(){
	try{
		document.createEvent("TouchEvent");
		return true;
	}catch(e){
		return false;
	}
}

/**
 * Enables scrolling of overflow elements on the touch device
 * @param {String} id ID of the element to enable touch scrolling on (Note: ID should be a JavaScript ID and not a jQuery ID)
 */
function touchScroll(id){
	if(isTouchDevice()){ //if touch events exist...
		var el=document.getElementById(id);
		var scrollStartPos=0;

		document.getElementById(id).addEventListener("touchstart", function(event) {
			scrollStartPos=this.scrollTop+event.touches[0].pageY;
			//event.preventDefault();
		},false);

		document.getElementById(id).addEventListener("touchmove", function(event) {
			this.scrollTop=scrollStartPos-event.touches[0].pageY;
			event.preventDefault();
		},false);
	}
}
/* 
 * 
 * AJAX Methods
 * 
 * 
 */

// TODO: Is this a good way to get the server's IP?
SERVER = window.location.host;
URL = SERVER;

/**
 * Logs out by sending a /logout REST call and redirects the page to the root '/'
 *
 * @method logout
 */
function logout()
{
	$.get('/logout', function(data) {
		window.location.href = '/';
	});
}

/**
 * Test a REST call. Used for testing if an app is installed on the device or not
 * 
 * @method testCall
 * @param {String} call The call to send to the server
 * @return {Boolean} Returns true on success and false on failure
 */
function testCall(call)
{
	var ret;
	jQuery.ajaxSetup({async:false});
	$.ajax(call,
			{suppressErrors : true}
	)
	.success(function(data) {
		ret = true;
	})
	.error(function(xhr, status, error) {
		if(xhr.status == 501)
			ret = false;
	});
	jQuery.ajaxSetup({async:true});
	return ret;
}
