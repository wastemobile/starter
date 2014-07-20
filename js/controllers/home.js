define(['app'], function(app) {
	app.register.controller('HomeController', function($scope){
		$scope.message = "來自 HomeController 的訊息";
	});
});

