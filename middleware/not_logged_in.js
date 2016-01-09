var notLoggedIn = function (req, res, next) {
    if (req.currentUser) {
        next();
    } else {
        console.log('Not logged in');
        res.sendStatus(401);
    }
};
module.exports = notLoggedIn;