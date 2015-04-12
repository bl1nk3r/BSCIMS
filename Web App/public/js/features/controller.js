 //using $scope to bind data models from the UI to the angular script (interchangeably)
var bsc = angular.module('BSCIMS', []);

/***********************************************************************************************************************************************
***********************************************GLOBAL SERVICES**********************************************************************************
***********************************************************************************************************************************************/

 //this service retrieves and globally stores all objectives (with a default status of "unapproved") to be used by any controller
 bsc.service('allObjectives', ['$http', function ($http){
		this.getObjectives = function () {
			return $http.post("/getAllObjectives");
		}
	}])

//while this one does the same only for objectives that have been sent for processing or approval (with a status of  "sent_for_approval")
 	.service('pendingObjectives', ['$http', function ($http) {
 		this.getPending = function() {
 			return $http.post('/getPendingObjectives');
 		}
 	}])

 	.service('approvedObjectives', ['$http', function ($http) {
 		this.getApproved = function() {
 			return $http.post('/getApprovedObjectives');
 		}
 	}])

 	/*.controller('allObjectivesCtrl', ['allObjectives', '$scope', function(allObjectives, $scope){
 		$scope.allObjectives = allObjectives;
 	}])*/


/***********************************************************************************************************************************************
*********************************************************MANAGE EMPLOYEES***********************************************************************
***********************************************************************************************************************************************/
	.service('manageEmployeeData', ['$http', '$q', function ($http, $q) {
		this.insertEmp = function(emp) {
			return $http.post('/addEmp', emp);
		}

		this.authenticate = function(loginEmp) {
			return $http.post('empAuthenticate', loginEmp);
		}

		this.getEmps = function() {
			var deferred = $q.defer();
			$http.post('/showAllEmps').success(function (res) {
				deferred.resolve(res);
				console.log(res);
			}).error(function (res) {
				deferred.reject(res);
			});

			return deferred.promise;	
		}

		this.getDivs = function() {
			var deferred = $q.defer();
			$http.post('/showAllDivisions').success(function (res) {
				deferred.resolve(res);

				//console.log(res);
			}).error(function (res) {
				deferred.reject(res);
			});

			return deferred.promise;	
		}

		this.getLoggedInEmp = function () {
		return $http.post('/getLoggedInEmp');

		this.lastLogIn = null;
	}

	}])

