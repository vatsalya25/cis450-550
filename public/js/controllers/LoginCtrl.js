angular.module('LoginCtrl', []).controller('LoginController', function($scope, $http, $location) {

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
						localStorage.setItem('name', fname);
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

});
