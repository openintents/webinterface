// Contains script specific to OI Notepad
// Setup a namespace for Notepad, it's bad to add all of this to the global namespace
/**
 * Notepad class. Contains functions related to OI Notepad. 
 * 
 * @class Notepad
 */
(function(Notepad, $, undefined) {

	// Bind triggers
	$(document).on('initialize', function() { initNotepad(); });
	$(document).on('setupEvents', function() { setupNotepadEvents(); });
	$(document).on('refreshUI', function(event, set) { notepadRefreshUI(set); });
	$(document).on('notepad-switched', function() { notepadSwitched() });
	
	// Setup OI Notepad events
	
	function initNotepad()
	{
		console.log('Init notepad');
		if(!testCall("/notes/get"))
			return;
		// Add application to the UI
		addApplication({'name' : 'notepad', 'title' : 'OI Notepad', 'icon-small' : 'images/oi-notepad.png', 'icon-big' : 'images/ic_launcher_notepad.png' });
		
		// Fetch OI Notepad's HTML fragment and load it
		$.get('apps/notepad/notepad.html', function(data) {
		    $('#content').append(data);
		    $('#content-notepad .table-list').tablesorter({
		    	textExtraction: function(node) {
		    		if($(node).hasClass('hide')) return "";
		    		return $(node).children('a').text();
		    	}
		    });
		    $('#form-note-add').validate({
		    	onfocusout: false
		    });
		});
	}
	
	function notepadSwitched() {
	    refreshNotes();
	}
	
	function setupNotepadEvents()
	{
		// Expand contents when a note is clicked
		$(document).on('click.#', '#content-notepad .table-list tr td a', function(e) {
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
		$(document).on('click', '.button-edit', function(e) {
			e.preventDefault();
			var parent = $(this).parent();
			var id = parent.attr('id');
			id = id.split('-')[2];
			
			$('#note-content-'+id).hide();
			$('#note-edit-'+id).show('slideDown');
			
			$('#note-edit-'+id+' .button-save').click(function() {
				//notify('Saving note....', 'alert-info');
				updateNote(id);
			});
			
			$('#note-edit-'+id+' .button-cancel').click(function() {
				$('#note-edit-'+id).hide();
				$('#note-content-'+id).show();
				// Restore note contents
				$('#note-edit-'+id+' input[name=title]').val($('#note-'+id).text());
				$('#note-edit-'+id+' textarea[name=note]').val($('#note-content-'+id+' pre').text());
			});
			
		});
		
		// Event when the delete button is clicked
		$(document).on('click', '.button-note-delete', function() {
			var parent = $(this).parent();
			var id = parent.attr('id');
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
				deleteNote(id, true, true);
				$('#delete-confirm-modal-'+id).modal('hide');
				$('#delete-confirm-modal-'+id).remove();
			});
			
			$('#delete-confirm-modal-'+id).modal();
		});
		
		$(document).on('click', '#btn-note-close', function() {
			closeAddNoteDialog();
		});
		
		// Event when the new note button is clicked
		$(document).on('click', '.button-note-add', function() {
			if(screen.width >= 979) { // Desktop
				convertToModal('#add-note-modal');
				$('#add-note-modal').modal();
				$('#add-note-modal').on('hidden', function() {
					clearInput('#form-note-add');
				});
			}
			else { // Mobile
				convertToInline('#add-note-modal');
				$('#add-note-modal').slideDown();
			}
			$('#form-note-add input[name=title]').focus();
		});
		
		// Toggle note selection
		$(document).on('click', '#notepad-action-toggle', function() {
			$('.note-select').toggle();
			if($('.note-select').is(':visible')) {
				$('#notepad-action-selectall').removeClass('disabled');
				$('#notepad-action-deselectall').removeClass('disabled');
				$('#notepad-action-deleteselected').removeClass('disabled');
			}
			else {
				$('#notepad-action-selectall').addClass('disabled');
				$('#notepad-action-deselectall').addClass('disabled');
				$('#notepad-action-deleteselected').addClass('disabled');
			}
			// Deselect all notes
			$('#content-notepad .table-list input:checkbox').attr('checked', false);
		});
		
		// Select all notes
		$(document).on('click', '#notepad-action-selectall', function() {
			$('#content-notepad .table-list input:checkbox').attr('checked', true);
		});
		
		// Deselect all notes
		$(document).on('click', '#notepad-action-deselectall', function() {
			$('#content-notepad .table-list input:checkbox').attr('checked', false);
		});
		
		// Delete selected notes
		$(document).on('click', '#notepad-action-deleteselected', function() {
			dialog = '<div id="delete-confirm-modal-all" class="modal hide">'+
					 '<div class="modal-body">'+
					 '<p>Are you sure you wish to delete all selected items?</p>'+
					 '</div>'+
					 '<div class="modal-footer">'+
					 '<a id="btn-close" href="#" class="btn" data-dismiss="modal">Cancel</a>'+
					 '<a id="btn-delete" href="#" class="btn btn-primary">Delete</a>'+
					 '</div></div>';
					 
			$('body').append(dialog);
			
			$('#delete-confirm-modal-all #btn-close').click(function(e) {
				e.preventDefault();
				$('#delete-confirm-modal-all').modal('hide');
				$('#delete-confirm-modal-all').remove();
			});
			
			$('#delete-confirm-modal-all #btn-delete').click(function() {
				selected = $('#content-notepad .table-list input:checkbox:checked');
				$.each(selected, function(index, value) {
					id = $(value).attr('id').split('-')[2];
					console.log("Deleting note "+id);
					deleteNote(id, false, true); //TODO: Do we have to refresh everytime?
				});
				console.log("Deleting notes");
				//refreshNotes();
				$('#delete-confirm-modal-all').modal('hide');
				$('#delete-confirm-modal-all').remove();
			});
			
			$('#delete-confirm-modal-all').modal();
		});
		
		$(document).on('submit', '#form-note-add', function() {
			/*$.validator.setDefaults({
				showError: function(errorMap, errorList) { },
			});
			
			if(!$('#form-note-add').valid()) {
				return;
			}*/
			//notify('Saving note....', 'alert-info');
			addNewNote('#form-note-add');
			//$('#add-note-modal').modal('hide');
			closeAddNoteDialog();
			return false;
		});
		
		$(document).on('click', '#btn-note-close-phone', function() {
			$('#add-note-phone').slideUp();
			$('#form-note-add input, #form-note-add textarea').val('');
		});
	}
	
	// Called when refreshing UI
	function notepadRefreshUI(set)
	{
		if(set['showApps']['notepad'] == true) {
			$('#content-notepad[class=content-active]').show();
			$('#nav-notepad').parent().show();
			$('a[data-switch=notepad]').parent().show();
		}
		else {
			$('#content-notepad').hide();
			$('a[data-switch=notepad]').parent().hide();
			$('#nav-notepad').parent().hide();
			if($('#content-notepad').hasClass('content-active')) {
				switchTo('home');
			}
		}
	}
	
	/**
	 * Inserts a note into the OI Notepad table
	 * 
	 * @method insertNote
	 * @param {Integer} id ID of the note
	 * @param {String} title Title of the note
	 * @param {String} text Note contents
	 * @param {String} createdDate Creation date of the note
	 * @param {String} modifiedDate Modification of the note
	 */
	function insertNote(id, title, text, createdDate, modifiedDate)
	{
		note = $('#content-notepad .table-list tbody');
		note.append('<tr><td class="note-select hide">'+
					'<input id="note-check-'+id+'" type="checkbox"/></td>'+
					'<td><a href="#" id="note-'+id+'">'+title+'</a>'+
					'<div class="table-hide" id="note-hide-'+id+'">'+
					'<span id="note-content-'+id+'">'+
					'<pre>'+text+'</pre><hr/>'+
					'<button class="button-note-edit button-edit btn">Edit</button>'+
					'<button class="button-note-delete button-delete btn">Delete</button>'+
					'</span></div>');
		
		table_hide_edit = '<span id="note-edit-'+id+'" class="hide"><form>'+
						  '<input name="title" type="text" value="'+title+'"/>'+
						  '<textarea name="note">'+text+'</textarea>'+
						  '<input type="hidden" name="_id" value="'+id+'"/></form>'+
						  '<button class="button-note-save button-save btn btn-primary">Save</button>'+
						  '<button class="button-note-cancel button-cancel btn">Cancel</button>'+
						  '</span>';
						  
		note.append('</tr></td>');
		
		$('.table-hide #note-content-'+id).parent().append(table_hide_edit);
		$('#content-notepad .table-list').trigger('update');
	}
	
	function closeAddNoteDialog()
	{
		$('#add-note-modal').modal('hide');
		$('#add-note-modal').slideUp();
		clearInput('#form-note-add');
		// Remove error messages
		$('#form-note-add input, #form-note-add textarea').removeClass('error');
		$('#form-note-add label.error').remove();
	}
	
	/**
	 * Refreshes the notes from the server
	 * 
	 * @method refreshNotes
	 */
	function refreshNotes()
	{
		showThrobber('#content-notepad');
		
		// Get all notes
		$.getJSON('/notes/get', function(data) {
			hideThrobber();
			
				
				$('#content-notepad .table-list tbody').html('');
				//TODO: Remove the below line after testing
				/*$('#content-notepad').append('<table class="table-list">'+
										'<thead><th>Title</th></thead>'+
										'<tbody></tbody></table>');*/
				
				
				
				keys = sortNotes(data);
				
				if(keys.length == 0) {
					emptymsg = '<p id="notepad-empty">You don\'t have any notes yet! Click on the \'Add Note\' button above to add a new note!</p>';
					$('#notepad-empty').remove(); // Prevents multiple messages from displaying
					$('#content-notepad').append(emptymsg);
				}
				else {
					$('#notepad-empty').fadeOut().remove();
					
					for(var i=0; i < keys.length; i++)
					{
							insertNote(data[keys[i]]._id, data[keys[i]].title,
							data[keys[i]].note, data[keys[i]].created,
							data[keys[i]].modified);			
					}
				}
					
		});
	}
	
	/**
	 * Sorts the notes accordind to their modification time
	 * 
	 * @method sortNotes
	 * @param {Array} notes Array of note objects to sort
	 */
	function sortNotes(notes)
	{
		var keys = [];
		for (var x in notes)
			notes.hasOwnProperty(x) && keys.push(x);
		
		keys = $.map(keys, Number);
		
		keys.sort(function(a, b) { return a - b; });
		
		keys.sort(function(a, b) {
			return notes[b].modified - notes[a].modified;
		});
		
		return keys;
	}
	
	/**
	 * Adds a new note
	 * 
	 * @method addNewNote
	 * @param {Form} form Form to send to the server
	 */
	function addNewNote(form)
	{
		$.post('/notes/new', $(form).serialize(), function(data) {
			/*if(data.code != 200) {
				//alert("Error adding new note. The server says\n"+data['msg']); 
				notify('An error occurred while adding a new note<br/>The server says: '+data['msg'], 'alert-error');
			}
			else {*/
				refreshNotes();
				if($('#add-note-modal').is(':hidden')) {
					notify('Note saved successfully!', 'alert-success');
				}
				else {
					notify('Note saved successfully!', 'alert-success', '#add-note-modal .modal-body');
				}
			//}
		}, 'json');
	}
	
	/**
	 * Updates a note
	 * 
	 * @method updateNote
	 * @param {Integer} id ID of the note to update
	 */
	function updateNote(id)
	{
		postData = $('#note-edit-'+id+' form').serialize();
		
		$.post('/notes/update', postData, function(data) {
			//console.log(data.code);
			/*if(data.code != 200) {
				notify('Error updating note: '+data['msg'], 'alert-error');
			}
			else {*/
				refreshNotes();
				notify('Note updated successfully!', 'alert-success');
			//}
		}, 'json');
	}
	
	/**
	 * Deletes a note specified by the ID
	 * 
	 * @method deleteNote
	 * @param {Integer} id ID of the note to delete
	 * @param {Boolean} notif If true, displays a notification if delete is successful (Default: True)
	 * @param {Boolean} refresh If true refreshes the notes list by calling refreshNotes() on successful deletion of the note (Default: True)
	 */
	function deleteNote(id, notif, refresh)
	{
	        (typeof refresh === "undefined")?true:refresh;
	        (typeof notif === "undefined")?true:notif;
	
	        $.get('/notes/delete?_id='+id, function(data) {
	        		if(refresh) refreshNotes();
	                if(notif) notify('Note deleted successfully!', 'alert-success');
	        });
	}
} ( window.Notepad = window.Notepad || {}, jQuery ));
