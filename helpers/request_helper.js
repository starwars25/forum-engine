var http = require('http');
var util = require('util');

var formCookies = function(cookies) {
    if (cookies) {
        var keys = Object.keys(cookies);
        var pairs = [];
        for(var i = 0; i < keys.length; i++) {
            pairs.push(util.format('%s=%s', keys[i], cookies[keys[i]]));
        }
        return pairs.join('; ');
    } else {
        return '';
    }

};

module.exports = function(request, callback) {

    var postData = JSON.stringify(request.data);
    var req = http.request({
        port: 9292,
        method: request.method,
        path: request.path,
        headers: {
            'content-type': 'application/json',
            'content-length': postData.length,
            'cookie': formCookies(request.cookies)
        }

    }, function(res) {
        var response = '';
        res.on('data', function(chunk) {
            response += chunk.toString();
        });
        res.on('end', function() {
            callback(null, {
                status: res.statusCode,
                data: response
            });
        });
    });
    req.write(postData);
    req.end();
};