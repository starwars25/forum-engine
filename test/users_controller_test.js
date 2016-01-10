process.env.NODE_ENVIRONMENT = 'test';
var should = require('should');
var request = require('../helpers/request_helper');
var model = require('../model');
var async = require('async');
var instances;

describe('users_controller', function() {
    before(function (done) {
        require('../seed/seed')('token', function (err, res) {
            instances = res;
            done();
        });

    });
    it('should get topic', function(done) {
        request({
            method: 'GET',
            path: '/topics/' + instances.topics[0].id,
            data: ''
        }, function(err, res) {
            console.log(res.data);
            var json = JSON.parse(res.data);
            json.opinions[0].upvotes_count.should.eql(0);
            json.opinions[0].devotes_count.should.eql(1);
            done();
        });
    });
});