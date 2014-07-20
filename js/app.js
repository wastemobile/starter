define(['angularAMD', 'angular-route'], function(angularAMD){

	var app = angular.module("webapp", ['ngRoute']);

	app.config(function($routeProvider){
		$routeProvider
		.when("/home", angularAMD.route({
			templateUrl: 'partials/home.html',
			controllerUrl: 'controllers/home',
			controller: 'HomeController'
		}))
		.when("/view1", angularAMD.route({
			templateUrl: 'partials/view1.html',
			controller: 'View1Controller',
			controllerUrl: 'controllers/view1'
		}))
		.otherwise({redirectTo: "/home"});
	});

	angularAMD.bootstrap(app);

	return app;
});