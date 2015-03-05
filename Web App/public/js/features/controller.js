 //using $scope to bind data models from the UI to the angular script (interchangeably)
var app = angular.module('BSCIMS', []);

/*********************************************************
		Finance Perspective Angular Controller
**********************************************************/
app.controller('financePerspectiveController', function($scope, $http) {
		
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
			console.log($scope.financePerspectiveController);
	    	$http.post("/financePerspectiveController", $scope.financePerspectiveController)
	    	.success(function(resp){
	    		console.log(resp);
	    	});
	    };	

		$scope.renderFinancePerspective = function(response) {
			$scope.financePerspective = response;
		};

		$scope.retrieve = function() {
			$http.get("/financePerspective")
			.success($scope.renderFinancePerspective);
		};

		$scope.removeFinanceObjective = function(id) {
			$http.delete("/financePerspectiveController" + id)
			.success(function(response) {
				$scope.retrieve();
			});
		};
});



/*********************************************************
		Customer Perspective Angular Controller
**********************************************************/
app.controller('customerPerspectiveController', function($scope, $http) {
		
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
	    		console.log(resp);
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
app.controller('learnPerspectiveController', function($scope, $http) {

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
	    		console.log(resp);
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
app.controller('internalPerspectiveController', function($scope, $http) {
	
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
	    		console.log(resp);
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