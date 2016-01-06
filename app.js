switch(process.argv[2]) {
    case 'test':
        process.env.NODE_ENVIRONMENT = 'test';
        break;
    case 'production':
        process.env.NODE_ENVIRONMENT = 'production';
        break;
    default:
        process.env.NODE_ENVIRONMENT = 'development';
        break;
}

var express = require('express');
var util = require('util');
var app = express();

app.use(function(req, res, next) {
    console.log(req.path);
    next();
});


app.get('/', function(req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});

app.use(express.static('public'));


var server = app.listen(3000, function() {
    console.log('Listening on %d', server.address().port);
});