angular.module('app', ['ngCookies','ngAnimate', 'ngRoute','ngSanitize', 'ui.bootstrap']);

angular.module('app').config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});

	angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
		$cookies = _$cookies_;
	}]);

	var token = $cookies.get('token');

	$routeProvider
	.when('/results', {templateUrl: '/results.html'})
	.when('/recovery', {templateUrl: '/recovery.html'})
	.when('/', {templateUrl: token ? '/dashboard.html' : '/main.html'})
	.when('/forgotPassword/:hash', {
		template: '',
		controller: 'ActivateCtrl'
	})
	.when('/activate/:hash', {
		template: '',
		controller: 'ActivateCtrl'
	})
	.otherwise({redirectTo: '/'});
});

angular.module('app').controller('AppCtrl', function ($scope, $cookies, $window, $timeout, validate, langs, request, logger) {
	$scope.langs = langs;
	$scope.selectedLanguage = langs.getLanguage();
	$scope.authUser = {};
	$scope.show = {'LogIn': false};
	$scope.now = new Date();
	$scope.recoveryEmail = '';

	$scope.init = function() {
		if ($scope.isLoggedIn()) {
			request.send('user/getAuthUserInfo', {}, function(data) {
		        if (data) {
		        	$scope.selectedLanguage = data.user.lang;
		        }
	    	}, 'get');
		}
		langs.putLanguage($scope.selectedLanguage);
	};

	$scope.isLoggedIn = function() {
		return $cookies.get('token');
	};

	$scope.toggleSignIn = function() {
		$scope.showLogIn = ! $scope.showLogIn;
	};

	$scope.signIn = function() {
	    var error = 1;
	    error *= validate.check($scope.form.email, 'Email');
	    error *= validate.check($scope.form.password, 'Password');
	    
	    if (error) {
	    	$scope.authUser.lang = langs.getLanguage();
			request.send('user/login', $scope.authUser, function(data) {
		        if (data.token) {
					$cookies.put('token', data.token);
					langs.putLanguage(data.user.lang);
					$timeout(function () {
						$window.location.href = '/';
					}, 1000);
		        }
			});
		}
	};

	$scope.logOut = function() {
		$cookies.remove('token');
		$window.location.href = '/';
	};

	$scope.setLanguage = function() {
		if ($scope.isLoggedIn()) {
			request.send('user/changeLang', {'lang': $scope.selectedLanguage}, function(data) {

			}, 'post');
		}
		langs.putLanguage($scope.selectedLanguage);
	};
});