angular.module('LoginCtrl', []).controller('LoginController', function($scope, $http, $location, $window, $rootScope, Login) {

  $scope.verifyLogin = function() {
    const lNode = $('.loginBtn');
    const email = $('#loginEmail').val();
    const pwd = $('#loginPassword').val();

    if (email === '' || pwd === '') {
      $('.warning').text("Username and password fields cannot be left empty");
      $('.warning').removeClass('hidden');
      setTimeout(() => $('.warning').addClass('hidden'), 3000);
    } else {
			$http({
				method: 'POST',
				url: '/api/login',
				data: {
					email: email,
					password: pwd
				}
			}).then(status => {
				console.log(status);
        if (status.data.status === "ok") {
					$window.localStorage.setItem('name', status.data.fname);
					$window.localStorage.setItem('userId', status.data.user_id);
					$window.localStorage.setItem('loggedIn', true);
					Login.modifyLoggedStatus(false);
					$rootScope.$broadcast('loggedIn');
					$location.path('/');
        } else if (status.data.status === "error") {
          $('.warning').text("Username or password is incorrect");
          $('.warning').removeClass('hidden');
          setTimeout(() => $('.warning').addClass('hidden'), 3000);
        }
      }).catch(error => console.log(error));
    }
  }

  $scope.registerUser = function() {
    const rNode = $('.registerBtn');
		const name = $('#registerName').val();
		const fname = name.split(' ')[0];
		const lname = name.split(' ')[1];
    const uname = $('#registerEmail').val();
    const pwd = $('#registerPassword').val();
    const cpwd = $('#registerConfirmPassword').val();
    if (pwd !== cpwd) {
      $('.warning').text("Passwords do not match");
      $('.warning').removeClass('hidden');
      setTimeout(() => $('.warning').addClass('hidden'), 3000);
    } else {
			if (uname === '' || pwd === '' || name === '') {
	      $('.warning').text("One or more fields are empty");
	      $('.warning').removeClass('hidden');
	      setTimeout(() => $('.warning').addClass('hidden'), 3000);
	    } else {
				$http({
					method: 'POST',
					url: '/api/register',
					data: {
						fname: fname,
						lname: lname,
						email: uname,
						password: pwd
					}
				}).then(status => {
					console.log(status);
					if (status.data.status === "ok") {
						$window.localStorage.setItem('name', status.data.fname);
						$window.localStorage.setItem('userId', status.data.user_id);
						$window.localStorage.setItem('loggedIn', true);
						Login.modifyLoggedStatus(false);
						$rootScope.$broadcast('loggedIn');
						$location.path('/');
					} else if (status.data.status === "duplicate") {
						$('.warning').text("Username already exists");
						$('.warning').removeClass('hidden');
						setTimeout(() => $('.warning').addClass('hidden'), 3000);
					}
				}).catch(error => console.log(error));
			}
    }
  }

	// Google login
	$scope.googleSignIn = function(name, email, password) {
		console.log(name, email, password);
		const fname = name.split(' ')[0];
		const lname = name.split(' ')[1];
		$http({
			method: 'POST',
			url: '/api/googleLogin',
			data: {
				fname: fname,
				lname: lname,
				email: email,
				password: password
			}
		}).then(status => {
			console.log(status);
			if (status.data.status === "ok") {
				$window.localStorage.setItem('name', status.data.fname);
				$window.localStorage.setItem('userId', status.data.user_id);
				$window.localStorage.setItem('loggedIn', true);
				$window.localStorage.setItem('googleId', true);
				Login.modifyLoggedStatus(false);
				$rootScope.$broadcast('loggedIn');
				$location.path('/');
			} else if (status.data.status === "duplicate") {
				$('.warning').text("Username already exists");
				$('.warning').removeClass('hidden');
				setTimeout(() => $('.warning').addClass('hidden'), 3000);
			}
		}).catch(error => console.log(error));
	}

});
