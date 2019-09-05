'use strict';
// Достает из mongodb сведения о user
const User = require('../models/user');

module.exports.findById = (id, done) => {
  console.log(id);
    User.findOne({ _id: id }, function (err, user) {
        if (err) {
            //throw err;
            return done(new Error('User Not Found'));
        } else {
            console.log('User found');
            return done(null, user);
        };
    });
};

module.exports.findByUsername = (username, done) => {

    console.log(username);
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            //throw err;
            return done(new Error('User Not Found'));
        } else {
            console.log('User found: ');
            return done(null, user);
        };
    });
};
