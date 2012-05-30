$(document).ready(function() {
	
	initialize();
	$('div').filter(function() {
		return this.id.match(/content-[^home].*/);
	}).hide();
	
	setupUI();
	setupEvents();
	
	//Hide the loading screen
	$('.lightbox_bg').hide();
	$('.modal').hide();	
});

// Initializes the interface and fetches any data from the server
// Does not do anything useful for now, just displays a simple progressbar dialog

function initialize() {
	$('<div />').addClass('lightbox_bg').appendTo('body').show();
	$('<div />').html('<p>Please wait....</p><img src=\'images/ajax-loader.gif\'/>')
	.addClass('modal').appendTo('body');
	
	//TODO: Remove the loading screen after the actual loading is finished, 
	//for now just display it for a set interval
	//setTimeout(function() { $('.lightbox_bg').remove(); $('.modal').remove(); }, 5 * 1000);
}

function setupUI() {
	
	$('.active').show();
	$('#nav-home').parent().addClass('active'); // Set home as the default active link
	
	$('.table-hide').append('<hr/><button class="button-note-edit button-edit">Edit</button>'+
							'<button class="button-note-save button-save">Save</button>'+
							'<button class="button-note-cancel button-cancel">Cancel</button>');
	$('button').button();
	$('input[type=button]').button();
	$('.button-add').button({icons:{primary:'ui-icon-circle-plus'}});
	$('.button-delete').button({icons:{primary:'ui-icon-circle-close'}});
	$('.button-edit').button({icons:{primary:'ui-icon-pencil'}});
	$('.button-save').button({icons:{primary:'ui-icon-check'}}).hide();
	$('.button-cancel').button({icons:{primary:'ui-icon-close'}}).hide();
}

function setupEvents() {
	
	$('#nav ul li a').click(function(event) {
		var id = event.target.id.split('-');
		switchTo(id[1]);
	});
	
	// Expand contents when a note is clicked
	$('.table-list tr td a').on('click.#', function(e) {
		e.preventDefault();
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
	
	// Show textarea when user clicks the edit button on a note
	$('.button-edit').click(function() {
		var parent = $(this).parent();
		var id = parent.attr('id');
		id = id.split('-')[2];
		var content = parent.children('p');
		var text = content.text();
		content.replaceWith('<textarea id=\'note-text-'+id+'\'>'+text+'</textarea>');
		content = parent.children('textarea');
		// -- Just for animation --
		content.hide();
		content.show('slideDown');
		// -- --
		$(this).hide();
		parent.children('.button-edit').hide();
		parent.children('.button-save').show();
		parent.children('.button-cancel').show();
		parent.children('.button-save').click(function() {
			//TODO: Add code to save note
		});
		parent.children('.button-cancel').click(function() {
			parent.children('.button-save').hide();
			parent.children('.button-cancel').hide();
			parent.children('.button-edit').show();
			parent.children('textarea').replaceWith('<p>'+text+'</p>');
		});
		
	});
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
