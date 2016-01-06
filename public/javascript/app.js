var app = angular.module('RealtimeForum', ['ngRoute', 'ngCookies']);

app.controller('IndexCtrl', ['$scope', function ($scope) {
    $scope.test = 'Hello, World'
}]);

app.factory('$common', ['$cookies', function($cookies) {
    return {
        loggedIn: function() {
            return !!($cookies.get('user-id') && $cookies.get('token'));
        }
    }
}]);

app.controller('HeaderCtrl', ['$scope', '$common', function($scope, $common) {
    $scope.loggedIn = $common.loggedIn();
    $scope.logIn = function() {
        alert('Log In');
    };
}]);

app.directive('appHeader', function () {
    return {
        restrict: 'E',
        templateUrl: '/javascript/templates/app-header.html',
        controller: 'HeaderCtrl'
    }
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/javascript/templates/index.html',
        controller: 'IndexCtrl'
    });
    $routeProvider.when('/not-found', {
        templateUrl: '/javascript/templates/404.html'
    });
    $routeProvider.otherwise('/not-found')
}]);