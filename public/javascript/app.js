var app = angular.module('RealtimeForum', ['ngRoute', 'ngCookies']);

app.controller('IndexCtrl', ['$scope', function ($scope) {
    $scope.test = 'Hello, World'
}]);

app.factory('$common', ['$cookies', function($cookies) {
    return {
        loggedIn: function() {
            return !!($cookies.get('user-id') && $cookies.get('token'));
        },
        logOut: function() {
            $cookies.remove('user-id');
            $cookies.remove('token');
        }
    }
}]);

app.controller('HeaderCtrl', ['$scope', '$common', '$http', '$window', function($scope, $common, $http, $window) {
    $scope.loggedIn = $common.loggedIn;
    $scope.logIn = function() {
        $http({
            method: 'GET',
            url: '/vk-url'
        }).then(function success(response) {
            console.log(response.data.url);
            $window.location.href = response.data.url;
        }, function error(response) {
            alert('Unknown error.')
        });
    };
    $scope.logOut = $common.logOut;
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