// Contains script specific to OI Shopping List

// Bind triggers
$('body').bind('initialize', function() { initShoppingList(); });
$('body').bind('setupEvents', function() { setupShoppingListEvents(); });
$('body').bind('refreshUI', function(event, set) { shoppingListRefreshUI(set); });
$('body').bind('shoppinglist-switched', function() { shoppingListSwitched() });

function initShoppingList() {
	console.log('Init shoppinglist');
	addApplication({'name' : 'shoppinglist', 'title' : 'OI Shopping List', 'icon-small' : 'images/oi-shoppinglist.png', 'icon-big' : 'images/ic_launcher_shoppinglist.png'});
    
	// Hide OI Shopping List by default
	// TODO: Remove this when OI Shopping List support is fully completed
	set = Settings.get();
	set['showApps']['shoppinglist'] = false;
	Settings.set('showApps', set['showApps']);
	
	// Fetch OI Notepad's HTML fragment and load it
	$.get('apps/shoppinglist/shoppinglist.html', function(data) {
	    $('#content').append(data);
	    insertItem({id:1,priority:1,item:'Maggi',price:100,qty:1,units:'kg',tags:'food'});
	});
}

function setupShoppingListEvents() {
	console.log('setting up events');
	
	$('.item-action-delete').live('click', function() {
		console.log($(this).parent().attr('id'));
		id = $(this).parent().attr('id');
		id = id.split('-')[1];
		$('#item-'+id).remove();	
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
	console.log(item);
	append = '<tr id="item-'+item.id+'"><td><input type="checkbox"></input></td>'+
		'<td>'+item.priority+'</td>'+
		'<td>'+item.item+'</td>'+
		'<td>'+item.price+'</td>'+
		'<td>'+item.qty+'&nbsp;'+item.units+'</td>'+
		'<td>'+item.tags+'</td>'+
		'<td><ul class="list-inline">'+
		'<li><a id="item-'+item.id+'" href="#" title="Edit"><i class="icon-pencil item-action-edit"></i></a></li>'+
		'<li><a id="item-'+item.id+'" href="#" title="Delete"><i class="icon-remove item-action-delete"></i></a></li>'+
		'</ul></td></tr>';
	console.log(append);
	$('#shoppinglist-items tbody').append(append);	  
}