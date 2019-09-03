'use strict';
// Достает из mongodb сведения о user
const User = require('../models/user');
const mongoose = require('mongoose');
const MongoConnect = require('./mongoconnect');
let mongoConnect;

mongoConnect = new MongoConnect();
mongoConnect.connect(mongoose);

module.exports.findById = (id, done) => {

  console.log(id);
    User.find({ _id: id }, function (err, user) {
        if (err) {
            //throw err;
            return done(new Error('User Not Found'));
        } else {
            console.log('User found');
            // Мы получаем массив, поэтому вместо массива отправляем объект
            return done(null, user[0]);
        };
    });
};

module.exports.findByUsername = (username, done) => {

    console.log(username);
    Client.find({ username: username }, function (err, user) {
        if (err) {
            //throw err;
            return done(new Error('User Not Found'));
        } else {
            console.log('User found');
            // Мы получаем массив, поэтому вместо массива отправляем объект
            return done(null, user[0]);
        };
    });
};
