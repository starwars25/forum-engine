var https = require('https');
var util = require('util');
var start = function (app, callback) {
    app.get(config.route, function (req, res, next) {
        if (req.query.code) {
            var app_id = config.client_id;
            var app_secret = config.app_secret;
            var redirect_uri = util.format('http://%s%s', config.host, config.route);
            var code = req.query.code;
            var request = https.request({
                host: 'oauth.vk.com',
                path: util.format('/access_token?client_id=%d&client_secret=%s&redirect_uri=%s&code=%s', app_id, app_secret, redirect_uri, code)
            }, function (response) {
                var data = '';
                response.on('data', function (chunk) {
                    data += chunk.toString();
                });
                response.on('end', function () {
                    try {
                        var json = JSON.parse(data);
                        if (json.error) {
                            callback(res, new Error('Error occured'), null);
                        } else {
                            var output = {};
                            output.access_token = json.access_token;
                            output.user_id = json.user_id;
                            output.expires_in = json.expires_in;
                            callback(res, null, output);
                        }
                    } catch (e) {
                        callback(req, new Error('Error while parsing response'), null);
                    }
                });
            });
            request.end();
        } else {
            callback(res, new Error('Invalid request'), null);
        }
    });
};
var config = {
    host: 'localhost:3000',
    route: '/token',
    scope: [],
    display: 'page'
};
var getUrl = function () {
    var client_id = config.client_id;
    var redirect_uri = encodeURIComponent(util.format('http://%s%s', config.host, config.route));
    var display = config.display;
    var scope = config.scope.join(',');
    var response_type = 'code';
    var v = '5.42';
    return util.format("https://oauth.vk.com/authorize?client_id=%d&display=%s&redirect_uri=%s&scope=%s&response_type=%s&v=%s", client_id, display, redirect_uri, scope, response_type, v);
};
module.exports = {
    start: start,
    config: config,
    getUrl: getUrl
};
