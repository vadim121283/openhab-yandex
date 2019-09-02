const config = require('../config');
var User = require('../models/user');
var mongoose = require('mongoose');
console.log(mongoose.version);
mongoose.connect(getMongoUri(), { useNewUrlParser: true, useCreateIndex: true }, function (err) {
    if (err) throw err;
    console.log('MongoDB Successfully connected');

    var testUser = new User({
        _id: new mongoose.Types.ObjectId(),
        username: 'test@test.ru',
        password: '12345'
    });

    testUser.save(function (err) {
        if (err) throw err;

        console.log('User saved');
    })
});

function getMongoUri() {
    var mongoUri = 'mongodb://';
    mongoUri += config.mongodb.hosts;
    console.log('MongoDB mongoUri: ' + mongoUri);
    return mongoUri + '/' + config.mongodb.db;
};
