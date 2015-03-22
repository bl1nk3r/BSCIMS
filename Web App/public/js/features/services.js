angular.module('BSCIMS')
	.service('allObjectives', ['$http', '$q',function($http, $q){
		this.objectives = null;

		this.getObjectives = function () {
			return $http.get('/getAllObjectives');
		}
	}]);

