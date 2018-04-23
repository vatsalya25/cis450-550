angular.module('HeaderCtrl', []).controller('HeaderController', function($scope, $http, $location, $window, $timeout, Login) {

  $scope.newUser = true;

  // Close the Authentication popup
  $scope.toggleLogin = function() {
    angular.element('.account-options').addClass('hidden');
    $location.path('/login');
  }

  // show or hide account options
  $scope.toggleAccountOptions = function() {
    if ($scope.newUser) {
      angular.element('#newUserOptions').toggleClass('hidden');
    } else {
      angular.element('#registeredUserOptions').toggleClass('hidden');
    }
  }

  // go to my recommendations
  $scope.myRecommend = function() {
    angular.element('.account-options').addClass('hidden');
    $location.path('/recommend');
  }

  // Logout
  $scope.logout = function() {
    $timeout(function() {
      localStorage.clear();
      $scope.newUser = true;
      angular.element('.account-options').addClass('hidden');
      $('#userName').text("Account");
      console.log('User signed out.');
      $location.path('/');
    }, 300);
  }

  $scope.$on('loggedIn', function(event, args) {
    $scope.newUser = Login.getLoggedStatus();
    $('#userName').text("Hi, " + $window.localStorage.getItem("name"));
    // if ($scope.newUser) {
    //   angular.element('#registeredUserOptions').addClass('hidden');
    //   angular.element('#newUserOptions').removeClass('hidden');
    // } else {
    //   angular.element('#registeredUserOptions').removeClass('hidden');
    //   angular.element('#newUserOptions').addClass('hidden');
    // }
  })

  $timeout(function() {
    if ($window.localStorage.getItem("loggedIn") == "true") {
      $scope.newUser = false;
      $('#userName').text("Hi, " + $window.localStorage.getItem("name"));
    }
  }, 300);
});
