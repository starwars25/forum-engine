process.env.NODE_ENVIRONMENT = 'test';
var should = require('should');
describe('Test', function() {
    before(function(done) {
        require('../seed/seed')('token', function(err) {
            done();
        });

    });
    it('#test', function() {
        (1).should.eql(1);
    });
});