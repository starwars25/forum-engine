var app = angular.module('RealtimeForum', ['ngRoute', 'ngCookies']);
app.controller('IndexCtrl', ['$scope', '$common', '$http', function ($scope, $common, $http) {
    $scope.loggedIn = $common.loggedIn;
    $scope.fetchTopics = function (page) {
        $http({
            method: 'GET',
            url: '/topics?page=' + page
        }).then(function success(response) {
            console.log(response.data);
            $scope.topics = response.data.topics;
            $scope.page = response.data.page;
            $scope.pageCount = response.data.pageCount;
        }, function failure(response) {
            alert('Error while fetching topics.');
        });
    };
    $scope.fetchTopics(1);
    $scope.pagination = {
        currentPage: function() {
            return $scope.page;
        },
        previosPage: function() {
            if ($scope.page - 1 > 0) {
                return $scope.page - 1
            } else {
                return null;
            }
        },
        nextPage: function() {
            if ($scope.page + 1 <= $scope.pageCount) {
                return $scope.page + 1
            } else {
                return null;
            }
        },
        beforeLastPage: function() {
            if ($scope.pageCount - 1 > 0)
                return $scope.pageCount - 1;
            else
                return null;
        }
    }
}]);
app.factory('$common', ['$cookies', '$window', function ($cookies, $window) {
    return {
        loggedIn: function () {
            return !!($cookies.get('user-id') && $cookies.get('token'));
        },
        logOut: function () {
            $cookies.remove('user-id');
            $cookies.remove('token');
            $window.location.href = '/';
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
            console.log(response.data);
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
    $scope.updateAvatar = function() {
        $http({
            method: 'PUT',
            url: '/update-user',
            data: {
                avatar_url: $scope.user.new_avatar_url
            },
            withCredentials: true
        }).then(function success(response) {
            $scope.user.avatar_url = $scope.user.new_avatar_url
        }, function failure(response) {

        });
    };
    fetchUser();
}]);
app.controller('TopicDetailCtrl', ['$scope', '$routeParams', '$http', '$cookies', '$common', function ($scope, $routeParams, $http, $cookies, $common) {
    $scope.loggedIn = $common.loggedIn;
    $scope.rating = function(opinion) {
        return opinion.upvotes_count - opinion.devotes_count;
    };
    $scope.upvote = function(opinion) {
        $http({
            method: 'POST',
            url: '/upvotes',
            data: {
                upvote: {
                    OpinionId: opinion.id
                }
            },
            withCredentials: true
        }).then(function success(response) {
            opinion.upvotes_count++;
            if (opinion.devotes_count != 0) opinion.devotes_count--;
            if ($scope.topic.votes.devotes[opinion.id]) {
                $scope.topic.votes.devotes[opinion.id] = null;
            }
            $scope.topic.votes.upvotes[opinion.id] = 1;
            $scope.analyzeUpvotes();
        }, function error(response) {
            alert('Error occurred.');
        });
    };
    $scope.devote = function(opinion) {
        $http({
            method: 'POST',
            url: '/devotes',
            data: {
                devote: {
                    OpinionId: opinion.id
                }
            },
            withCredentials: true
        }).then(function success(response) {
            opinion.devotes_count++;
            if (opinion.devotes_count != 0) opinion.upvotes_count--;
            if ($scope.topic.votes.upvotes[opinion.id]) {
                $scope.topic.votes.upvotes[opinion.id] = null;
            }
            $scope.topic.votes.devotes[opinion.id] = 1;
            $scope.analyzeUpvotes();
        }, function error(response) {
            alert('Error occurred.');
        });
    };
    $scope.wrongUser = function(opinion) {
        return opinion.vk_user_id != $cookies.get('user-id');
    };
    $scope.wrongUserComment = function(comment) {
        return comment.vk_user_id != $cookies.get('user-id');

    };
    $scope.comment = function(opinion) {
        $http({
            method: 'POST',
            url: '/comments',
            data: {
                comment: {
                    OpinionId: opinion.id,
                    content: opinion.comment
                }
            },
            withCredentials: true
        }).then(function success(res) {
            console.log(res.data);
            if (!opinion.comments) opinion.comments = [];
            opinion.comments.push(res.data);
            $scope.commentedOpinionId = null;
        }, function failure(res) {
            alert('error');
        });
    };
    $scope.fetchOpinions = function (page) {
        $http({
            method: 'GET',
            url: '/topics/' + $routeParams.id + '?page=' + page
        }).then(function success(response) {
            console.log(response.data);
            $scope.topic = response.data;
            $scope.analyzeUpvotes();
        }, function error(response) {
            alert('Error occurred while fetching topics.');
        });
    };
    $scope.showEditForm = function(opinion) {
        $scope.editedOpinionId = opinion.id;
        console.log($scope.editedOpinionId);
    };
    $scope.showCommentForm = function(opinion) {
        $scope.commentedOpinionId = opinion.id;
    };
    $scope.hideCommentForm = function() {
        $scope.commentedOpinionId = null
    };
    $scope.showEditCommentForm = function(comment) {
        $scope.editedComment = comment.id;
    };
    $scope.hideEditCommentForm = function() {
        $scope.editedComment = null
    };
    $scope.hideEditForm = function() {
        $scope.editedOpinionId = null;
    };
    $scope.editComment = function(comment) {
        $http({
            method: 'PUT',
            url: '/comments/' + comment.id,
            data: {
                comment: {
                    content: comment.content
                }
            },
            withCredentials: true
        }).then(function success(res) {
            $scope.hideEditCommentForm();
        }, function failure(res) {
            alert('error');
        });
    };
    $scope.deleteComment = function(comment) {
        $http({
            method: 'DELETE',
            url: '/comments/' + comment.id,
            withCredentials: true
        }).then(function success(res) {
            var opinions = $scope.topic.opinions;
            var found = false;
            for(var i = 0; i < opinions.length; i++) {
                var comments = opinions[i].comments;
                if (comments) {
                    for(var j = 0; j < comments.length; j++) {
                        var c = comments[j];
                        if (c == comment) {
                            var index = comments.indexOf(comment);
                            comments.splice(index, 1);
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }
        }, function failure(res) {
            alert('error');
        });
    };
    $scope.updateOpinion = function(opinion) {
        $http({
            method: 'PUT',
            url: '/opinions/' + opinion.id,
            headers: {
                'content-type': 'application/json'
            },
            data: {
                opinion: {
                    content: opinion.content
                }
            },
            withCredentials: true
        }).then(function success(res) {
            $scope.hideEditForm();
        }, function failure(res) {
            console.log('Error occurred while updating opinion.')
        });
    };
    $scope.fetchOpinions(1);
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
            alert('Error occurred while posting opinion.');
        });
    };
    $scope.analyzeUpvotes = function() {
        if (!$common.loggedIn()) return;
        for(var i = 0; i < $scope.topic.opinions.length; i++) {
            var opinion = $scope.topic.opinions[i];
            if ($scope.topic.votes.upvotes[opinion.id]) {
                opinion.vote = 'upvote';
            } else if ($scope.topic.votes.devotes[opinion.id]) {
                opinion.vote = 'devote';
            }
        }
    };

    $scope.pagination = {
        currentPage: function() {
            return $scope.topic.page;
        },
        previosPage: function() {
            if ($scope.topic.page - 1 > 0) {
                return $scope.topic.page - 1
            } else {
                return null;
            }
        },
        nextPage: function() {
            if ($scope.topic.page + 1 <= $scope.topic.pageCount) {
                return $scope.topic.page + 1
            } else {
                return null;
            }
        },
        beforeLastPage: function() {
            if ($scope.topic.pageCount - 1 > 0)
                return $scope.topic.pageCount - 1;
            else
                return null;
        }
    }
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