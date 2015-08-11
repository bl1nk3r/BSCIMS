	$('#submitFinanceObjButton').click(function(){

		var objPers = "Finance",
			objDescr = $('#financeObjDescription').val(),
			objDSO = $('#financeDSODescription').val(),
			perfPoorDescr = $('#poorPerfField').val(),
			perfUnsatDescr = $('#unsatPerfField').val(),
			perfTargetDesc = $('#targetPerfField').val(),
			perfExceedDescr = $('#exceedPerfField').val(),
			perfOutstandDescr = $('#outstandPerfField').val(),
			//objDuration = $().val(),
			createdBy = "Roy Dlamini"
			//alert('Done');

			
			/*$('#poorPerfSelect').change(function(){
	     		var perfPoorSelect = $(this).val();

	 		});

			
			$('#unsatPerfSelect').change(function(){
				perfUnsatSelect = $(this).val();
			});

			

			$('#targetPerfSelect').change(function(){
				perfTargetSelect = $(this).val();
			});

			

			$('#exceedPerfSelect').change(function(){
				perfExceedSelect = $(this).val();
			});

			

			$('#outstandPerfSelect').change(function(){
				var perfOutstandSelect = $(this).val();
			});
			
		/*collection.insert({
			/*Division : {},
			Division.DivName : "Finance",
			Division.GM : "Laurence Nsibande",
			Division.Department : {},
			Division.Department.DepName : "I.T",
			Division.Department.DepManager : "Melusi Malinga",
			Division.Department.Section : {},
			Division.Department.Section.SecName : "Networking and Security",
			Division.Department.Section.SecHead : "Mduduzi Maseko",
			Division.Department.Section.NumEmp : "4",
			Division.Department.Section.Employee : {},
			Division.Department.Section.Employee.PFNum : "498",
			Division.Department.Section.Employee.EmpName : "Roy Dlamini",
			Division.Department.Section.Employee.DOB : "17 August 1968",
			Division.Department.Section.Employee.Gender : "Male",
			Division.Department.Section.Employee.Address : "P.O. Box 1325 Mbabane",
			Division.Department.Section.Employee.Email : "roy.dlamini@sec.co.sz",
			Division.Department.Section.Employee.Position : "Technician"
			name : "Roy Dlamini",
			position : "Technician",
			gender : "Male"

			}, function(error){
			console.log("Successfully inserted Roy!");
		});*/
	});

	//});
//});