'use strict';
// Достает из mongodb сведения о клиенте
const Client = require('../models/client');

module.exports.findById = (id, done) => {
    console.log(id);
    // Запуск либо через async либо так. Работает так.
    //loadClientById(id, done).catch(error => console.error(error.stack));
    Client.find({ _id: id }, function (err, client) {
        if (err) {
            //throw err;
            return done(new Error('Client Not Found'));
        } else {
            console.log('Client found');
            // Мы получаем массив, поэтому вместо массива отправляем объект
            return done(null, client[0]);
        };
    });
};

module.exports.findByYClientId = (yClientId, done) => {
    console.log(yClientId);
    Client.find({ yClientId: yClientId }, function (err, client) {
        if (err) {
            //throw err;
            return done(new Error('Client Not Found'));
        } else {
            console.log('Client found');
            // Мы получаем массив, поэтому вместо массива отправляем объект
            return done(null, client[0]);
        };
    });
};

async function loadClientById(id, done) {
    // Async function, но работает и без нее.
    await Client.find({ _id: id }, function (err, client) {
        if (err) {
            return done(new Error('Client Not Found'));
        } else {
            console.log('Client found');
            return done(null, client[0]);
        };
    });
}

