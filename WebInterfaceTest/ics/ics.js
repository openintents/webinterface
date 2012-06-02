$(function() {
	/*$('#actionButton').click(function(e) {
		
		if(hideMenu())
			return;
		
		$('#menu ul').show();
		$('#menu ul').position({
			my: "right top",
			at: "right bottom",
			of: $('#actionButton'),
			collision: "fit"
		});
		$('#menu ul').hide();
		$('#menu ul').slideDown();
		$('#menu ul').addClass('shown');
	});*/
	
	/*$('#actionButton').blur(function() { 
		hideMenu();
	});*/
	
	$('#nav').hide(); // Hide the sidebar
	
	$('#content').css('margin-left','25%');
	//resizeUI();
	
	$('#menuToggleSidebar').click(function() {
		toggleSidebar();
	});
});

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
	if(classes.indexOf('shown') < 0)
	{
		$('#nav').addClass('shown');
		//resizeUI();
		$('#nav').show('slow');
	}
	else
	{
		$('#nav').removeClass('shown');
		$('#nav').hide('slow', function() { /*resizeUI();*/ });
	}
}

// Resize interface, applying various classes

function resizeUI()
{
	if($('#nav').attr('class').match(/.*shown.*/ig)) // Navbar is Shown
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
