process.env.NODE_ENVIRONMENT = 'test';
var should = require('should');
var request = require('../helpers/request_helper');
var model = require('../model');
var async = require('async');
var instances;

describe('topics_controller', function() {
    before(function (done) {
        require('../seed/seed')('token', function (err, res) {
            instances = res;
            done();
        });

    });
    it('should get all topics first page', function(done) {
        // Should get first page
        request({
            method: 'GET',
            path: '/topics?page=1',
            data: '',
            cookies: {
                'user-id': 1,
                'token': 'token'
            }
        }, function(err, res) {
            var json = JSON.parse(res.data);
            json.topics.length.should.eql(20);
            json.page.should.eql(1);
            json.pageCount.should.eql(5);

            done();
        });
    });
    it('should get all topics second page', function(done) {
        // Should get first page
        request({
            method: 'GET',
            path: '/topics?page=2',
            data: '',
            cookies: {
                'user-id': 1,
                'token': 'token'
            }
        }, function(err, res) {
            var json = JSON.parse(res.data);
            json.topics.length.should.eql(20);
            json.page.should.eql(2);
            json.pageCount.should.eql(5);

            done();
        });
    });


});