/***********************************************************************************************************************************************
***********************************************EMPLOYEE CONTROLLER******************************************************************************
***********************************************************************************************************************************************/
	.controller('manageEmployees', ['$q', '$scope', '$rootScope', '$http', 'manageEmployeeData', 
		function ($q, $scope, $rootScope, $http, manageEmployeeData) {

		$scope.loginStatus = true,
		$scope.hasUserInfo = false,
		$scope.loginState = "Not logged in!",
		//Below are the login access roles : Supervisor, Employee and HR officer
		$scope.supervisorRole = false,
		$scope.isSup = false,
		$scope.empRole = false,
		$scope.isEmp = false,
		$scope.HRRole = false,
		$scope.isHR = false,
		$scope.loginError = "Enter Your ID!",
		$scope.hasLoginError = false,
		$scope.empRole.checked = true;

		$scope.getLoggedUser = function () {
			$http.post("/getLoggedInEmp").success(function(resp){
				console.log("Logged In User : ");
				console.log(resp);

				for (var i=0; i<resp.chosenRoles.length; i++) {
					if (resp.chosenRoles[i].isEmp) {
						$scope.isEmp = true;
					}
					if (resp.chosenRoles[i].isSup) {
						$scope.isSup = true;
					}
					if (resp.chosenRoles[i].isHr) {
						$scope.isHr = true;
					}
				}
				
			});
		}

		$scope.getLoggedUser();

		//validate user access role after capturing from login form and throw appropriate errors
		$scope.validate = function() {

			$scope.loginErrorMsgs = [],
			$scope.userFormRoles = [];

			var userRoleError = "Opt for at least one role!",
				user_Pass_Error = "Incorrect username / password combination!",
				supervisorRoleError = "You currently don't have a supervisor role!",
				HRRoleError = "You seem not to be an HR officer!",

				//retrieve login values from login form
				loginEmp = {empName: $scope.empName, password: $scope.password}; 

				manageEmployeeData.authenticate(loginEmp).success(function (data) {

					$scope.employeeName = data.empName,
					$scope.employeePassword = data.password,
					$scope.employeeRoles  = data.roles,
					$scope.employeePF = data.PFNum;

					if($scope.empName != $scope.employeeName && $scope.password != $scope.employeePassword) {

						$scope.loginErrorMsgs.push(user_Pass_Error),
						$scope.hasLoginError = true;
					}	
					else if (!$scope.supervisorRole && !$scope.employeeRole && !$scope.HRRole) {

						$scope.loginErrorMsgs.push(userRoleError),
						$scope.hasLoginError = true;
					}	
					else if ($scope.supervisorRole && ($scope.employeeRoles.indexOf("supervisor") <= -1)) {

						$scope.loginErrorMsgs.push(supervisorRoleError),
						$scope.hasLoginError = true;
					}
					else if ($scope.HRRole && ($scope.employeeRoles.indexOf("HR") <= -1)) {

						$scope.loginErrorMsgs.push(HRRoleError),
						$scope.hasLoginError = true;
					}
					else {

						$scope.loginState = "Logged In";

						var loggedInEmp = { employeeName: $scope.employeeName, employeePassword: $scope.employeePassword, employeeRoles: $scope.employeeRoles};

						//Store information of currently logged in user in a service
						manageEmployeeData.setCurrentLoggedInEmp (loggedInEmp);

						//initialize current employee with the employee object defined above
						$scope.currentEmp = loggedInEmp;

						//match employee roles from the form with the ones in DB
						if ($scope.supervisorRole && ($scope.employeeRoles.indexOf("supervisor") > -1)) {
							$scope.isSupervisor = true;
						}

						if ($scope.HRRole && ($scope.employeeRoles.indexOf("HR") > -1)) {
							$scope.isHR = true;
						}
						if ($scope.employeeRole && ($scope.employeeRoles.indexOf("employee") > -1)) {
							$scope.isHR = true;
						}
					} //end 'if' of 'else'

				}).error(function (error){}); 
		} //end of validate function

		$scope.addEmp = function(){

		$scope.hasAddEmpError = false;
		$scope.addEmpErrorMsgs = [];
		$scope.empInserted = false;
		$scope.empInsertedMsg = '';

		var passwordMissMatchError = "Passwords do not match"
		    ,empRoleError = "Assign at least one role to the user"
		    ,emptyEmpNameError = "Username cannot be empty"
		    ,emptyPasswordError = "Password cannot be empty"
		    ,emptyPassword2Error = "Password two cannot be empty"
		    ,emptyFirstNameError = "Firstname cannot be empty"
		    ,emptyLastNameError = "Lastname cannot be empty"
		    ,emptyStationError = "Station cannot be empty";

		//check if fields are filled
		if ($scope.employeeName == null){

			$scope.addEmpErrorMsgs.push(emptyEmpNameError);
			$scope.hasAddEmpError = true;
		} 
		else if ($scope.employeePassword == null){

			$scope.addEmpErrorMsgs.push(emptyPasswordError);
			$scope.hasAddEmpError = true;
		} 
		else if ($scope.employeePassword2 == null){

			$scope.addEmpErrorMsgs.push(emptyPassword2Error);
			$scope.hasAddEmpError = true;
		} 
		else if ($scope.firstname == undefined){

			$scope.addEmpErrorMsgs.push(emptyFirstNameError);
			$scope.hasAddEmpError = true;
		} 
		else if ($scope.lastname == undefined){

			$scope.addEmpErrorMsgs.push(emptyLastNameError);
			$scope.hasAddEmpError = true;
		} 
		else if (!$scope.supervisorRole && !$scope.HRRole && !$scope.employeeRole) {

			$scope.addEmpErrorMsgs.push(empRoleError);
			$scope.hasAddEmpError = true;
		}

		//check if entered passwords match
		else if ($scope.employeePassword !== $scope.employeePassword2) {

			$scope.addEmpErrorMsgs.push(passwordMissMatchError);
			$scope.hasAddEmpError = true;
		} 
		else {
			//initial employee roles
			$scope.employee = false;
			$scope.supervisor = false;
			$scope.HR = false;

			//store employee roles selected
			var empRoles = [];

			if ($scope.employeeRole) {
				empRoles.push("employee");
			}
			if ($scope.supervisorRole){
				empRoles.push("supervisor");
			}
			if ($scope.HRRole){
				empRoles.push("HR");
			}

			//create user object from form
			var newEmp = {empName:$scope.empName, password:$scope.password, firstname:$scope.firstname, lastname:$scope.lastname, roles:empRoles};

			manageEmpData.insertEmp(newEmp)
	            .success(function (res) {
	            	$scope.empInsertedMsg = res;
	                $scope.empInserted = true;
	            
	                $scope.clearNewEmp();
	            })
	            .error(function (error) {
	                $scope.addEmpErrorMsgs.push(error);
					$scope.hasAddEmpError = true;
	            });
	    }
	}//add employee function ends

	$scope.showEmployees = function() {
		manageEmployeeData.getEmps()
			.then(function (data) {
				$scope.emps = data;

				console.log(data);
			});
	}

	$scope.clearNewEmp = function() {
		$scope.empName = '',
		$scope.employeePassword = '',
		$scope.employeePassword2 = '',
		$scope.firstname = '',
		$scope.lastname = '',
		$scope.supervisorRole = '',
		$scope.employeeRole = '',
		$scope.HRRole = '';
	}

	$scope.clearLogin = function() {
		$scope.empName = '',
		$scope.password = '',
		$scope.supervisorRole = '',
		$scope.employeeRole = '',
		$scope.HRRole = '';
	}

	}])

 .controller('hrRolesController',['$scope','$http','manageEmployeeData', function($scope, $http, manageEmployeeData){
		$scope.getDivisions = function () {
			manageEmployeeData.getDivs()
				.then (function (data) {

					var arr = data;
					for( var i = 0; i < arr.length; i++){
						$scope.division = data[i];
						$scope.sections = $scope.division.Department[i].Section;
						$scope.departments = $scope.division.Department;
						$scope.employees = $scope.division.Department[i].Section[i].Employee;
					}
				});
		}

		$scope.getDivisions();

		$scope.getSecEmployees = function (section,dept,div) {
			$scope.section = section;
			var deptIndex = null;
			var secIndex = null;
			var div = {divName : div};
			$http.post('/getSecEmployees', div).success(function(resp) {
				var secDiv = resp[0];
				$scope.divDepartments = secDiv.Department;

				for (var i=0; i < $scope.divDepartments.length; i++) {
				  	if ($scope.divDepartments[i].DeptName == dept) {
				  		deptIndex = i;
				  		$scope.depSections = secDiv.Department[deptIndex].Section;

					  	for (var n=0; n < $scope.depSections.length; n++) {
					  		if ($scope.depSections[n].SecName == section) {
					  			var secIndex = n;
					  			$scope.secEmployees = $scope.depSections[secIndex].Employee;
					  		}
				  		}
				  	}
				}

			});
		}

		$scope.getEmpObjectives = function (pfnum, name) {
			$scope.empName = name;
			var emp = {pfno:pfnum};
			console.log(pfnum);
			$http.post('/getEmpObjectives', emp).success(function(resp) {
				console.log(resp);
			});
		}
 }])


