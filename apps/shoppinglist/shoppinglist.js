// Contains script specific to OI Shopping List

// Setup a namespace for ShoppingList
(function(ShoppingList, $, undefined) {
	
	// Bind triggers
	$(document).on('initialize', function() { initShoppingList(); });
	$(document).on('setupEvents', function() { setupShoppingListEvents(); });
	$(document).on('refreshUI', function(event, set) { shoppingListRefreshUI(set); });
	$(document).on('shoppinglist-switched', function() { shoppingListSwitched() });
	
	function initShoppingList() {
		// Check if the application is installed
		if(!testCall("/shoppinglist/list/get"))
			return;
		addApplication({'name' : 'shoppinglist', 'title' : 'OI Shopping List', 'icon-small' : 'images/oi-shoppinglist.png', 'icon-big' : 'images/ic_launcher_shoppinglist.png'});
	    
		// Fetch OI Notepad's HTML fragment and load it
		$.get('apps/shoppinglist/shoppinglist.html', function(data) {
			$('#content').append(data);
			
			$('#shoppinglist-items').tablesorter();
			$('#shoppinglist-list-manage').tablesorter();
			
			//Initialize popovers
			$('#content-shoppinglist .popover-focus').popover({
				trigger: 'focus'
			});
			
			touchScroll('shoppinglist-items-table-wrap');
			
			// Setup validation for forms
			$('#form-modal-add-item').validate({
				onfocusout: false
			});
			$('#sl-form-new-list').validate({
				onfocusout: false
			});
			$('#shoppinglist-form-quick-add-item').validate({
				showErrors: function(errorMap, errorList) {
					
				},
				onfocusout: false
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
			id = $(this).parent().attr('id');
			if(typeof id === "undefined") return true;
			id = getID(id);
			slDeleteItem(id);
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
		
		$(document).on('hidden', '#modal-add-item', function() {
			$('#modal-add-item').removeClass('modal');
			$('#modal-add-item #btn-add-item').show();
			$('#modal-add-item #btn-update-item').hide();
			clearInput('#modal-add-item');
		});
		
		$(document).on('click', '#form-modal-add-item-btn-close', function(e) {
			$('#modal-add-item').modal('hide');
			$('#modal-add-item').slideUp();
			e.preventDefault();
		});
		
		// Add item event
		$(document).on('click', '#shoppinglist-btn-add-item', function() {
			$('#modal-add-item input').removeClass('error');
			$('#modal-add-item label.error').remove();
			if(screen.width >= 979) {
				convertToModal('#modal-add-item');
				//$('#modal-add-item').addClass('modal');
				$('#modal-add-item').modal({
					keyboard: false,
					background: 'static'
				});
			}
			else {
				//$('#inline-add-item').slideDown();
				convertToInline('#modal-add-item');
				$('#modal-add-item').slideDown();
			}
			$('#modal-add-item input[name=item_name]').focus();
			$('#btn-add-item').show();
			$('#btn-update-item').hide();
			$('#modal-add-item input[name=list_id]').val(getCurrentList());
		});
		
		// Quick add item
		$(document).on('submit', '#shoppinglist-form-quick-add-item', function() {
			input = $(this).children('input[type=text]');
			input.attr('disabled', 'disabled');
			input.popover('hide');
			name = input.val();
			input.val('');
			slNewItem({item_name:name, list_id:$('#shoppinglist-list option:first').val()});
			input.removeAttr('disabled');
			return false;
		});
		
		// Add item and update item event 
		$(document).on('submit', '#form-modal-add-item', function() {
			item = formToItem('#form-modal-add-item');
			
			// Check if we're updating or adding a new item
			if($('#btn-update-item').is(':visible'))
			{
				slUpdateItem(item);
			}
			else 
			{
				slNewItem(item);
			}
			$('#modal-add-item').modal('hide');
			
			return false;
		});
		
		// Sort helper for checked items and updating of items
		$(document).on('change', '#shoppinglist-items input[type=checkbox]', function(e) {
				var checked = (this.checked)?1:0;
				$($(this).parent().children('span')[0]).html(checked);
				$('#shoppinglist-items').trigger('update');
				
				id = getID($(this).attr('id'));
				item = getItem('#item-', id);
				console.log(item);
				console.log(id);
				if(checked)
					item.status = 2;
				else
					item.status = 1;
				slUpdateItem(item, false);
		});
		
		// Add list
		$(document).on('submit', '#sl-form-new-list', function() {
				if($('#sl-form-new-list button[name=btn-add]').attr('data-action') == 'create')
					slNewList($('#sl-form-new-list input[name=name]').val());
				else {
					slRenameList($('#sl-form-new-list input[name=id]').val(), 
							$('#sl-form-new-list input[name=name]').val());
				}
				closeNewListDialog();
				return false;
		});
		
		// New List button click event
		$(document).on('click', '#sl-btn-new-list', function() {
				showNewListDialog();
		});
		
		// Close form list add
		$(document).on('click', '#sl-form-new-list-close', function() {
				closeNewListDialog();
		});
		
		// Load shopping list when selected from the dropdown
		$(document).on('change', '#shoppinglist-list', function() {
				if($(this).val() == -1) { // Show the manage list div
					$('#shoppinglist-items-wrap').slideUp(function() {
						$('#shoppinglist-list-manage-container').slideDown();
					});
				}
				else {
					$('#shoppinglist-list-manage-container').slideUp(function() {
						$('#shoppinglist-items-wrap').slideDown();
					});
					loadList($(this).val());
				}
		});
		
		// Edit list event
		$(document).on('click', '#shoppinglist-list-manage tbody a[id^=list-action-edit]', function() {
				id = getID($(this).attr('id'));
				editList(id);
		});
		
		$(document).on('click', '#shoppinglist-list-manage tbody a[id^=list-action-delete]', function() {
				id = getID($(this).attr('id'));
				slDeleteList(id);
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
		  refreshLists();
	}
	
	function loadList(id) {
		items = getList(id);
		$('#shoppinglist-list-manage-container').slideUp(function() {
			$('#shoppinglist-items-wrap').fadeIn();
			$('#shoppinglist-btn-container').fadeIn();
		});
		
		// Select the list option
		$('#shoppinglist-list option[value='+id+']').attr('selected', 'selected');
		
		refreshItems();
	}
	
	function insertList(id, name) {
		list = '<option value="'+id+'">'+name+'</option>';
		$('#shoppinglist-list option[value=-1]').remove();
		$('#shoppinglist-list').append(list);
		$('#shoppinglist-list').append('<option value="-1">&lt;Manage&gt;</option>');
		
		if(id != -1) {// Skip the '<Manage>' list item
			$('#shoppinglist-list-manage tbody').append('<tr><td id="list-list-'+id+'">'+
			name+'</td><td><a href="#" id="list-action-edit-'+id+'">'+
			'<i id="list-action-edit" class="icon-pencil list-action-edit">'+
			'</i></a><a href="#" id="list-action-delete-'+id+'"><i id="list-action-delete" class="icon-remove list-action-delete"></i></td></tr>');
		}
		$('#shoppinglist-list-manage').trigger('update');
	}
	
	function insertItem(item)
	{
		if(typeof item.status === "undefined")
			item.status = 1;
		if(typeof item.item_id === "undefined")
			item.item_id = "";
		if(typeof item.priority === "undefined")
			item.priority = "";
		if(typeof item.item_name === "undefined")
			item.item_name = "";
		if(typeof item.item_price === "undefined")
			item.item_price = "";
		if(typeof item.quantity === "undefined")
			item.quantity = "";
		if(typeof item.item_units === "undefined")
			item.item_units = "";
		if(typeof item.item_tags === "undefined")
			item.item_tags = "";
		if(typeof item.list_id === "undefined")
			item.list_id = getCurrentList();
		
		append = '<tr id="item-'+item.item_id+'">'+
			'<td><span id="item-status-'+item.item_id+'" class="hide">'+item.status+'</span>'+
			'<span id="item-list-id-'+item.item_id+'" class="hide">'+item.list_id+'</span>'+
			'<input id="item-check-'+item.item_id+'" type="checkbox"/></td>'+
			'<td id="item-priority-'+item.item_id+'">'+item.priority+'</td>'+
			'<td id="item-name-'+item.item_id+'">'+item.item_name+'</td>'+
			'<td id="item-price-'+item.item_id+'">'+item.item_price+'</td>'+
			'<td><span id="item-quantity-'+item.item_id+'">'+item.quantity+'</span>&nbsp;<span id="item-units-'+item.item_id+'">'+item.item_units+'</span></td>'+
			'<td id="item-tags-'+item.item_id+'">'+item.item_tags+'</td>'+
			'<td><ul class="list-inline">'+
			'<li><a id="item-action-edit-'+item.item_id+'" href="#" title="Edit" class="item-action-edit"><i class="icon-pencil item-action-edit"></i></a></li>'+
			'<li><a id="item-action-delete-'+item.item_id+'" href="#" title="Delete" class="item-action-delete"><i class="icon-remove item-action-delete"></i></a></li>'+
			'</ul></td></tr>';
		
		$('#shoppinglist-items tbody').append(append);	 
		if(item.status == 2)
			$('#item-check-'+item.item_id).prop('checked', true);
		$('#shoppinglist-items').trigger('update');
		
	}
	
	function editItem(id)
	{
		item = getItem('#item-', id);
		
		if(screen.width >= 979 || window.screen.availWidth >= 979) {
			container = '#add-item-';
			$('#modal-add-item').addClass('modal');
			$('#modal-add-item').modal('show');
			$('#modal-add-item #btn-add-item').hide();
			$('#modal-add-item #btn-update-item').show();
			
			itemToForm(item, '#form-modal-add-item');
		}
		else {
			container = '#inline-add-item-';
			$('#inline-add-item').slideDown();
			$('#inline-btn-add-item').hide();
			$('#inline-btn-update-item').show();
			itemToForm(item, '#form-inline-add-item');
		}
	}
	
	function editList(id) 
	{
		$('#sl-dialog-new-list .modal-header h3').text('Rename List');
		$('#sl-form-new-list button[name=btn-add]').text('Rename').attr('data-action', 'rename');
		list = getList(id);
		$('#sl-form-new-list input[name=name]').val(list.name);
		$('#sl-form-new-list input[name=id]').val(list._id);
		showNewListDialog();
	}
	
	//Helper functions
	
	function showNewListDialog()
	{
		if(screen.width >= 979) {
			convertToModal('#sl-dialog-new-list');
			$('#sl-dialog-new-list').modal({
				keyboard: false,
				background: 'static'
			});
			
			$(document).on('hidden', '#sl-dialog-new-list', function() {
				closeNewListDialog();
			});
		}
		else {
			convertToInline('#sl-dialog-new-list');
			$('#sl-form-new-list').slideDown();
		}
		$('#sl-form-new-list input[name=name]').focus();
		
	}
	
	function closeNewListDialog()
	{
		$('#sl-dialog-new-list').modal('hide');
		$('#sl-dialog-new-list').slideUp();
		$('#sl-dialog-new-list .modal-header h3').text('New List');
		$('#sl-form-new-list button[name=btn-add]').text('Create').attr('data-action', 'create');
		$('#sl-form-new-list input').removeClass('error');
		$('#sl-form-new-list label.error').remove();
		clearInput('#sl-form-new-list');
	}
	
	function getCurrentList()
	{
		return $('#shoppinglist-list').val();
	}
	
	function selectList(id)
	{
		$('#shoppinglist-list').val(id);
	}
	
	function getList(id) {
		list = {};
		list.name = $('#shoppinglist-list-manage #list-list-'+id).text();
		list._id = id;
		return list;
	}
	
	function getItem(namespace, id) 
	{
		item = {};
		if(!(typeof id === "undefined")) {
			item.item_id = id;
			item.item_name = $(namespace+'name-'+id).text();
			item.status = $(namespace+'status-'+id).text();
			item.priority = $(namespace+'priority-'+id).text();
			item.item_price = $(namespace+'price-'+id).text();
			item.quantity = $(namespace+'quantity-'+id).text();
			item.item_units = $(namespace+'units-'+id).text();
			item.item_tags = $(namespace+'tags-'+id).text();
			item.list_id = $(namespace+'list-id-'+id).text();
		}
		else {
			item.item_id = $(namespace+'id').val();
			item.item_name = $(namespace+'name').val();
			item.status = $(namespace+'status').val();
			item.priority = $(namespace+'priority').val();
			item.item_price = $(namespace+'price').val();
			item.quantity = $(namespace+'quantity').val();
			item.item_units = $(namespace+'units').val();
			item.item_tags = $(namespace+'tags').val();
			item.list_id = $(namespace+'list-id').val();
		}
		
		return item;
	}
	
	function formToItem(form)
	{
		item = {};
		item.item_id = $(form+' input[name=item_id]').val();
		item.priority = $(form+' input[name=priority]').val();
		item.item_name = $(form+' input[name=item_name]').val();
		item.status = $(form+' input[name=status]').val();
		item.item_price = $(form+' input[name=item_price]').val();
		item.quantity = $(form+' input[name=quantity]').val()
		item.item_units = $(form+' input[name=item_units]').val();
		item.item_tags = $(form+' input[name=item_tags]').val();
		item.list_id = $(form+' input[name=list_id]').val();
		
		return item;
	}
	
	function itemToForm(item, form)
	{
		$(form+' input[name=item_id]').val(item.item_id);
		$(form+' input[name=priority]').val(item.priority);
		$(form+' input[name=item_name]').val(item.item_name);
		$(form+' input[name=status]').val(item.status);
		$(form+' input[name=item_price]').val(item.item_price);
		$(form+' input[name=quantity]').val(item.quantity)
		$(form+' input[name=item_units]').val(item.item_units);
		$(form+' input[name=item_tags]').val(item.item_tags);
		$(form+' input[name=list_id]').val(item.list_id);
	}
	
	function isTouchDevice(){
		try{
			document.createEvent("TouchEvent");
			return true;
		}catch(e){
			return false;
		}
	}
	
	function touchScroll(id){
		if(isTouchDevice()){ //if touch events exist...
			var el=document.getElementById(id);
			var scrollStartPos=0;
	
			document.getElementById(id).addEventListener("touchstart", function(event) {
				scrollStartPos=this.scrollTop+event.touches[0].pageY;
				event.preventDefault();
			},false);
	
			document.getElementById(id).addEventListener("touchmove", function(event) {
				this.scrollTop=scrollStartPos-event.touches[0].pageY;
				event.preventDefault();
			},false);
		}
	}
	
	/* *
	 * 
	 * AJAX functions 
	 * 
	 * */
	
	
	function refreshLists(select) {
		
		$.getJSON('/shoppinglist/list/get', function(data) {
			$('#shoppinglist-list-manage tbody').html('');
			$('#shoppinglist-list').html('');
			$.each(data, function(i, v) {
				insertList(v._id, v.name);
			});
			$('#shoppinglist-list-manage').trigger('update');
			if(typeof select === "undefined") $('#shoppinglist-list').val($('#shoppinglist-list option:first').val())
			else selectList(select);
			refreshItems();
		});
	}
	
	function refreshItems(listID) {
		showThrobber('#content-shoppinglist');
		call = '/shoppinglist/item/get?list=';
		if(typeof listID === "undefined") {
			call = call + getCurrentList();
		}
		else {
			call = call + listID;
		}
		
		$('#shoppinglist-items tbody').html('');
		$.getJSON(call, function(data) {
			for(d in data) {
				insertItem(data[d]);
			}
			hideThrobber();
		});
	}
	
	function slNewItem(item) {
		$.post("/shoppinglist/item/update", item, function() {
			notify('New item added successfully!', 'alert-success');
			refreshItems();
		});
	}
	
	function slUpdateItem(item, refresh) {
		$.post("/shoppinglist/item/update", item, function() {
			if(typeof refresh === "undefined" || refresh == true) {
				notify('Item updated successfully!', 'alert-success');
				refreshItems();
			}
		});
	}
	
	
	function slDeleteItem(id)
	{
		$.get("/shoppinglist/item/delete?id="+id, function() {
			notify('Item deleted successfully!', 'alert-success');
			refreshItems();
		});
	}
	
	function slNewList(list)
	{
		$.get("/shoppinglist/list/new?name="+list, function() {
			notify('New list added', 'alert-success');
			refreshLists(-1);
		});
	}
	
	function slRenameList(id, newName)
	{
		$.get("/shoppinglist/list/rename?id="+id+"&newname="+newName, function() {
			notify('List renamed successfully', 'alert-success');
			refreshLists(-1);
		});
	}
	
	function slDeleteList(id)
	{
		$.get("/shoppinglist/list/delete?id="+id, function() {
			notify('List deleted', 'alert-success');
			refreshLists(-1);
		})
	}
}( window.ShoppingList = window.ShoppingList || {}, jQuery ));