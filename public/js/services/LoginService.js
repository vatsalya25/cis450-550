angular.module('LoginService', []).factory('Login', ['$http', function($http) {

	var _userLoggedIn = false;
	var Login = {};

	Login.modifyLoggedStatus = function(val) {
		_userLoggedIn = val;
	}

	Login.getLoggedStatus = function() {
		return _userLoggedIn;
	}

	return Login;
}]);
