$(function() {
	$('#actionButton').click(function() {
		$('#menu ul').show();
		$('#menu ul').position({
			my: "right top",
			at: "right bottom",
			of: $('#actionButton'),
			collision: "fit"
		});
		$('#menu ul').hide();
		$('#menu ul').slideDown();	
	});
	
	$('#actionButton').blur(function() { 
		$('#menu ul').hide('slideUp', function() {
			$('#menu ul').css('top', '600%'); // Hide the element from view
		});
	});
});
