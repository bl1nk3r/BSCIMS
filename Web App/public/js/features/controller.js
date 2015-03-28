 //using $scope to bind data models from the UI to the angular script (interchangeably)
var bsc = angular.module('BSCIMS', []);

/**************************************************************************************
		Global Services
**************************************************************************************/
 bsc.service('allObjectives', ['$http', '$q',function($http, $q){
		this.objectives = null;

		this.getObjectives = function () {
			return $http.get('/getAllObjectives');
		}
	}])

 	/*.controller('allObjectivesCtrl', ['allObjectives', '$scope', function(allObjectives, $scope){
 		$scope.allObjectives = allObjectives;
 	}])*/


/*************************************************************************************
						Manage Employees
**************************************************************************************/
	.service('manageEmployeeData', ['$http', '$q', function($http, $q) {
		this.insertEmp = function(emp) {
			return $http.post('/addEmp', emp);
		}

		this.authenticate = function(loginEmp) {
			return $http.post('empAuthenticate', loginEmp);
		}

		this.getEmps = function() {
			var deferred = $q.defer();
			$http.post('/showAllEmps').success(function(res) {
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
	.controller('manageEmployees', ['$q', '$scope', '$rootScope', '$http', 'manageEmployeeData', function($q, $scope, $rootScope, $http, manageEmployeeData) {

		$scope.loginStatus = true,
		$scope.hasUserInfo = false,
		$scope.loginState = "Not logged in!",
		//Below are the login access roles : Supervisor, Employee and HR officer
		$scope.supervisorRole = false,
		$scope.isSupervisor = false,
		$scope.employeeRole = false,
		$scope.isEmployee = false,
		$scope.HRRole = false,
		$scope.isHR = false,
		$scope.loginError = "Enter Your ID!",
		$scope.hasLoginError = false;

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

				}).error(function(error){}); 
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

	}])


/*************************************************************************************
		Finance Perspective Angular Controller
*************************************************************************************/
   .controller('financePerspectiveController', function($scope, $http) {
		
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

		$scope.submitFinanceObjective = function() {
	    	$http.post("/financePerspectiveController", $scope.financePerspectiveController)
	    	.success(function(resp){
	    		//console.log(resp);
	    		$scope.Objective = resp;
	    		console.log($scope.Objective);
	    		$('#successObjAlert1').slideDown();
	    	});
	    };	

		$scope.renderFinancePerspective = function(response) {
			$scope.financePerspective = response;
		};

		$scope.retrieveFinanceObjectives = function() {
			$http.get("/retrieveFinanceObjectives")
			.success(function(res, err) {
				if (err) {console.log(err);}
				console.log(res);
			});
			//.success($scope.renderFinancePerspective);
		};


		$scope.removeFinanceObjective = function(id) {
			$http.delete("/financePerspectiveController" + id)
			.success(function(response) {
				$scope.retrieve();
			});
		};
});



/*******************************************************************************
		Customer Perspective Angular Controller
*******************************************************************************/
bsc.controller('customerPerspectiveController', function($scope, $http) {
		
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


		$scope.submitCustomerObjective = function() {
			console.log($scope.customerPerspectiveController);
	    	$http.post("/customerPerspectiveController", $scope.customerPerspectiveController)
	    	.success(function(resp){
	    		//console.log(resp);
	    		$('#successObjAlert2').slideDown();
	    	});
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
			.success(function(response) {
				$scope.retrieve();
			});
		};
});

/*********************************************************
	Learning & Growth Perspective Angular Controller
**********************************************************/
bsc.controller('learnPerspectiveController', function($scope, $http) {

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


		$scope.submitLearnObjective = function() {
			console.log($scope.learnPerspectiveController);
	    	$http.post("/learnPerspectiveController", $scope.learnPerspectiveController)
	    	.success(function(resp){
	    		//console.log(resp);
	    		$('#successObjAlert4').slideDown();

	    	});
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
});

/*********************************************************
	Internal Business Perspective Angular Controller
**********************************************************/
bsc.controller('internalPerspectiveController', function($scope, $http) {
	
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

		$scope.submitInternalObjective = function() {
			console.log($scope.internalPerspectiveController);
	    	$http.post("/internalPerspectiveController", $scope.internalPerspectiveController)
	    	.success(function(resp){
	    		//console.log(resp);
	    		$('#successObjAlert3').slideDown();
	    	});
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
			.success(function(response) {
				$scope.retrieve();
			});
		};
});

bsc.controller('submitObjController', ['allObjectives', '$scope','$rootScope', '$http', function(allObjectives,$scope, $rootScope,$http) {

	$scope.retrieveObjectives = function() {
			allObjectives.getObjectives()
			.success(function(res) {
				$scope.allObjectives = res;
				console.log(res);
			})
			.error(function () {
				console.log('There is an error');
			});		
	}

	//$scope.test = "bristo";

}]);
