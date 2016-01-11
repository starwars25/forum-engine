process.env.NODE_ENVIRONMENT = 'test';
var should = require('should');
var request = require('../helpers/request_helper');
var model = require('../model');
var async = require('async');
var instances;
describe('comments_controller', function () {
    before(function (done) {
        require('../seed/seed')('token', function (err, res) {
            instances = res;
            done();
        });

    });
    describe('create comment', function() {
        // Not logged in : 401
        // No such opinion : 404
        // Wrong input: 400
        // Created : 201
        it('should return 401', function(done) {
            request({
                method: 'POST',
                path: '/comments',
                data: {
                    comment: {
                        OpinionId: instances.opinions[0].id,
                        content: 'Valid content'
                    }

                }
            }, function(err, res) {
                res.status.should.eql(401);
                done();
            });
        });
        it('should return 404', function(done) {
            request({
                method: 'POST',
                path: '/comments',
                data: {
                    comment: {
                        OpinionId: 999999,
                        content: 'Valid content'
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(404);
                done();
            });
        });
        it('should return 400', function(done) {
            request({
                method: 'POST',
                path: '/comments',
                data: {
                    comment: {
                        OpinionId: instances.opinions[0].id,
                        content: ''
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(400);
                done();
            });
        });
        it('should return 201', function(done) {
            request({
                method: 'POST',
                path: '/comments',
                data: {
                    comment: {
                        OpinionId: instances.opinions[0].id,
                        content: 'Valid content'
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(201);
                done();
            });
        });
    });

    describe('update comment', function() {
        // Not logged in: 401
        // No such comment: 404
        // Wrong user: 403
        // Invalid data: 400
        // Valid: 200

        it('should return 401', function(done) {
            request({
                method: 'PUT',
                path: '/comments/' + instances.comments[0].id,
                data: {
                    comment: {
                        content: 'Valid content'
                    }

                }
            }, function(err, res) {
                res.status.should.eql(401);
                done();
            });
        });
        it('should return 404', function(done) {
            request({
                method: 'PUT',
                path: '/comments/' + 999999,
                data: {
                    comment: {
                        content: 'Valid content'
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(404);
                done();
            });
        });
        it('should return 403', function(done) {
            request({
                method: 'PUT',
                path: '/comments/' + instances.comments[1].id,
                data: {
                    comment: {
                        content: 'Valid content'
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(403);
                done();
            });
        });
        it('should return 400', function(done) {
            request({
                method: 'PUT',
                path: '/comments/' + instances.comments[0].id,
                data: {
                    comment: {
                        content: 'Y'
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(400);
                done();
            });
        });
        it('should return 200', function(done) {
            request({
                method: 'PUT',
                path: '/comments/' + instances.comments[0].id,
                data: {
                    comment: {
                        content: 'Valid content'
                    }

                },
                cookies: {
                    'user-id': 1,
                    'token': 'token'
                }
            }, function(err, res) {
                res.status.should.eql(200);
                done();
            });
        });
    })
});