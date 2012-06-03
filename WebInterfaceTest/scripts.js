$(document).ready(function() {
	
	//initialize();
	
	$('.nav-active').show();
	$('#nav-home').parent().addClass('nav-active'); // Set home as the default active link
	$('#content-home').addClass('content-active');
	
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
}

function setupUI() {
	
	/*$('.active').show();
	$('#nav-home').parent().addClass('active'); // Set home as the default active link*/
	
	var navcontent = '<div class="nav-content"><button class="btn" data-switch="home">&larr; Back</button></div>';
	
	$('div').filter(function() {
		return this.id.match(/^content-[^home].*/ig);
	}).prepend(navcontent);
}

function setupEvents() {
	
	$('a[data-switch], button[data-switch]').click(function(event) {
		//var id = $(this).attr('data-switch').split('-');
		//switchTo(id[1]);
		switchTo($(this).attr('data-switch'));
	});
	
	// Expand contents when a note is clicked
	$('.table-list tr td a').live('click.#', function(e) {
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
	$('.button-edit').live('click', function(e) {
		e.preventDefault();
		var parent = $(this).parent();
		var id = parent.attr('id');
		console.log(id);
		id = id.split('-')[2];
		
		$('#note-content-'+id).hide();
		$('#note-edit-'+id).show('slideDown');
		
		console.log('#note-edit-'+id);
			
		$('#note-edit-'+id+' .button-save').click(function() {
			notify('Saving note....', 'alert-info');
			updateNote(id);
		});
		
		$('#note-edit-'+id+' .button-cancel').click(function() {
			$('#note-edit-'+id).hide();
			$('#note-content-'+id).show();
		});
		
	});
	
	$('.button-delete').live('click', function() {
		var parent = $(this).parent();
		var id = parent.attr('id');
		console.log(id);
		id = id.split('-')[2];
		
		dialog = '<div id="delete-confirm-modal-'+id+'" class="modal hide">'+
				 '<div class="modal-body">'+
				 '<p>Are you sure you wish to delete this item?</p>'+
				 '</div>'+
				 '<div class="modal-footer">'+
				 '<a id="btn-close" href="#" class="btn" data-dismiss="modal">Cancel</a>'+
				 '<a id="btn-delete" href="#" class="btn btn-primary">Delete</a>'+
				 '</div></div>';
		
		$('body').append(dialog);
		
		$('#delete-confirm-modal-'+id+' #btn-close').click(function(e) {
			e.preventDefault();
			$('#delete-confirm-modal-'+id).modal('hide');
			$('#delete-confirm-modal-'+id).remove();
		});
		
		$('#delete-confirm-modal-'+id+' #btn-delete').click(function() {
			deleteNote(id);
			$('#delete-confirm-modal-'+id).modal('hide');
			$('#delete-confirm-modal-'+id).remove();
		});
		
		$('#delete-confirm-modal-'+id).modal();
	});
	
	$('.button-note-add').live('click', function() {
		$('#add-note-modal').modal();
	});
	
	// Toggle note selection
	$('#notepad-action-toggle').live('click', function() {
		$('.note-select').toggle();
		// Deselect all notes
		$('#content-notepad .table-list input:checkbox').attr('checked', false);
	});
	
	// Select all notes
	$('#notepad-action-selectall').live('click', function() {
		$('#content-notepad .table-list input:checkbox').attr('checked', true);
	});
	
	// Deselect all notes
	$('#notepad-action-deselectall').live('click', function() {
		$('#content-notepad .table-list input:checkbox').attr('checked', false);
	});
	
	$('#btn-note-add').live('click', function() {
		notify('Saving note....', 'alert-info');
		addNewNote('#form-note-add');
		$('#add-note-modal').modal('hide');
	});
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
	
	if(id == 'notepad') { refreshNotes(); }
}

function removeActiveClass() {
	$('.nav-active').removeClass('nav-active');
}


function insertNote(id, title, text, createdDate, modifiedDate)
{
	note = $('#content-notepad .table-list tbody');
	note.append('<tr><td class="note-select hide">'+
				'<input type="checkbox"/></td>'+
				'<td><a href="#" id="note-'+id+'">'+title+'</a>'+
				'<div class="table-hide" id="note-hide-'+id+'">'+
				'<span id="note-content-'+id+'">'+
				'<pre>'+text+'</pre><hr/>'+
				'<button class="button-note-edit button-edit btn">Edit</button>'+
				'<button class="button-note-delete button-delete btn">Delete</button>'+
				'</span></div>');
	
	table_hide_edit = '<span id="note-edit-'+id+'" class="hide"><form>'+
					  '<input name="title" type="text" value="'+title+'"/>'+
					  '<textarea name="text">'+text+'</textarea>'+
					  '<input type="hidden" name="id" value="'+id+'"/></form>'+
					  '<button class="button-note-save button-save btn">Save</button>'+
					  '<button class="button-note-cancel button-cancel btn">Cancel</button>'+
					  '</span>';
					  
	note.append('</tr></td>');
	
	$('.table-hide #note-content-'+id).parent().append(table_hide_edit);
}

function notify(text, type, container, persist)
{
	container = (typeof container === "undefined")?'#notification-wrapper':container;
	persist = (typeof persist === "undefined")?false:persist;
	
	id = Math.round(Math.random()*100);
	content = '<div id="'+id+'" class="'+type+' alert hide notification">'+
	'<a href="#" class="close" data-dismiss="alert">x</a>'+
	text+'</div>';
	
	//console.log(container);
	
	$(container).prepend(content);
	$('#'+id).fadeIn();
	
	// Hide notification after 5 seconds
	setTimeout("$('#"+id+"').fadeOut('slow', function() { $(this).remove() })", 5 * 1000); 
}

/* AJAX Methods */

URL = "http://localhost/server/index.php";

function refreshNotes()
{
	
	// Get all notes
	$.getJSON(URL+'/notes/get', function(data) {
		if(data.code != 200) {
			notify("Error fetching data. The server says\n"+data['msg'], 'alert-error');
		}
		else {
			$('#content-notepad .table-list').remove();
			$('#content-notepad').append('<table class="table-list">'+
									'<thead><th>Title</th></thead>'+
									'<tbody></tbody></table>');
			$.each(data.notes, function(i, note) {
				//console.log(note.TITLE);
				insertNote(note._ID, note.TITLE, note.NOTE, note.CREATED_DATE, note.MODIFIED_DATE);
			});
		}
	});
}

function addNewNote(form)
{
	$.post(URL+'/notes/new', $(form).serialize(), function(data) {
		if(data.code != 200) {
			//alert("Error adding new note. The server says\n"+data['msg']); 
			notify('An error occurred while adding a new note<br/>The server says: '+data['msg']);
		}
		else {
			refreshNotes();
			if($('#add-note-modal').is(':hidden')) {
				notify('Note saved successfully!', 'alert-success');
			}
			else {
				notify('Note saved successfully!', 'alert-success', '#add-note-modal .modal-body');
			}
		}
	}, 'json');
}

function updateNote(id)
{
	postData = $('#note-edit-'+id+' form').serialize();
	
	$.post(URL+'/notes/update', postData, function(data) {
		//console.log(data.code);
		if(data.code != 200) {
			notify('Error updating note: '+data['msg'], 'alert-error');
		}
		else {
			refreshNotes();
			notify('Note updated successfully!', 'alert-success');
		}
	}, 'json');
}

function deleteNote(id)
{
	$.getJSON(URL+'/notes/delete/'+id, function(data) {
		if(data.code != 200)
		{
			notify('Error deleting note: '+data['msg'], 'alert-error');
		}
		else
		{
			refreshNotes();
			notify('Note deleted successfully!', 'alert-success');
		}
	});	
}
