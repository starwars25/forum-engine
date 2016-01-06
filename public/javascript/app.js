var app = angular.module('RealtimeForum', ['ngRoute']);

app.controller('IndexCtrl', ['$scope', function($scope) {
    $scope.test = 'Hello, World'
}]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/javascript/templates/index.html',
        controller: 'IndexCtrl'
    });
    $routeProvider.when('/not-found', {
        templateUrl: '/javascript/templates/404.html'
    });
    $routeProvider.otherwise('/not-found')
}]);