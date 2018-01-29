angular.module('app').controller('DashboardCtrl', function ($scope, langs, logger, request, validate, playersService) {
	$scope.groups = [];
	$scope.group = {};
	$scope.user = {'name': ''};
	$scope.selectedGroup = {};
	$scope.activeInvite = false;
	$scope.inviteUser = {};
	$scope.users = [];

	$scope.init = function() {
		request.send('group/getAllUsersGroups', {}, function(data) {
	        $scope.groups = data.groups;
      	}, 'get');
	};

	$scope.createGroup = function() {
		request.send('group/create', $scope.group, function(data) {
	        if (data) {
	        	$scope.groups.unshift(data.group);
	        	$scope.group.name = '';
	        }
      	});
	};

	$scope.editGroup = function(group) {
		group.edit = true;
	};

	$scope.updateGroup = function(group) {
		request.send('group/update/' + group.id, {'name': group.name}, function(data) {
	        if (data) {
	        	group.edit = false;
	        }
      	}, 'put');
	};

	$scope.removeGroup = function(id) {
		if (confirm(langs.get('Do you realy want to remove this group?'))) {
			request.send('group/delete/' + id, {}, function(data) {
				$scope.init();
				$scope.selectedGroup = {};
	      	}, 'delete');
		}
	};

	$scope.cancelGroup = function(group) {
		group.edit = false;
	};

	$scope.setGroup = function(id) {
		$scope.selectedGroup.id = id;

		request.send('group/getGroupUsers/' + id, {}, function(data) {
	        if (data) {
	        	$scope.users = data.users;
	        }
      	}, 'get');
	};

	$scope.openInvite = function() {
		$scope.activeInvite = true;
	};

	$scope.chooseUser = function(user) {
		playersService.getPlayer(user.id) ? playersService.removePlayer(user.id) : playersService.addPlayer(user);
	};

	$scope.isChoosed = function(id) {
		return playersService.getPlayer(id);
	}

	$scope.invite = function() {
		var error =1;
		error *= validate.check($scope.form.email, 'Email');
		error *= validate.check($scope.form.name, 'Name');

		if (error) {
			request.send('group/' + $scope.selectedGroup.id + '/addUserToGroup', {'email': $scope.inviteUser.email, 'name': $scope.inviteUser.name}, function(data) {
				if (data.user) {
					$scope.setGroup($scope.selectedGroup.id);
				}
	      	}, 'post');
		}
	};

	$scope.removeUser = function(id) {
		if (confirm(langs.get('Do you realy want to remove this user from group?'))) {
			request.send('group/' + $scope.selectedGroup.id + '/removeUser/' + id, {}, function(data) {
				if (data) {
					$scope.setGroup($scope.selectedGroup.id);
				}
	      	}, 'delete');
		}
	};
});