/***********************************************************************************************************************************************
*****************************************************FINANCE PERSPECTIVE CONTROLLER*************************************************************
************************************************************************************************************************************************/
   .controller('financePerspectiveController', function ($scope, $http) {
		
	$scope.poorOptions = [{ label: '-Select metric-', value: 0},
						  { label: '>15% budget variance', value: 15 },
    				      { label: '>16% budget variance', value: 16 },
  					      { label: '>17% budget variance', value: 17 },
  					      { label: '>18% budget variance', value: 18 }
  					     ];

  	$scope.unsatOptions = [{ label: '-Select metric-', value: 0},
				           { label: '>19% budget variance', value: 19 },
    			           { label: '>20% budget variance', value: 20 },
  				           { label: '>21% budget variance', value: 21 },
  				           { label: '>22% budget variance', value: 22 }
  				          ];

  	$scope.targetOptions = [{ label: '-Select metric-', value: 0},
						    { label: '9% budget variance  ', value: 9 },
    				        { label: '10% budget variance ', value: 10 },
  					        { label: '11% budget variance ', value: 11 }
  					       ];

  	$scope.exceedOptions = [{ label: '-Select metric-', value: 0},
					        { label: '<5% budget variance ', value: 5 },
    				        { label: '<6% budget variance ', value: 6 },
  					        { label: '<7% budget variance ', value: 7 }
  					       ];

  	$scope.outstandOptions = [{ label: '-Select metric-', value: 0},
						      { label: '0% budget variance', value: 00 },
    				          { label: '1% budget variance', value: 16 }
  					         ];

  	$scope.monitorChange = function() {
  		console.log($scope.poorOptions);
  	}

		$scope.submitFinanceObjective = function() { 

			$scope.createObjectiveErrorMsgs = [],
			$scope.hasCreateObjErrors = false;
			var generalErrorMsg = "Please ensure that all fields are filled!"
				objDescriptionError = "This field cannot be left blank!",
				objDSOError = "Please define the Key Performance Indicator!",
				poorOptionsSelectError = "Select a minimum metric above!",
				unsatOptionsSelectError = "Select an unsatisfactory metric above!",
				targetOptionsSelectError = "Verfiy the 'Target Met' metric above!",
				exceedOptionsSelectError = "Select an exceed metric above!",
				outstandOptionsSelectError = "Select an outstanding metric above!",
				poorOptionsDefError = "Define the poor metric above!",
				unsatOptionsDefError = "Define the unsatisfactory metric above!",
				targetOptionsDefError = "Define the 'Target Met' metric above!",
				exceedOptionsDefError = "Define the exceed metric above!",
				outstandOptionsDefError = "Define the outstanding metric above!";

			if ($scope.financePerspectiveController.description == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDescriptionError);
			}
			else if ($scope.financePerspectiveController.DSO == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDSOError);
			}
			else if ($scope.poorOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsSelectError);
			}
			else if ($scope.unsatOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsSelectError);
			}
			else if ($scope.targetOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsSelectError);
			}
			else if ($scope.exceedOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsSelectError);
			}
			else if ($scope.outstandOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsSelectError);
			}
			else if ($scope.financePerspectiveController.metricOneDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsDefError);
			}
			else if ($scope.financePerspectiveController.metricTwoDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsDefError);
			}
			else if ($scope.financePerspectiveController.metricThreeDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsDefError);
			}
			else if ($scope.financePerspectiveController.metricFourDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsDefError);
			}
			else if ($scope.financePerspectiveController.metricFiveDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsDefError);
			}
			else {

		    	$http.post("/financePerspectiveController", $scope.financePerspectiveController)
		    	.success(function (resp){
		    		//console.log(resp);
		    		$scope.Objective = resp;
		    		console.log($scope.Objective);
		    		$('#successObjAlert1').slideDown();
		    	});
		    }
	    };	

		$scope.renderFinancePerspective = function (response) {
			$scope.financePerspective = response;
		};

		$scope.retrieveFinanceObjectives = function() {
			$http.get("/retrieveFinanceObjectives")
			.success(function (res, err) {
				if (err) {console.log(err);}
				console.log(res);
			});
			//.success($scope.renderFinancePerspective);
		};


		$scope.removeFinanceObjective = function (id) {
			$http.delete("/financePerspectiveController" + id)
			.success(function (response) {
				$scope.retrieve();
			});
		};

		//annyang environment (voice command functionality)
		var commands = {
			'create objective' : function() {
				$scope.$apply();
			}
		}

		annyang.addCommands(commands);
		annyang.debug();
		annyang.start();
})



