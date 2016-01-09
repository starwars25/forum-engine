process.env.NODE_ENVIRONMENT = 'test';
var should = require('should');
var request = require('../helpers/request_helper');
describe('Test', function() {
    before(function(done) {
        require('../seed/seed')('token', function(err) {
            done();
        });

    });
    it('#test fetch topics', function(done) {
        request({
            method: 'GET',
            path: '/topics',
            data: ''
        }, function(err, resp) {
            var response = JSON.parse(resp.data);

            response[0].theme.should.eql('TestTheme');
            done();
        });
    });
    it('#test fetch profile', function(done) {
        request({
            method: 'GET',
            path: '/current-user',
            data: '',
            cookies: {
                'token': 'token',
                'user-id': 1
            }
        }, function(err, resp) {
            var response = JSON.parse(resp.data);
            response.name.should.eql('TestUser');
            done();
        });
    });
});