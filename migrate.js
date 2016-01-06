require('./environment')();
var model = require('./model');
console.log('Got model');
model.User.sync({force: true}).then(function() {
    console.log('Database created.');
});