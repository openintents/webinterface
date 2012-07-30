// Contains script specific to OI Shopping List

// Bind triggers
$(document).on('initialize', function() { initShoppingList(); });
$(document).on('setupEvents', function() { setupShoppingListEvents(); });
$(document).on('refreshUI', function(event, set) { shoppingListRefreshUI(set); });
$(document).on('shoppinglist-switched', function() { shoppingListSwitched() });

// Get ID
function getID(id) {
	id = id.split('-');
	id = id[id.length-1];
	return id;
}

function initShoppingList() {
	addApplication({'name' : 'shoppinglist', 'title' : 'OI Shopping List', 'icon-small' : 'images/oi-shoppinglist.png', 'icon-big' : 'images/ic_launcher_shoppinglist.png'});
    
	// Hide OI Shopping List by default
	// TODO: Remove this when OI Shopping List support is fully completed
	/*set = Settings.get();
	set['showApps']['shoppinglist'] = false;
	Settings.set('showApps', set['showApps']);*/
	
	// Fetch OI Notepad's HTML fragment and load it
	$.get('apps/shoppinglist/shoppinglist.html', function(data) {
		$('#content').append(data);
		// TODO: This is just for testing
		insertList(1, 'My Shopping List');
		loadList(1); // TODO: Load the first list at start (Only for testing)
		insertList(-1, '&lt;Manage&gt;');
		
		$('#shoppinglist-items').tablesorter();
		//Initialize popovers
		$('#content-shoppinglist .popover-focus').popover({
			trigger: 'focus'
		});
	});

}

function setupShoppingListEvents() {

	// Edit item event
	$(document).on('click', '.item-action-edit', function() {
		id = $(this).parent().attr('id');
		if(typeof id === "undefined") return true;
		id = id.split('-');
		id = id[id.length-1]
		editItem(id);
		return false;
	});
	
	// Delete item event
	$(document).on('click', '.item-action-delete', function() {
		//console.log($(this).parent().attr('id'));
		id = $(this).parent().attr('id');
		if(typeof id === "undefined") return true;
		console.log(id);
		id = getID(id);
		deleteItem(id);
	});

	// Cancel item event
	$(document).on('click', '.item-action-cancel', function() {
		id = $(this).parent().attr('id');
		if(typeof id === "undefined") return true;
		id = id.split('-');
		id = id[id.length-1]
		$('#item-edit-'+id).fadeOut();
		$('#item-'+id).fadeIn();
		return false;
	});
	
	// Add item event
	$(document).on('click', '#shoppinglist-btn-add-item', function() {
		//console.log(screen.width);
		if(screen.width >= 979) {
			console.log('Showing add-item dialog for desktop');
			$('#modal-add-item').addClass('modal');
			$('#modal-add-item').modal({
				keyboard: false,
				background: 'static'
			});
			$('#add-item-item').focus();
			$('#modal-add-item').on('hidden', function() {
				$('#modal-add-item').removeClass('modal');
				clearItemInput();
			});
		}
		else {
			$('#inline-add-item').slideDown();
		}
	});
	
	// Quick add item
	$(document).on('submit', '#shoppinglist-form-quick-add-item', function() {
		input = $(this).children('input[type=text]');
		input.attr('disabled', 'disabled');
		input.popover('hide');
		name = input.val();
		id = Math.floor(Math.random() * 1000);
		insertItem({id:id, item:name});
		input.val('');
		input.removeAttr('disabled');
		return false;
	});
	// Add item dialog event
	$(document).on('click', '#btn-add-item', function() {
		var prefix = '#add-item-'; // Just so if we change prefix it'll be easy to just change it here
		
		item = $(prefix+'item').val();
		priority = $(prefix+'priority').val();
		price = $(prefix+'price').val();
		qty = $(prefix+'qty').val();
		units = $(prefix+'units').val();
		tags = $(prefix+'tags').val();
		
		if(item == "") {
			notify('Item name cannot be empty!', 'alert-error', true, '#modal-add-item .modal-body');
			return;
		}
		
		add = {id:100,item:item,priority:priority,price:price,qty:qty,units:units,tags:tags};
		insertItem(add);
		$('#modal-add-item').modal('hide');
	});
	
	// Cancel inline edit
	$(document).on('click', '#inline-btn-cancel', function() {
		$('#inline-add-item').slideUp();
	});
	
	$(document).on('change', '#shoppinglist-list', function() {
		val = $(this).val();
		
		if(val == -1) {
			//console.log('Manage list');
			$('#shoppinglist-items').fadeOut(function() {
				$('#shoppinglist-btn-container').fadeOut();
				$('#shoppinglist-list-manage-container').slideDown();
			});
		}
		else {
			//console.log('Loading list '+val);
			loadList(val);	
		}
		
		
	});
	
	// Show Add List dialog
	/*$(document).on('click', 'button[data-action=list-add-show]', function() {
			$('#shoppinglist-list-add-container').slideDown();
	});
	
	// Close Add List dialog
	$(document).on('click', 'button[data-action=list-add-close]', function() {
			$('#shoppinglist-list-add-container').slideUp();
	});*/
	
	// Add list
	$(document).on('submit', '#shoppinglist-form-add-list', function() {
			$(this).children('button[type=submit]').button('loading');
			name = $(this).children('input[type=text]').val();
			$(this).children('input[type=text]').val('');
			insertList(Math.floor(Math.random()*1000), name);
			notify('New list added successfully!', 'alert-success');
			$(this).children('button[type=submit]').button('reset');
			return false;
	});
}

