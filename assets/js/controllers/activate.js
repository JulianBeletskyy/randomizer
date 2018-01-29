angular.module('app').controller('ActivateCtrl', function ($scope, $cookies, $window, $location, langs, logger, request, $routeParams) {
	if ($routeParams.hash) {
		var post_mas = {
			'hash': $routeParams.hash,
			'lang': $cookies.get('lang')
		};

		var url = $location.path();
		url = url.replace('/' + $routeParams.hash, '');

		request.send('user' + url, post_mas, function(data) {
			if (data.token) {
				$cookies.put('token', data.token);
				langs.putLanguage(data.user.lang);
				logger.logSuccess(langs.get('Your account is active'));
			}
        });
	}
});