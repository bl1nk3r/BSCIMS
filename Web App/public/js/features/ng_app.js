angular.module('BSCIMS',['ngRoute'])
	.config(function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/objectives', {
				controller: 'createObjectives',
				templateUrl: 'views/objectives.html'
			});
	});