/***********************************************************************************************************************************************
*****************************************************CUSTOMER PERSPECTIVE CONTROLLER*************************************************************
************************************************************************************************************************************************/
    .controller('customerPerspectiveController', function ($scope, $http) {
		
	$scope.poorOptions = [{ label: '-Select metric-', value: 0},
						  { label: '>15% budget variance', value: 15 },
    				      { label: '>16% budget variance', value: 16 },
  					      { label: '>17% budget variance', value: 17 },
  					      { label: '>18% budget variance', value: 18 }
  					     ];

  	$scope.unsatOptions = [{ label: '-Select metric-', value: 0},
				           { label: '>19% budget variance', value: 19 },
    			           { label: '>20% budget variance', value: 20 },
  				           { label: '>21% budget variance', value: 21 },
  				           { label: '>22% budget variance', value: 22 }
  				          ];

  	$scope.targetOptions = [{ label: '-Select metric-', value: 0},
						    { label: '9% budget variance', value: 9 },
    				        { label: '10% budget variance', value: 10 },
  					        { label: '11% budget variance', value: 11 }
  					       ];

  	$scope.exceedOptions = [{ label: '-Select metric-', value: 0},
					        { label: '<5% budget variance', value: 5 },
    				        { label: '<6% budget variance', value: 6 },
  					        { label: '<7% budget variance', value: 7 }
  					       ];

  	$scope.outstandOptions = [{ label: '-Select metric-', value: 0},
						      { label: '0% budget variance', value: 00 },
    				          { label: '1% budget variance', value: 16 }
  					         ];
  	$scope.perspective = "customer",
  	$scope.status = "unapproved";

		$scope.submitCustomerObjective = function() {

			$scope.createObjectiveErrorMsgs = [],
			$scope.hasCreateObjErrors = false;
			var objDescriptionError = "This field cannot be left blank!",
				objDSOError = "Please define the Key Performance Indicator!",
				poorOptionsSelectError = "Select a minimum metric above!",
				unsatOptionsSelectError = "Select an unsatisfactory metric above!",
				targetOptionsSelectError = "Verfiy the 'Target Met' metric above!",
				exceedOptionsSelectError = "Select an exceed metric above!",
				outstandOptionsSelectError = "Select an outstanding metric above!",
				poorOptionsDefError = "Define the poor metric above!",
				unsatOptionsDefError = "Define the unsatisfactory metric above!",
				targetOptionsDefError = "Define the 'Target Met' metric above!",
				exceedOptionsDefError = "Define the exceed metric above!",
				outstandOptionsDefError = "Define the outstanding metric above!";

			if ($scope.customerPerspectiveController.description == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDescriptionError);
			}
			else if ($scope.customerPerspectiveController.DSO == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDSOError);
			}
			else if ($scope.poorOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsSelectError);
			}
			else if ($scope.unsatOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsSelectError);
			}
			else if ($scope.targetOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsSelectError);
			}
			else if ($scope.exceedOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsSelectError);
			}
			else if ($scope.outstandOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsSelectError);
			}
			else if ($scope.customerPerspectiveController.metricOneDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsDefError);
			}
			else if ($scope.customerPerspectiveController.metricTwoDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsDefError);
			}
			else if ($scope.customerPerspectiveController.metricThreeDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsDefError);
			}
			else if ($scope.customerPerspectiveController.metricFourDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsDefError);
			}
			else if ($scope.customerPerspectiveController.metricFiveDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(oustandOptionsDefError);
			}
			else {

				console.log($scope.customerPerspectiveController);
		    	$http.post("/customerPerspectiveController", $scope.customerPerspectiveController)
		    	.success(function(resp){
		    		//console.log(resp);
		    		$('#successObjAlert2').slideDown();
		    	});
		    }
	    };	

		$scope.renderCustomerPerspective = function(response) {
			$scope.customerPerspective = response;
		};

		$scope.retrieve = function() {
			$http.get("/customerPerspective")
			.success($scope.renderCustomerPerspective);
		};

		//hasn't been tested yet! <TODO>
		$scope.removeCustomerObjective = function(id) {
			$http.delete("/customerPerspectiveController" + id)
			.success(function (response) {
				$scope.retrieve();
			});
		};
})

