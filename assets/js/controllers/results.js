angular.module('app').controller('ResultsCtrl', function($scope, langs, logger, resultsService) {
	$scope.results = resultsService.getList();
});

angular.module('app').controller('RecoveryCtrl', function($scope, $location, $timeout, $window, langs, validate, request) {
	$scope.recoveryEmail = '';
	$scope.show.LogIn = false;

	$scope.recovery = function() {
		var error = 1;
		error *= validate.check($scope.form.email, 'Email');
		if (error) {
			var mas = {
				'email': $scope.recoveryEmail,
				'url': $location.absUrl() + 'forgotPassword/{hash}'
			};

			request.send('user/forgotPassword', mas, function(data) {
            	if (data.user) {
               		$timeout(function () {
						$location.path('/');
					}, 1000);
            	}
            });
		}
	};
});