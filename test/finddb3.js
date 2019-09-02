var Client = require('../models/client');
var mongoose = require('mongoose');
var MongoConnect = require('./mongoconnect');
var mongoConnect;

console.log(mongoose.version);

mongoConnect = new MongoConnect();
mongoConnect.connect(mongoose);

testStart();

function testStart() {
    var client = findCli2('5d6bfa4c874bf515c4b8db6c');
    console.log('Second:' + client.name);
}

// Найти по Id

function findCli(id){
    Client.findById(id, function (err, client) {
        if (err) throw err;
        console.log('First:' + client.name);
        return client;
    });
}

async function findCli2(id){
    var client = Client.findById(id, function (err, client) {
        if (err) throw err;
        console.log('First:' + client.name);
        return client;
    }).exec();
    return client;
}