/***********************************************************************************************************************************************
*****************************************************LEARN PERSPECTIVE CONTROLLER***************************************************************
************************************************************************************************************************************************/
   .controller('learnPerspectiveController', function ($scope, $http) {

	$scope.poorOptions = [{ label: '-Select metric-', value: 0},
						  { label: '>15% budget variance', value: 15 },
    				      { label: '>16% budget variance', value: 16 },
  					      { label: '>17% budget variance', value: 17 },
  					      { label: '>18% budget variance', value: 18 }
  					     ];

  	$scope.unsatOptions = [{ label: '-Select metric-', value: 0},
				           { label: '>19% budget variance', value: 19 },
    			           { label: '>20% budget variance', value: 20 },
  				           { label: '>21% budget variance', value: 21 },
  				           { label: '>22% budget variance', value: 22 }
  				          ];

  	$scope.targetOptions = [{ label: '-Select metric-', value: 0},
						    { label: '9% budget variance', value: 9 },
    				        { label: '10% budget variance', value: 10 },
  					        { label: '11% budget variance', value: 11 }
  					       ];

  	$scope.exceedOptions = [{ label: '-Select metric-', value: 0},
					        { label: '<5% budget variance', value: 5 },
    				        { label: '<6% budget variance', value: 6 },
  					        { label: '<7% budget variance', value: 7 }
  					          ];

  	$scope.outstandOptions = [{ label: '-Select metric-', value: 0},
						      { label: '0% budget variance', value: 00 },
    				          { label: '1% budget variance', value: 16 }
  					         ];
  	$scope.perspective = "learn",
  	$scope.status = "unapproved";


		$scope.submitLearnObjective = function() {

			$scope.createObjectiveErrorMsgs = [],
			$scope.hasCreateObjErrors = false;
			var objDescriptionError = "This field cannot be left blank!",
				objDSOError = "Please define the Key Performance Indicator!",
				poorOptionsSelectError = "Select a minimum metric above!",
				unsatOptionsSelectError = "Select an unsatisfactory metric above!",
				targetOptionsSelectError = "Verfiy the 'Target Met' metric above!",
				exceedOptionsSelectError = "Select an exceed metric above!",
				outstandOptionsSelectError = "Select an outstanding metric above!",
				poorOptionsDefError = "Define the poor metric above!",
				unsatOptionsDefError = "Define the unsatisfactory metric above!",
				targetOptionsDefError = "Define the 'Target Met' metric above!",
				exceedOptionsDefError = "Define the exceed metric above!",
				outstandOptionsDefError = "Define the outstanding metric above!";

			if ($scope.learnPerspectiveController.description == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDescriptionError);
			}
			else if ($scope.learnPerspectiveController.DSO == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDSOError);
			}
			else if ($scope.poorOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsSelectError);
			}
			else if ($scope.unsatOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsSelectError);
			}
			else if ($scope.targetOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsSelectError);
			}
			else if ($scope.exceedOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsSelectError);
			}
			else if ($scope.outstandOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsSelectError);
			}
			else if ($scope.learnPerspectiveController.metricOneDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsDefError);
			}
			else if ($scope.learnPerspectiveController.metricTwoDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsDefError);
			}
			else if ($scope.learnPerspectiveController.metricThreeDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsDefError);
			}
			else if ($scope.learnPerspectiveController.metricFourDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsDefError);
			}
			else if ($scope.learnPerspectiveController.metricFiveDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsDefError);
			}
			else {
				console.log($scope.learnPerspectiveController);
		    	$http.post("/learnPerspectiveController", $scope.learnPerspectiveController)
		    	.success(function(resp){
		    		//console.log(resp);
		    		$('#successObjAlert4').slideDown();

		    	});
		    }
	    };	

		$scope.renderLearnPerspective = function(response) {
			$scope.learnPerspective = response;
		};

		$scope.retrieve = function() {
			$http.get("/learnPerspective")
			.success($scope.renderLearnPerspective);
		};

		//hasn't been tested yet! <TODO>
		$scope.removeLearnObjective = function(id) {
			$http.delete("/learnPerspectiveController" + id)
			.success(function(response) {
				$scope.retrieve();
			});
		};
})

