var app = angular.module('RealtimeForum', ['ngRoute', 'ngCookies']);

app.controller('IndexCtrl', ['$scope', '$common', '$http', function ($scope, $common, $http) {
    $scope.loggedIn = $common.loggedIn;
    $scope.fetchTopics = function () {
        $http({
            method: 'GET',
            url: '/topics'
        }).then(function success(response) {
            console.log(response.data);
            $scope.topics = response.data;
        }, function failure(response) {
            alert('Error while fetching topics.');
        });
    };
    $scope.fetchTopics();
}]);

app.factory('$common', ['$cookies', '$window', function ($cookies, $window) {
    return {
        loggedIn: function () {
            return !!($cookies.get('user-id') && $cookies.get('token'));
        },
        logOut: function () {
            $cookies.remove('user-id');
            $cookies.remove('token');
        },
        redirectIfNotLoggedIn: function () {
            if (!this.loggedIn()) {
                $window.location.href = '/';
            }
        }
    }
}]);

app.controller('HeaderCtrl', ['$scope', '$common', '$http', '$window', function ($scope, $common, $http, $window) {
    $scope.loggedIn = $common.loggedIn;
    $scope.logIn = function () {
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

app.controller('NewTopicCtrl', ['$scope', '$common', '$http', function ($scope, $common, $http) {
    $common.redirectIfNotLoggedIn();
    $scope.createTopic = function () {
        console.log('Create topic');
        $http({
            method: 'POST',
            url: '/topics',
            headers: {
                'content-type': 'application/json'
            },
            data: {
                topic: {
                    theme: $scope.topic.theme,
                    content: $scope.topic.content
                }
            }
        }).then(function success(response) {
            alert('Success');
        }, function failure(response) {
            alert('Failure')
        });
    };
}]);

app.controller('ProfileCtrl', ['$scope', '$common', '$window', '$http', function ($scope, $common, $window, $http) {
    $common.redirectIfNotLoggedIn();
    var fetchUser = function () {
        $http({
            method: 'GET',
            url: '/current-user',
            withCredentials: true
        }).then(function success(response) {
            $scope.user = response.data;
        }, function failure(response) {
            alert('Error fetching user.');
        });
    };
    $scope.changeNickname = function () {
        $http({
            method: 'PUT',
            url: '/update-user',
            headers: {
                'content-type': 'application/json'
            },
            data: {
                nickname: $scope.user.nickname
            },
            withCredentials: true
        }).then(function success(response) {
            alert('Nickname updated.');
        }, function failure(response) {
            alert('Error updating nickname.');
        });
    };
    fetchUser();
}]);

app.controller('TopicDetailCtrl', ['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {
    $scope.fetchOpinions = function () {
        $http({
            method: 'GET',
            url: '/topics/' + $routeParams.id + '/opinions'
        }).then(function success(response) {
            console.log(response.data);
            $scope.topic = response.data;
        }, function error(response) {
            alert('Error while fetching topics.');
        });
    };
    $scope.fetchOpinions();
    $scope.newOpinion = {};
    $scope.createOpinion = function () {
        $http({
            method: 'POST',
            url: '/opinions',
            withCredentials: true,
            data: {
                opinion: {
                    topic_id: $routeParams.id,
                    content: $scope.newOpinion.content
                }

            },
            headers: {
                'content-type': 'application/json'
            }
        }).then(function success(res) {
            $scope.fetchOpinions();
            $scope.createOpinionForm.$setPristine();
        }, function failure(res) {
            alert('Error while posting opinion.');
        });
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
    $routeProvider.when('/topics/:id', {
        templateUrl: '/javascript/templates/topic-detail.html',
        controller: 'TopicDetailCtrl'
    });
    $routeProvider.when('/not-found', {
        templateUrl: '/javascript/templates/404.html'
    });
    $routeProvider.when('/profile', {
        templateUrl: '/javascript/templates/profile.html',
        controller: 'ProfileCtrl'
    });
    $routeProvider.when('/new-topic', {
        templateUrl: '/javascript/templates/new-topic.html',
        controller: 'NewTopicCtrl'
    });
    $routeProvider.otherwise('/not-found');
}]);