function shoppingListRefreshUI() {
	if(set['showApps']['shoppinglist'] == true) {
		$('#content-shoppinglist[class=content-active]').show();
		$('a[data-switch=shoppinglist]').parent().show();
		$('#nav-shoppinglist').parent().show();
		
	}
	else {
		$('#content-shoppinglist').hide();
		$('a[data-switch=shoppinglist]').parent().hide();
		$('#nav-shoppinglist').parent().hide();
		if($('#content-shoppinglist').hasClass('content-active')) {
			switchTo('home');
		}
	}
}

function shoppingListSwitched() {
	  
}

function loadList(id) {
	items = getList(id);
	$('#shoppinglist-list-manage-container').slideUp(function() {
		$('#shoppinglist-items').fadeIn();
		$('#shoppinglist-btn-container').fadeIn();
	});
	
	// Select the list option
	$('#shoppinglist-list option[value='+id+']').attr('selected', 'selected');
	$('#shoppinglist-items tbody').html('');
	for(i=0; i < items.length; i++) {
		insertItem(items[i]);
		//console.log(items[i].id);
	}
}
function getList(id) {
	// TODO: Use a REST call to load the list
	if(id == 1) {
		items = '[';
		for(i=1; i <= 6; i++) {
			
			item = '{"id":'+i+',"priority":1,"item":"Item '+i+'","price":100,'+
				'"qty":1,"units":"kg","tags":"food"}';
			delim = ',';
			if(i == 1) delim = '';
			items = items + delim + item;
		}
		items += ']';
		//console.log(items);
		//LIST = {id : 1, name : 'My Shopping List'};
		return $.evalJSON(items);
	}
}

function insertList(id, name) {
	list = '<option value="'+id+'">'+name+'</option>';
	$('#shoppinglist-list').append(list);
	if(id != -1) {// Skip the '<Manage>' list item
		$('#shoppinglist-list-manage tbody').append('<tr><td>'+
		name+'</td><td><a href="#" id="list-action-edit-'+id+'">'+
		'<i id="list-action-edit" class="icon-pencil list-action-edit">'+
		'</i></a><a href="#" id="list-action-delete-'+id+'"><i id="list-action-delete" class="icon-remove list-action-delete"></i></td></tr>');
	}
}

function insertItem(item)
{
	if(typeof item.id === "undefined")
		item.id = "";
	if(typeof item.priority === "undefined")
		item.priority = "";
	if(typeof item.item === "undefined")
		item.item = "";
	if(typeof item.price === "undefined")
		item.price = "";
	if(typeof item.qty === "undefined")
		item.qty = "";
	if(typeof item.units === "undefined")
		item.units = "";
	if(typeof item.tags === "undefined")
		item.tags = "";
	
	append = '<tr id="item-'+item.id+'"><td><input type="checkbox"></input></td>'+
		'<td>'+item.priority+'</td>'+
		'<td>'+item.item+'</td>'+
		'<td>'+item.price+'</td>'+
		'<td>'+item.qty+'&nbsp;'+item.units+'</td>'+
		'<td>'+item.tags+'</td>'+
		'<td><ul class="list-inline">'+
		'<li><a id="item-action-edit-'+item.id+'" href="#" title="Edit" class="item-action-edit"><i class="icon-pencil item-action-edit"></i></a></li>'+
		'<li><a id="item-action-delete-'+item.id+'" href="#" title="Delete" class="item-action-delete"><i class="icon-remove item-action-delete"></i></a></li>'+
		'</ul></td></tr>'+
		'<tr id="item-edit-'+item.id+'" style="display:none">'+
		'<td></td>'+
		'<td><input type="text" class="item-priority" value="'+item.priority+'"/></td>'+
		'<td><input type="text" class="item-item" value="'+item.item+'"/></td>'+
		'<td><input type="text" class="item-price" value="'+item.price+'"</td>'+
		'<td><input type="text" class="item-qty" value="'+item.qty+'"/>/<input type="text" class="item-units" value="'+item.units+'"/></td>'+
		'<td><input type="text" class="item-tags" value="'+item.tags+'"/></td>'+
		'<td><ul class="list-inline">'+
		'<li><a id="item-action-save-'+item.id+'" href="#" title="Save"><i class="icon-check item-action-save"></i></a></li>'+
		'<li><a id="item-action-cancel-'+item.id+'" href="#" title="Cancel"><i class="icon-remove item-action-cancel"></i></a></li>'+
		'</ul></td></tr>';
		
	$('#shoppinglist-items tbody').append(append);	 
	$('#shoppinglist-items').trigger('update');
}

function editItem(id)
{
	$('#item-'+id).fadeOut();
	$('#item-edit-'+id).fadeIn();
}

function deleteItem(id)
{
	$('#item-'+id).fadeOut(function() { $(this).remove() });
	$('#item-edit-'+id).remove();
}

// Clear the input boxes
function clearItemInput()
{
	$('#modal-add-item input[type=text]').val('');
}