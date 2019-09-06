const config = require('../config');
const User = require('../models/user');
const Client = require('../models/client');
const mongoose = require('mongoose');
console.log(mongoose.version);

mongoose.connect(getMongoUri(), {
    useNewUrlParser: true,
    useCreateIndex: true }, function (err) {
    if (err) throw err;
    console.log('MongoDB Successfully connected');

    var adminUser = new User({
        _id: new mongoose.Types.ObjectId(),
        username: 'testUser',
        password: 'TestUser',
        name: 'testUser'
    });

    adminUser.save(function (err) {
        if (err) throw err;

        console.log('User saved');
    });

    var adminClient = new Client({
        name: 'testClient',
        yClientId: 'testClient',
        clientSecret: 'TestClient'
    });

    adminClient.save(function (err) {
        if (err) throw err;

        console.log('Client saved');
    });

});

function getMongoUri() {
    var mongoUri = 'mongodb://';
    mongoUri += config.mongodb.hosts;
    console.log('MongoDB mongoUri: ' + mongoUri);
    return mongoUri + '/' + config.mongodb.db;
};