/***********************************************************************************************************************************************
*****************************************************INTERNAL PERSPECTIVE CONTROLLER*************************************************************
************************************************************************************************************************************************/
   .controller('internalPerspectiveController', function ($scope, $http) {
	
	$scope.poorOptions = [{ label: '-Select metric-', value: 0},
						  { label: '>15% budget variance', value: 15 },
    				      { label: '>16% budget variance', value: 16 },
  					      { label: '>17% budget variance', value: 17 },
  					      { label: '>18% budget variance', value: 18 }
  					     ];

  	$scope.unsatOptions = [{ label: '-Select metric-', value: 0},
				           { label: '>19% budget variance', value: 19 },
    			           { label: '>20% budget variance', value: 20 },
  				           { label: '>21% budget variance', value: 21 },
  				           { label: '>22% budget variance', value: 22 }
  				          ];

  	$scope.targetOptions = [{ label: '-Select metric-', value: 0},
						    { label: '9% budget variance', value: 9 },
    				        { label: '10% budget variance', value: 10 },
  					        { label: '11% budget variance', value: 11 }
  					       ];

  	$scope.exceedOptions = [{ label: '-Select metric-', value: 0},
					        { label: '<5% budget variance', value: 5 },
    				        { label: '<6% budget variance', value: 6 },
  					        { label: '<7% budget variance', value: 7 }
  					       ];

  	$scope.outstandOptions = [{ label: '-Select metric-', value: 0},
						      { label: '0% budget variance', value: 00 },
    				          { label: '1% budget variance', value: 16 }
  					         ];
  	$scope.perspective = "internal",
  	$scope.status = "unapproved";

		$scope.submitInternalObjective = function() {

			$scope.createObjectiveErrorMsgs = [],
			$scope.hasCreateObjErrors = false;
			var objDescriptionError = "This field cannot be left blank!",
				objDSOError = "Please define the Key Performance Indicator!",
				poorOptionsSelectError = "Select a minimum metric above!",
				unsatOptionsSelectError = "Select an unsatisfactory metric above!",
				targetOptionsSelectError = "Verfiy the 'Target Met' metric above!",
				exceedOptionsSelectError = "Select an exceed metric above!",
				outstandOptionsSelectError = "Select an outstanding metric above!",
				poorOptionsDefError = "Define the poor metric above!",
				unsatOptionsDefError = "Define the unsatisfactory metric above!",
				targetOptionsDefError = "Define the 'Target Met' metric above!",
				exceedOptionsDefError = "Define the exceed metric above!",
				outstandOptionsDefError = "Define the outstanding metric above!";

			if ($scope.internalPerspectiveController.description == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDescriptionError);
			}
			else if ($scope.internalPerspectiveController.DSO == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(objDSOError);
			}
			else if ($scope.poorOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsSelectError);
			}
			else if ($scope.unsatOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsSelectError);
			}
			else if ($scope.targetOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsSelectError);
			}
			else if ($scope.exceedOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsSelectError);
			}
			else if ($scope.outstandOptions.value == 0) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsSelectError);
			}
			else if ($scope.internalPerspectiveController.metricOneDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(poorOptionsDefError);
			}
			else if ($scope.internalPerspectiveController.metricTwoDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(unsatOptionsDefError);
			}
			else if ($scope.internalPerspectiveController.metricThreeDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(targetOptionsDefError);
			}
			else if ($scope.internalPerspectiveController.metricFourDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(exceedOptionsDefError);
			}
			else if ($scope.internalPerspectiveController.metricFiveDef == null) {

				$scope.hasCreateObjErrors = true,
				$scope.createObjectiveErrorMsgs.push(outstandOptionsDefError);
			}
			else {
				console.log($scope.internalPerspectiveController);
		    	$http.post("/internalPerspectiveController", $scope.internalPerspectiveController)
		    	.success(function (resp){
		    		//console.log(resp);
		    		$('#successObjAlert3').slideDown();
		    	});
		    }
	    };	

		$scope.renderInternalPerspective = function(response) {
			$scope.internalPerspective = response;
		};

		$scope.retrieve = function() {
			$http.get("/internalPerspective")
			.success($scope.renderInternalPerspective);
		};

		//hasn't been tested yet! <TODO>
		$scope.removeInternalObjective = function(id) {
			$http.delete("/internalPerspectiveController" + id)
			.success(function (response) {
				$scope.retrieve();
			});
		};
})

/***********************************************************************************************************************************************
*****************************************************SUBMIT OBJECTIVE CONTROLLER*************************************************************
************************************************************************************************************************************************/
   .controller('submitObjController', ['allObjectives', '$scope','$rootScope', '$http', function (allObjectives,$scope, $rootScope, $http) {

	$scope.objIDArray = [];

	$scope.retrieveObjectives = function () {
			allObjectives.getObjectives()
			.success(function (res) {
				$scope.allObjectives = res;
				console.log(res);
			})
			.error(function () {
				console.log('There is an error');
			});		
	}

	$scope.captureObj = function(objID) {
		//console.log(obj);
		$scope.objIDArray.push(objID);
	
		console.log("Content of array");
		console.log(objID);
		var index;

		for (index = 0; index < $scope.objIDArray.length; index++){
			console.log($scope.objIDArray[index]);
		}

	}
	
	var IDs = $scope.objIDArray;

	$scope.sendObjs = function() {
		console.log($scope.objIDArray);

		for (index = 0; index < $scope.objIDArray.length; index++){
			$http.post("/objectivesSubmitted_status_changed/" + $scope.objIDArray[index] , $scope.submitObjController)
				.success(function (res) {
					$('#successObjSubmit').slideDown();
				})
				.error(function (res) {
					console.log(res);
				});
		}

	}
}])

