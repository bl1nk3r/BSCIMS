 //using $scope to bind data models from the UI to the angular script (interchangeably)
var bsc = angular.module('BSCIMS', []);

/**************************************************************************************
		Global Services
**************************************************************************************/

 //this service retrieves and globally stores all objectives (with a default status of "unapproved") to be used by any controller
 bsc.service('allObjectives', ['$http', '$q',function ($http, $q){
		this.objectives = null;

		this.getObjectives = function () {
			return $http.get('/getAllObjectives');
		}
	}])

//while this one does the same only for objectives that have been sent for processing or approval (with a status of  "sent_for_approval")
 	.service('pendingObjectives', ['$http', function ($http) {
 		this.getPending = function() {
 			return $http.get('/getPendingObjectives');
 		}
 	}])

 	/*.controller('allObjectivesCtrl', ['allObjectives', '$scope', function(allObjectives, $scope){
 		$scope.allObjectives = allObjectives;
 	}])*/


/*************************************************************************************
						Manage Employees
**************************************************************************************/
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
			}).error(function(res) {
				deferred.reject(res);
			});

			return deferred.promise;	
		}

		this.getDivs = function() {
			var deferred = $q.defer();
			$http.post('/showAllDivisions').success(function (res) {
				deferred.resolve(res);
			}).error(function(res) {
				deferred.reject(res);
			});

			return deferred.promise;	
		}

		this.getLoggedInEmp = function () {
		return $http.post('/getLoggedInEmp');

		this.lastLogIn = null;
	}

	}])

/*************************************************************************************
						Employee Controller
**************************************************************************************/
	.controller('manageEmployees', ['$q', '$scope', '$rootScope', '$http', 'manageEmployeeData', function ($q, $scope, $rootScope, $http, manageEmployeeData) {

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
				console.log("LoggedIn User : ");
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
					$scope.division = data[0];
					$scope.sections = $scope.division.Department[0].Section;
					$scope.departments = $scope.division.Department;
					$scope.employees = $scope.division.Department[0].Section[0].Employee;
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


/*************************************************************************************
		Finance Perspective Angular Controller
*************************************************************************************/
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



/*******************************************************************************
		Customer Perspective Angular Controller
*******************************************************************************/
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

/*********************************************************
	Learning & Growth Perspective Angular Controller
**********************************************************/
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

/*********************************************************
	Internal Business Perspective Angular Controller
**********************************************************/
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

/*********************************************************************************************************************************************
				Submit Objective Controller
*********************************************************************************************************************************************/
   .controller('submitObjController', ['allObjectives', '$scope','$rootScope', '$http', function (allObjectives,$scope, $rootScope,$http) {

	$scope.objIDArray = [];

	$scope.retrieveObjectives = function () {
			allObjectives.getObjectives()
			.success(function (res) {
				$scope.allObjectives = res;
				//console.log(res);
			})
			.error(function () {
				console.log('There is an error');
			});		
	}

	$scope.captureObj = function(objID) {
		//console.log(obj);
		$scope.objIDArray.push(objID);
	
		console.log("Content of array");
		var index;

		for (index = 0; index < $scope.objIDArray.length; index++){
			console.log($scope.objIDArray[index]);
		}

	}
	
	var IDs = $scope.objIDArray;

	$scope.sendObjs = function() {
		console.log($scope.objIDArray);

		for (index = 0; index < $scope.objIDArray.length; index++){
			$http.post("/objectivesSubmitted_status_changed" + $scope.objIDArray[index] , $scope.submitObjController)
				.success(function (res) {
					$('#successObjSubmit').slideDown();
				})
				.error(function (res) {
					console.log(res);
				});
		}

	}
}])


/*********************************************************************************************************************************************
				Employee Panel Info Controller
*********************************************************************************************************************************************/

   .controller('empPanelInfoCtrl', ['allObjectives', 'pendingObjectives', '$scope', function (allObjectives, pendingObjectives, $scope) {

	allObjectives.getObjectives()
	.success(function (res) {
		$scope.unapprovedVal = res.length;
	});

	pendingObjectives.getPending()
	.success(function (res) {
		$scope.pendingVal = res.length;
	});

}])


/*********************************************************************************************************************************************
				Supervisor Panel Info Controller
*********************************************************************************************************************************************/
   .controller('supPanelInfoCtrl', ['allObjectives', 'pendingObjectives', '$scope', function (allObjectives, pendingObjectives, $scope) {
   		$scope.empKPAVal = 5;
   }]);
