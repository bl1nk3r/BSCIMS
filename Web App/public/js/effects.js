$(document).ready(function(){

	$('#successObjAlert1').hide();	//hide the successObjAlert for now
	$('#successObjAlert2').hide();	//hide the successObjAlert for now
	$('#successObjAlert3').hide();	//hide the successObjAlert for now
	$('#successObjAlert4').hide();	//hide the successObjAlert for now
	//hide the financeForm when the page loads along with the perspectiveDiv
	$('#financeForm').hide();
	$('#financePerspDiv').hide();

	//hide the customerForm when the page loads along with the perspectiveDiv
	$('#customerForm').hide();
	$('#customerPerspDiv').hide();

	//hide the internalForm when the page loads along with the perspectiveDiv
	$('#internalForm').hide();
	$('#internalPerspDiv').hide();

	//hide the internalForm when the page loads along with the perspectiveDiv
	$('#learnForm').hide();
	$('#learnPerspDiv').hide();

	//hide all objectives tables upon page load
	$('#financeObjectivesTable').hide();
	$('#customerObjectivesTable').hide();
	$('#internalObjectivesTable').hide();
	$('#learningObjectivesTable').hide();

	//$('#confirmEmailDiv').hide();



	$('#objPerspDropdownMenu').change(function(){ //inspect the dropdown selection
		value = $(this).val();

		if (value == 'financeSelect'){			  
			$('#customerForm').hide(500);	
			$('#customerPerspDiv').hide(500);
			$('#internalForm').hide(500);	
			$('#internalPerspDiv').hide(500);
			$('#learnForm').hide(500);	
			$('#learnPerspDiv').hide(500);

			$('#financeForm').show(500);			//reveal the financeForm with its perspectiveDiv
			$('#financePerspDiv').show(500);
		}

		else if (value == 'customerSelect'){		
			$('#financeForm').hide(500);	
			$('#financePerspDiv').hide(500);
			$('#internalForm').hide(500);	
			$('#internalPerspDiv').hide(500);
			$('#learnForm').hide(500);	
			$('#learnPerspDiv').hide(500);
			$('#successObjAlert').hide();

			$('#customerForm').show(500);			//reveal the customerForm with its perspectiveDiv
			$('#customerPerspDiv').show(500);
		}

		else if (value == 'internalSelect'){		
			$('#financeForm').hide(500);	
			$('#financePerspDiv').hide(500);
			$('#customerForm').hide(500);	
			$('#customerPerspDiv').hide(500);
			$('#learnForm').hide(500);	
			$('#learnPerspDiv').hide(500);


			$('#internalForm').show(500);			//reveal the internalForm with its perspectiveDiv
			$('#internalPerspDiv').show(500);
		}

		else if (value == 'learnSelect') {		
			$('#financeForm').hide(500);	
			$('#financePerspDiv').hide(500);
			$('#customerForm').hide(500);	
			$('#customerPerspDiv').hide(500);
			$('#internalForm').hide(500);	
			$('#internalPerspDiv').hide(500);


			$('#learnForm').show(500);			//reveal the internalForm with its perspectiveDiv
			$('#learnPerspDiv').show(500);
		}

		else if (value == 'default') {		
			$('#financeForm').hide(500);	
			$('#financePerspDiv').hide(500);
			$('#customerForm').hide(500);	
			$('#customerPerspDiv').hide(500);
			$('#internalForm').hide(500);	
			$('#internalPerspDiv').hide(500);


			$('#learnForm').hide(500);			//reveal the internalForm with its perspectiveDiv
			$('#learnPerspDiv').hide(500);
		}
	});

	$('#perspectiveDropDownMenu').change(function() {
		value = $(this).val();

		if (value == 'financeSelect') {
			$('#financeObjectivesTable').show(500);
			$('#customerObjectivesTable').hide(500);
			$('#internalObjectivesTable').hide(500);
			$('#learningObjectivesTable').hide(500);
		}

		else if (value == 'customerSelect') {
			$('#financeObjectivesTable').hide(500);
			$('#customerObjectivesTable').show(500);
			$('#internalObjectivesTable').hide(500);
			$('#learningObjectivesTable').hide(500);
		}

		else if (value == 'internalSelect') {
			$('#financeObjectivesTable').hide(500);
			$('#customerObjectivesTable').hide(500);
			$('#internalObjectivesTable').show(500);
			$('#learningObjectivesTable').hide(500);
		}

		else if (value == 'learnSelect') {
			$('#financeObjectivesTable').hide(500);
			$('#customerObjectivesTable').hide(500);
			$('#internalObjectivesTable').hide(500);
			$('#learningObjectivesTable').show(500);
		}

		else if (value == 'default') {
			$('#financeObjectivesTable').hide(500);
			$('#customerObjectivesTable').hide(500);
			$('#internalObjectivesTable').hide(500);
			$('#learningObjectivesTable').hide(500);
		}
	});
});
