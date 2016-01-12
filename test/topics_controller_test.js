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
    it('should get first page', function(done) {
        // Should get first page
        request({
            method: 'GET',
            path: '/topics/' + instances.topics[0].id + '?page=1',
            data: '',
            cookies: {
                'user-id': 1,
                'token': 'token'
            }
        }, function(err, res) {
            console.log(res.data);
            var json = JSON.parse(res.data);
            json.opinions[0].upvotes_count.should.eql(0);
            json.opinions[0].devotes_count.should.eql(1);
            json.opinions[0].comments[0].UserId.should.eql(instances.comments[0].UserId);
            json.opinions[0].comments[1].UserId.should.eql(instances.comments[1].UserId);
            json.opinions.length.should.eql(20);
            json.page.should.eql(1);
            json.pageCount.should.eql(5);
            json.votes.devotes[instances.opinions[0].id].should.eql(instances.devotes[0].id);

            done();
        });
    });
    it('should get second page', function(done) {
        // Should get first page
        request({
            method: 'GET',
            path: '/topics/' + instances.topics[0].id + '?page=2',
            data: '',
            cookies: {
                'user-id': 1,
                'token': 'token'
            }
        }, function(err, res) {
            console.log(res.data);
            var json = JSON.parse(res.data);
            json.opinions.length.should.eql(20);
            json.page.should.eql(2);
            json.pageCount.should.eql(5);

            done();
        });
    });

});