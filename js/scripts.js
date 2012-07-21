// Applications that will be loaded in the interface
APPS = { notepad : {name : 'notepad', title : 'OI Notepad'},
	 shoppinglist : { name : 'shoppinglist', title : 'OI Shopping List'}
};

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
	
	$('#menuToggleSidebar, #menuToggleSidebarMobile').click(function() {
		toggleSidebar();
	});
	
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
	
	$.each(APPS, function(index, value) {
	    text = '<label><input id="settingShow-'+value['name']+'" type="checkbox"/>&nbsp;'+value['title']+'</input></label>';
	    $('#settingShowApplications').append(text);
	    $('<link>').attr('rel', 'stylesheet')
	    .attr('href', 'apps/'+value['name']+'/style.css')
	    .attr('type', 'text/css')
	    .appendTo('head');
	    
	    //$.getScript('apps/'+value['name']+'/'+value['name']+'.js').done(function() { $('body').trigger(value['name']+'-initialize'); });
	});
	
	$(document.body).trigger('initialize');
}

function addScript(url){
        // add script
        var script   = document.createElement("script");
        script.type  = "text/javascript";
        script.src   = url;
        document.body.appendChild(script);

        // remove from the dom
        //document.body.removeChild(document.body.lastChild);
}


function setupUI() {
	
	/*$('.active').show();
	$('#nav-home').parent().addClass('active'); // Set home as the default active link*/
	
	/*var navcontent = '<div class="nav-content"><button class="btn" data-switch="home">&larr; Back</button></div>';
	
	$('div').filter(function() {*/
	//      return this.id.match(/^content-[^home].*/ig);
	//).prepend(navcontent);
	
	$(document.body).trigger('setupUI');
    
}

function setupEvents() {
	
	$(document).on('click', 'a[data-switch], button[data-switch]', function(event) {
		//var id = $(this).attr('data-switch').split('-');
		//switchTo(id[1]);
		switchTo($(this).attr('data-switch'));
	});
	
	// Show settings dialog when settings menu item is clicked
	$('.showSettings').click(function() {
		$('#settings').addClass('modal');
		$('#settings').modal();
	});
	
	// Show mobile-friendly version of the settings dialog
	$('#showSettingsMobile').click(function() {
		$('#settings').removeClass('modal');
		$('#settings').slideDown();
		$('#settingsClose').click(function() { $('#settings').slideUp(); $(this).off(); });
	});
	
	$('#settingsSave').click(function() {
		array = {};
		$.each(APPS, function(index, value) {
		    array[value['name']] = $('#settingShow-'+value['name']).is(':checked')
		});
		
		//array = {'notepad' : $('#settingShow-notepad').is(':checked'), 
		//		'shoppinglist' : $('#settingShowShoppingList').is(':checked')};
		Settings.set('showApps', array);
		theme = $('#settingThemeSelect option').filter(':selected').text().toLowerCase();
		Settings.set('theme', theme);
		Settings.set('showSidebar', $('#settingShowSidebar').is(':checked'));
		$('#settings').modal('hide');
		refreshUI();
	});
	
	$('#menuLogout').click(function() {
			logout();		
	});
	
	$(document.body).trigger('setupEvents');
}

function refreshUI() {
	set = Settings.get();
	
	if(set['showSidebar'] == 0) { // Hide the sidebar
		$('#nav').addClass('hide');
		sidebar('hide');
	}
	else {
		sidebar('show');
	}
	
	$('#settingThemeSelect').val(''+set['theme']);

	$('#settingShowSidebar').attr('checked', set['showSidebar']);
	
	// Add the stylesheet
	$('link[data-theme=theme]').attr('href', 'themes/'+set['theme']+'/theme.css');
	$('link[data-theme=bootstrap]').attr('href', 'themes/'+set['theme']+'/bootstrap.min.css');
	
	/*theme = '<link rel="stylesheet" href="themes/'+set['theme']+'/theme.css" media="screen"/>';
	$('head').append(theme);*/
	
	/*$('#settingShowNotepad').attr('checked', set['showApps']['notepad']);
	$('#settingShowShoppingList').attr('checked', set['showApps']['shoppinglist']);*/
	
	$.each(APPS, function(index, value) {
	    $('#settingShow-'+value['name']).attr('checked', set['showApps'][value['name']]);
	});
	
	$(document.body).trigger('refreshUI', [set]);
	
	//$('#content').css('margin-left','25%');
	resizeUI();
}

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
	//if(id == 'notepad') { refreshNotes(); }
}

function addApplication(app) {
	li = '<li><a href="#" id="nav-'+app['name']+'" data-switch="'+app['name']+'" title="'+app['title']+'"><img src="'+app['icon-small']+'"/>'+app['title']+'</a></li>';
	$('#nav .nav-list').append(li);
	tr = '<tr><td><a href="#" data-switch="'+app['name']+'" title="'+app['title']+'"><img src="'+app['icon-big']+'"/>'+app['title']+'</a></td></tr>';
	$('#table-launchers').append(tr);
	refreshUI();
}

function removeActiveClass() {
	$('.nav-active').removeClass('nav-active');
}

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

function sidebar(action)
{
	if(action == 'hide') {
		//$('#nav').removeClass('shown');
		$('#nav').hide('slow', function() { resizeUI(); });
	}
	else {
		//$('#nav').addClass('shown');
		resizeUI();
		$('#nav').show('slow');
	}
}

// Resize interface, applying various classes

function resizeUI()
{
	if($('#nav').is(':visible')) // Navbar is Shown
	{
		shown = true;
		span = $('#content').attr('data-span-min');
		margin = $('#content').attr('data-margin-min');
	}
	else
	{
		shown = false;
		span = $('#content').attr('data-span-max');
		margin = $('#content').attr('data-margin-max');
	}
	
	var classes = $('#content').attr('class');
	if(classes && (classes = classes.match(/span[0-9][0-9]*/ig)))
	{
		$('#content').removeClass(classes[0]);
		$('#content').addClass(span);
		$('#content').animate({'margin':margin});
	}
}

function showThrobber(context)
{
	content = '<div id="throbber" class="well"><p>Loading....</p>'+
	'<div class="progress progress-striped active">'+
	'<div class="bar" style="width:100%"></div></div></div>';
	$(context).append(content);
}

function hideThrobber()
{
	$('#throbber').remove();
}

/* 
 * 
 * AJAX Methods
 * 
 * 
*/

// TODO: Is this a good way to get the server's IP?
SERVER = window.location.host;
//URL = "http://"+SERVER+"/server-pdo/index.php";
URL = SERVER;

// Disable AJAX caching, it leads to problems on webkit browsers
$.ajaxSetup({
	cache: false,
	error: function error(jqXHR, textStatus, errorThrown) 	{
		hideThrobber();
		notify('Error performing operation: '+textStatus, 'alert-error'); 
	}
});

function logout()
{
	$.getJSON(URL+'/logout', function(data) {
		window.location.reload(true);
	});
}
