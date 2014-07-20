require.config({
	baseUrl: "js",
	paths: {
		'angular': '../lib/angular/angular.min',
		'angular-route': '../lib/angular-route/angular-route.min',
		'angularAMD': '../lib/angularAMD/angularAMD.min'
	},
	shim: {
		'angularAMD': ['angular'],
		'angular-route': ['angular']
	},
	deps: ['app']
});