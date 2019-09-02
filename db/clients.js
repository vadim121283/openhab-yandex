'use strict';
// todo Переделать на запрос и хранение в mongodb
const Client = require('../models/client');
const mongoose = require('mongoose');
const MongoConnect = require('./mongoconnect');
var mongoConnect;
var clients = {};

mongoConnect = new MongoConnect();
mongoConnect.connect(mongoose);

loadClients();
function loadClients() {
    Client.find({
    }).exec(function (err, clients1) {
            if (err) throw err;
            clients = clients1;
            console.log(clients);
        });
}

module.exports.findById = (id, done) => {
    console.log(id);
    console.log(clients[0]);
    for (let i = 0, len = clients.length; i < len; i++) {
        if (clients[i]._id === id) return done(null, clients[i]);
    }
    return done(new Error('Client Not Found'));
};

module.exports.findByClientId = (clientId, done) => {
  for (let i = 0, len = clients.length; i < len; i++) {
    if (clients[i].clientId === clientId) return done(null, clients[i]);
  }
  return done(new Error('Client Not Found'));
};
