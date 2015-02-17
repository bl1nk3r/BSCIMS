 //using $scope to bind data models from the UI to the angular script (interchangeably)
var app = angular.module('BSCIMS', []);

/*********************************************************
		Finance Perspective Angular Controller
**********************************************************/
app.controller('financePerspectiveController', function($scope, $http) {
		
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

		$scope.removeInternalObjective = function(id) {
			$http.delete("/internalPerspectiveController" + id)
			.success(function(response) {
				$scope.retrieve();
			});
		};
});