/***********************************************************************************************************************************************
********************************************************COMPILE OBJECTIVE CONTROLLER*************************************************************
************************************************************************************************************************************************/
   .controller('compileController', ['approvedObjectives', '$scope','$rootScope', '$http', function (approvedObjectives, $scope, $rootScope, $http) {

	$scope.compile = "Compiling";
	console.log($scope.compile);

	$scope.retrieveApproved = function () {
		approvedObjectives.getApproved()
		.success(function (res) {
			$scope.appObjectives = res;
			console.log(res);
		})
		.error(function () {
			console.log('There is an error');
		});		
	}

	/*$scope.captureObj = function(objID) {
		//console.log(obj);
		$scope.objIDArray.push(objID);
	
		console.log("Content of array");
		console.log(objID);
		var index;

		for (index = 0; index < $scope.objIDArray.length; index++){
			console.log($scope.objIDArray[index]);
		}

	}
	
	var IDs = $scope.objIDArray;

	$scope.sendObjs = function() {
		console.log($scope.objIDArray);

		for (index = 0; index < $scope.objIDArray.length; index++){
			$http.post("/objectivesSubmitted_status_changed/" + $scope.objIDArray[index] , $scope.submitObjController)
				.success(function (res) {
					$('#successObjSubmit').slideDown();
				})
				.error(function (res) {
					console.log(res);
				});
		}

	}*/
}])


/***********************************************************************************************************************************************
*****************************************************EMPLOYEE PANEL CONTROLLER******************************************************************
************************************************************************************************************************************************/

   .controller('empPanelInfoCtrl', ['allObjectives', 'pendingObjectives', 'approvedObjectives', '$scope', function (allObjectives, pendingObjectives, approvedObjectives, $scope) {

	allObjectives.getObjectives()
	.success(function (res) {
		$scope.unapprovedVal = res.length;
		//console.log("Response is:");
		//console.log(res);
	});

	pendingObjectives.getPending()
	.success(function (res) {       
		$scope.pendingVal = res.length;
	});

	approvedObjectives.getApproved()
	.success(function (res) {       
		$scope.approvedVal = res.length;
	});

}]) 


