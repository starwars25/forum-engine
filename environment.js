module.exports = function () {
    switch (process.argv[2]) {
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

};