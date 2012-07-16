// Contains script specific to OI Shopping List

// Bind triggers
$(document).on('initialize', function() { initShoppingList(); });
$(document).on('setupEvents', function() { setupShoppingListEvents(); });
$(document).on('refreshUI', function(event, set) { shoppingListRefreshUI(set); });
$(document).on('shoppinglist-switched', function() { shoppingListSwitched() });

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
	    insertItem({id:1,priority:1,item:'Maggi',price:100,qty:1,units:'kg',tags:'food'});
	    insertItem({id:2,priority:2,item:'Chips',price:100,qty:1,units:'kg',tags:'food'});
	});
}

function setupShoppingListEvents() {
	$(document).on('click', '.item-action-edit', function() {
		id = $(this).parent().attr('id');
		if(typeof id === "undefined") return true;
		id = id.split('-');
		id = id[id.length-1]
		editItem(id);
		return false;
	});
	
	$(document).on('click', '.item-action-delete', function() {
		//console.log($(this).parent().attr('id'));
		id = $(this).parent().attr('id');
		id = id.split('-')[1];
		$('#item-'+id).remove();
	});

	$(document).on('click', '.item-action-cancel', function() {
		id = $(this).parent().attr('id');
		if(typeof id === "undefined") return true;
		id = id.split('-');
		id = id[id.length-1]
		$('#item-edit-'+id).fadeOut();
		$('#item-'+id).fadeIn();
		return false;
	});
	
	$(document).on('click', '#shoppinglist-btn-add-item', function() {
		//console.log(screen.width);
		if(screen.width >= 979) {
			console.log('Showing add-item dialog for desktop');
			$('#modal-add-item').addClass('modal');
			$('#modal-add-item').modal();
			$('#modal-add-item').on('hidden', function() {
				$('#modal-add-item').removeClass('modal');
			});
		}
		else {
			$('#inline-add-item').slideDown();
		}
	});
	
	$(document).on('click', '#inline-btn-cancel', function() {
		$('#inline-add-item').slideUp();
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
	// TODO: Use a REST call to load the list
	LIST = {id : 1, name : 'My Shopping List'};
}

function insertList(id, name) {
	list = '<option id="'+id+'">'+name+'</option>';
	$('#shoppinglist-list').append(list);
}

function insertItem(item)
{
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
}

function editItem(id)
{
	$('#item-'+id).fadeOut();
	$('#item-edit-'+id).fadeIn();
}