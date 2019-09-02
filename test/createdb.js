const config = require('../config');
var User = require('../models/user');
var Client = require('../models/client');
var Token = require('../models/token');
var mongoose = require('mongoose');
console.log(mongoose.version);

mongoose.connect(getMongoUri(), {
    useNewUrlParser: true,
    useCreateIndex: true }, function (err) {
    if (err) throw err;
    console.log('MongoDB Successfully connected');

    var adminUser = new User({
        _id: new mongoose.Types.ObjectId(),
        username: 'vadim121283@gmail.com',
        password: 'Vfr4Dew33FGr4'
    });

    adminUser.save(function (err) {
        if (err) throw err;

        console.log('User saved');
    });

    var adminClient = new Client({
        name: 'YandexDialog',
        yClientId: 'YandexDialog1',
        clientSecret: 'Zaq1Nhy6Zaq1'
    });

    adminClient.save(function (err) {
        if (err) throw err;

        console.log('Client saved');
    });

    var adminToken = new Token({
        token: 'i1f90P2uuruk3xeJgLIhVhEgYkDK6TuSV3kZwsbGXOhvqdpmtEYp2fleox0lfSqDVYwZ4Pg83ZzNjKxqLZPVTWMuugHcjUQgwGrN0l8dyr3lRU2NQWF7xKZv9Y5a0S4QPcLMBe7ujTzC1lVUZxBPmXvY1H3zu5Cfg2S5dBN5HwGpzPO5O7d5QWKKBlgUTFM8eQFylYMFIcd51ZBna3abX8hnO6OLUzejjw6Y2bo5BqSdVuYi7vQWprREfOcgcyTQ',
        type: 'token',
        userId: adminUser._id,
        clientId: adminClient._id,
        clientSecret: 'Zaq1Nhy6Zaq1'
    });

    adminToken.save(function (err) {
        if (err) throw err;

        console.log('Token saved');
    });
});

function getMongoUri() {
    var mongoUri = 'mongodb://';
    mongoUri += config.mongodb.hosts;
    console.log('MongoDB mongoUri: ' + mongoUri);
    return mongoUri + '/' + config.mongodb.db;
};
