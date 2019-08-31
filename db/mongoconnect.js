const config = require('../config');
var mongoose = require('mongoose');

mongoose.connect(getMongoUri(), function (err) {

    if (err) throw err;
    console.log('MongoDB Successfully connected');
});

function getMongoUri() {
    var mongoUri = 'mongodb://';
    mongoUri += config.mongodb.hosts;
    return mongoUri + '/' + config.mongodb.db;
};
