$('#loginButton').click(function () {
	if($('#empRole').is(':checked')){
		$('#employeeTab').addClass("active");
	} else if ($('#supervisorRole').is(':checked')) {
		$('#supervisorTab').addClass("active");
	}else if ($('#HRRole').is(':checked')) {
		$('#HRTab').addClass("active");
	}
});