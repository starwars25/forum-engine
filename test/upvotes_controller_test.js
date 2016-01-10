process.env.NODE_ENVIRONMENT = 'test';
var should = require('should');
var request = require('../helpers/request_helper');
var model = require('../model');
var async = require('async');
var ids;
describe('upvotes_controller', function () {
    before(function (done) {
        require('../seed/seed')('token', function (err, res) {
            ids = res;
            done();
        });

    });
    it('should create positive upvote', function (done) {
        model.Upvote.count().then(function (c) {
            var before = c;
            request({
                method: 'POST',
                path: '/upvotes',
                data: {
                    upvote: {
                        OpinionId: ids.opinions[0].id

                    }
                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function (err, resp) {
                resp.status.should.be.eql(201);
                model.Upvote.count().then(function (c) {
                    before.should.be.eql(c - 1);
                    done();

                });
            });
        });

    });
    it('should not create existing positive upvote', function (done) {
        model.Upvote.count().then(function (c) {
            var before = c;
            request({
                method: 'POST',
                path: '/upvotes',
                data: {
                    upvote: {
                        OpinionId: ids.opinions[0].id

                    }
                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function (err, resp) {
                resp.status.should.be.eql(403);
                model.Upvote.count().then(function (c) {
                    before.should.be.eql(c);
                    done();

                });
            });
        });

    });
    it('should create negative upvote and delete positive upvote', function (done) {
        var upvotesCount = null;
        var devotesCount = null;
        async.parallel([
            function (callback) {
                model.Upvote.count().then(function (c) {
                    upvotesCount = c;
                    callback();
                });
            },
            function (callback) {
                model.Devote.count().then(function (c) {
                    devotesCount = c;
                    callback();
                });
            }
        ], function (err, res) {
            request({
                method: 'POST',
                path: '/devotes',
                data: {
                    devote: {
                        OpinionId: ids.opinions[0].id
                    }
                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function (err, resp) {
                resp.status.should.be.eql(201);
                var upvotesNow = null;
                var devotesNow = null;
                async.parallel([
                    function (callback) {
                        model.Upvote.count().then(function (c) {
                            upvotesNow = c;
                            callback();
                        });
                    },
                    function (callback) {
                        model.Devote.count().then(function (c) {
                            devotesNow = c;
                            callback();
                        });
                    }
                ], function (err, res) {
                    upvotesNow.should.be.eql(upvotesCount - 1);
                    devotesNow.should.be.eql(devotesCount + 1);
                    done();

                });
            });
        });

    });
    it('should not create existing negative upvote', function (done) {
        model.Upvote.count().then(function (c) {
            var before = c;
            request({
                method: 'POST',
                path: '/devotes',
                data: {
                    devote: {
                        OpinionId: ids.opinions[0].id

                    }
                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function (err, resp) {
                resp.status.should.be.eql(403);
                model.Upvote.count().then(function (c) {
                    before.should.be.eql(c);
                    done();

                });
            });
        });

    });

});