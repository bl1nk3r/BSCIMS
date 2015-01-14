$(document).ready(function(){

	$(function(){
		$('#loginButton').click( function(e){
			e.preventDefault();
			$('#successAlert').slideDown();
		});		
	});

	$('#financeForm').hide();
	$('#financePerspDiv').hide();

	$('#objPerspDropdownMenu').change(function(){
		value = $(this).val();

		if (value == 'financeSelect'){
			$('#financeForm').show(500);
			$('#financePerspDiv').show(500);
		}
	});
});
