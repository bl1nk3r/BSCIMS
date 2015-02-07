$(document).ready(function(){
	$(':text').focusin(function(){
		$(this).css('background-color', 'grey');
	});

	//$('#successAlert').hide();
	$('#warningAlert').hide();

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

	$('#loginButton').click(function(){
    var login    = $('#loginName').val();
		password = $('#loginPass').val();

    /*the following code checks whether the entered userid and password are matching*/
    /*if(form.firstname.value == (data.Login) && form.pwd.value == (data.Pass))*/
    if((login == "admin") && (password == "admin"))
    {
       window.open('index.html'); /*opens the target page while Id & password matches*/
    }
    else
    {
    //alert("Incorrect login!")/*displays error message*/
    	//e.preventDefault();
		$('#warningAlert').slideDown();
		//$('#warningAlert').fade(1000);
    }
    //}

  });
});
//$('#successAlert').slideDown();