var app = angular.module('RealtimeForum', ['ngRoute', 'ngCookies']);

app.controller('IndexCtrl', ['$scope', function ($scope) {
    $scope.test = 'Hello, World'
}]);

app.factory('$common', ['$cookies', '$window', function($cookies, $window) {
    return {
        loggedIn: function() {
            return !!($cookies.get('user-id') && $cookies.get('token'));
        },
        logOut: function() {
            $cookies.remove('user-id');
            $cookies.remove('token');
        },
        redirectIfNotLoggedIn: function() {
            if (!this.loggedIn()) {
                $window.location.href = '/';
            }
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

app.controller('ProfileCtrl', ['$scope', '$common', '$window', '$http', function($scope, $common, $window, $http) {
    $common.redirectIfNotLoggedIn();
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
    $routeProvider.when('/profile', {
        templateUrl: '/javascript/templates/profile.html',
        controller: 'ProfileCtrl'
    });
    $routeProvider.otherwise('/not-found');
}]);