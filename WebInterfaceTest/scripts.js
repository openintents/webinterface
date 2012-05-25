$(document).ready(function() {
	
	//initialize();
	$('div').filter(function() {
		return this.id.match(/content-[^home].*/);
	}).hide();
	
	setupUI();
	
	$('.active').show();
	$('#nav-home').parent().addClass('active'); // Set home as the default active link
	
	$('#nav ul li a').click(function(event) {
		var id = event.target.id.split('-');
		switchTo(id[1]);
	});
	
	$('button').button();
	$('input[type=button]').button();
	
	$('.button-add').button({icons:{primary:'ui-icon-circle-plus'}});
	$('.button-delete').button({icons:{primary:'ui-icon-circle-close'}});
	$('.button-edit').button({icons:{primary:'ui-icon-pencil'}});
	
	$('.table-list tr td a').click(function() {
		var current = $(this).parent().children('.table-hide');
		if(current.attr('class').indexOf('table-hide-shown') != -1) // Element is current displayed
		{
			current.hide('slideUp');
			current.removeClass('table-hide-shown');
			$(this).removeClass('table-list-active');
			return;
		}
		
		$('.table-hide').hide('slideUp');
		$('.table-hide').removeClass('table-hide-shown');
		$('.table-list-active').removeClass('table-list-active');
		
		current.show('slideDown');
		current.addClass('table-hide-shown');
		$(this).addClass('table-list-active');
	});
});

// Initializes the interface and fetches any data from the server
// Does not do anything useful for now, just displays a simple progressbar dialog

function initialize() {
	$('<div />').addClass('lightbox_bg').appendTo('body').show();
	$('<div />').html('<p>Please wait....</p><img src=\'images/ajax-loader.gif\'/>')
	.addClass('modal').appendTo('body');
	
	//TODO: Remove the loading screen after the actual loading is finished, 
	//for now just display it for a set interval
	setTimeout(function() { $('.lightbox_bg').remove(); $('.modal').remove(); }, 5 * 1000);
}

function setupUI() {
		$('.table-hide').append('<hr/><span><button class="button-note-edit button-edit">Edit</button></span>');
}

function switchTo(id) {
	
	navid = "#nav-"+id;
	contentid = "#content-"+id;
	
	fromnavid = $('.active a').attr('id'); // Get current active element's id
	fromcontid = "#content-"+fromnavid.split('-')[1];
	
	removeActiveClass(); // Remove active class from all elements
	
	$(navid).parent().addClass('active'); // Add active class to the current element
	
	$(fromcontid).hide('slideUp', function() { $(contentid).slideDown({duration:'slow', easing:'easeOutExpo'}); });
		
	$(contentid).focus();
}

function removeActiveClass() {
	$('.active').removeClass('active');
}
