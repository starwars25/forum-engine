require('./environment')();
var model = require('./model');
var async = require('async');

var models = Object.keys(model);

async.eachSeries(models, function(item , callback) {
    model[item].sync({force: true}).then(function() {
        callback();
    }).catch(function(err) {
        callback(err);
    });
}, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Database created.')
    }
});

