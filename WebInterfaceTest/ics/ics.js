$(function() {
	$('#actionButton').click(function(e) {
		
		hideMenu();
		
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
	});
	
	$('#actionButton').blur(function() { 
		hideMenu();
	});
});

function hideMenu()
{
	var classes = $('#menu ul').attr('class');
	if(!classes || classes.indexOf('shown') < 0)
	{
		return;
	}
		
	$('#menu ul').hide('slideUp', function() 
	{
			$('#menu ul').css('top', '600%'); // Hide the element from view
			$('#menu ul').removeClass('shown');
	});
}
