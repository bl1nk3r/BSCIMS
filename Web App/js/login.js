$(document).ready(function(){
	$(':text').focusin(function(){
		$(this).css('background-color', 'grey');
	});

	$(':password').focusin(function(){
		$(this).css('background-color', 'grey');
	});

	$(':text').blur(function(){
		$(this).css('background-color', 'white');
	});
	$(':password').blur(function(){
		$(this).css('background-color', 'white');
	});

	$(':submit').click(function(){
		$(this).attr('value', 'Logging in...');
	});

	$('#').click(function(){
		$('')
	});
});