/***********************************************************************************************************************************************
*****************************************************SUPERVISORVISOR PANEL CONTROLLER*************************************************************
************************************************************************************************************************************************/
   .controller('supRoleController', ['pendingObjectives', 'approvedObjectives', '$scope', '$http', function (pendingObjectives, approvedObjectives, $scope, $http) {
   		//Initial variables used in "Edit Objective" button for Finance Objective
   		$scope.financeEditLabel = true;
   		$scope.financeUnedittable = true;
   		$scope.financeEditLabelText = "Edit Objective";
		//Initial variables used in "Edit Objective" button for Customer Objective
		$scope.customerEditLabel = true;
   		$scope.customerUnedittable = true;
   		$scope.customerEditLabelText = "Edit Objective";
   		//Initial variables used in "Edit Objective" button for internal Objective
		$scope.internalEditLabel = true;
   		$scope.internalUnedittable = true;
   		$scope.internalEditLabelText = "Edit Objective";
		//Initial variables used in "Edit Objective" button for Learn Objective
		$scope.learnEditLabel = true;
   		$scope.learnUnedittable = true;
   		$scope.learnEditLabelText = "Edit Objective";
   		//Edit Finance Objective Button logic for toggling between states of "Edit" && "Lock"
   		$scope.editFinanceObjective = function() {
   			$scope.financeUnedittable = !$scope.financeUnedittable;
   			$scope.financeEditLabel = !$scope.financeEditLabel;

			 if ($scope.financeEditLabel === false) {
	   			$scope.financeEditLabelText = "Lock Objective";
	   		}
	   		else if ($scope.financeEditLabel === true) {
	   			$scope.financeEditLabelText = "Edit Objective";
	   		}

   			console.log($scope.financeEditLabelText);
   		}
   		//Edit Customer Objective Button logic for toggling between states of "Edit" && "Lock"
   		$scope.editCustomerObjective = function() {
   			$scope.customerUnedittable = !$scope.customerUnedittable;
   			$scope.customerEditLabel = !$scope.customerEditLabel;

			 if ($scope.customerEditLabel === false) {
	   			$scope.customerEditLabelText = "Lock Objective";
	   		}
	   		else if ($scope.customerEditLabel === true) {
	   			$scope.customerEditLabelText = "Edit Objective";
	   		}

   			console.log($scope.customerEditLabelText);
   		}
   		//Edit Internal Objective Button logic for toggling between states of "Edit" && "Lock"
   		$scope.editInternalObjective = function() {
   			$scope.internalUnedittable = !$scope.internalUnedittable;
   			$scope.internalEditLabel = !$scope.internalEditLabel;

			 if ($scope.internalEditLabel === false) {
	   			$scope.internalEditLabelText = "Lock Objective";
	   		}
	   		else if ($scope.internalEditLabel === true) {
	   			$scope.internalEditLabelText = "Edit Objective";
	   		}

   			console.log($scope.internalEditLabelText);
   		}
   		//Edit Learn Objective Button logic for toggling between states of "Edit" && "Lock"
   		$scope.editLearnObjective = function() {
   			$scope.learnUnedittable = !$scope.learnUnedittable;
   			$scope.learnEditLabel = !$scope.learnEditLabel;

			 if ($scope.learnEditLabel === false) {
	   			$scope.learnEditLabelText = "Lock Objective";
	   		}
	   		else if ($scope.learnEditLabel === true) {
	   			$scope.learnEditLabelText = "Edit Objective";
	   		}

   			console.log($scope.learnEditLabelText);
   		}

   		pendingObjectives.getPending()
   		.success(function (res) {
   			$scope.empKPAVal = res.length;
   		});

   		approvedObjectives.getApproved()
   		.success(function (res) {
   			$scope.empApprovedVal = res.length;
   		});

   		//toggle display of Employee information with KPAs
   		$scope.empKPAs = false;
   			$scope.toggleEmpKPA = function() {
   				$scope.empKPAs = !$scope.empKPAs;
   		}

   		$scope.getEmps = function() {
   			//getSecEmployees.success(function (res) {
   				console.log(res);
   			//});vvv
   		}

   		$scope.retrieveEmployees = function () {
   			$http.post('/getEmpsPendingObjs').success( function (response) {
   				//console.log(response);
   				$scope.emps = response;
   			})
		}

		$scope.approveFinanceObjective = function (id, PFNum, finDescription, finDSO, finOneDef, finTwoDef, finThreeDef, finFourDef, finFiveDef) {
			$scope.approveFinObj = {PF: PFNum, description: finDescription, DSO: finDSO, oneDef: finOneDef, twoDef: finTwoDef, threeDef: finThreeDef, fourDef: finFourDef, fiveDef: finFiveDef, perspective: "finance"}
			$http.post('/approveFinanceObjective/' + id, $scope.approveFinObj)
			.success(function () {
				$('#successObjAlert12').show(500);
			})
			.error(function (err) {
				console.log(err);
			})
		}

		$scope.approveCustomerObjective = function (id, PFNum, custDescription, custDSO, custOneDef, custTwoDef, custThreeDef, custFourDef, custFiveDef) {
			$scope.approveCustObj = {PF: PFNum, description: custDescription, DSO: custDSO, oneDef: custOneDef, twoDef: custTwoDef, threeDef: custThreeDef, fourDef: custFourDef, fiveDef: custFiveDef, perspective: "customer"}
			$http.post('/approveCustomerObjective/' + id, $scope.approveCustObj)
			.success(function () {
				$('#successObjAlert22').show(500);
			})
			.error(function (err) {
				console.log(err);
			})
		}

		$scope.approveInternalObjective = function (id, PFNum, intDescription, intDSO, intOneDef, intTwoDef, intThreeDef, intFourDef, intFiveDef) {
			$scope.approveIntObj = {PF: PFNum, description: intDescription, DSO: intDSO, oneDef: intOneDef, twoDef: intTwoDef, threeDef: intThreeDef, fourDef: intFourDef, fiveDef: intFiveDef, perspective: "internal"}
			$http.post('/approveInternalObjective/' + id, $scope.approveIntObj)
			.success(function () {
				$('#successObjAlert32').show(500);
			})
			.error(function (err) {
				console.log(err);
			})
		}

		$scope.approveLearnObjective = function (id, PFNum, learnDescription, learnDSO, learnOneDef, learnTwoDef, learnThreeDef, learnFourDef, learnFiveDef) {
			$scope.approveLearnObj = {PF: PFNum, description: learnDescription, DSO: learnDSO, oneDef: learnOneDef, twoDef: learnTwoDef, threeDef: learnThreeDef, fourDef: learnFourDef, fiveDef: learnFiveDef, perspective: "learn"}
			$http.post('/approveLearnObjective/' + id, $scope.approveLearnObj)
			.success(function () {
				$('#successObjAlert42').show(500);
			})
			.error(function (err) {
				console.log(err);
			})
		}
   }])

   .controller('supEmpObjsCtrl', ['pendingObjectives', '$scope', function (pendingObjectives, $scope) {

   		$scope.retrieveEmpObjs = function (empPF) {
			//console.log(empPF);
			pendingObjectives.getPending()
			.success(function (res) {
				console.log(empPF);
				console.log(res);
				console.log("Pending objectives are as follows:")
				$scope.empObjArray = res;
				for (var i = 0; i < $scope.empObjArray.length; i++){
					if (empPF = $scope.empObjArray[i].PFNum) {
						if ($scope.empObjArray[i].perspective = "finance"){
							$scope.specificEmpFinObjs = $scope.empObjArray[i];
							console.log("So now :");
							console.log($scope.specificEmpFinObjs.PFNum);
						}
						else if ($scope.empObjArray[i].perspective = "customer"){
							$scope.specificEmpFinObjs = $scope.empObjArray[i];
							console.log("So now :");
							console.log($scope.specificEmpEmpObjs.description);
						}
						else if ($scope.empObjArray[i].perspective = "internal"){
							$scope.specificEmpFinObjs = $scope.empObjArray[i];
							console.log("So now :");
							console.log($scope.specificEmpIntObjs.description);
						}
						else if ($scope.empObjArray[i].perspective = "learning"){
							$scope.specificEmpFinObjs = $scope.empObjArray[i];
							console.log("So now :");
							console.log($scope.specificEmpLearnObjs.description);
						}
						else {
							console.log("No other Objectives found!");
						}
					}
				}
			})
			.error(function () {
				console.log("Buzzer sound!!!");
			});
		}
   }]);