// Достает из mongodb сведения о клиенте
const Client = require('../models/client');

module.exports.findById = (id, done) => {
  console.log(id);
  // loadClientById(id, done).catch(error => console.error(error.stack));
  Client.find({ _id: id }, (err, client) => {
    if (err) {
      // throw err;
      return done(new Error('Client Not Found'));
    }
    console.log('Client found');
    // Мы получаем массив, поэтому вместо массива отправляем объект
    return done(null, client[0]);
  });
};

module.exports.findByYClientId = (yClientId, done) => {
  console.log(yClientId);
  Client.find({ yClientId }, (err, client) => {
    if (err) {
      // throw err;
      return done(new Error('Client Not Found'));
    }
    console.log('Client found');
    // Мы получаем массив, поэтому вместо массива отправляем объект
    return done(null, client[0]);
  });
};

async function loadClientById(id, done) {
  await Client.find({ _id: id }, (err, client) => {
    if (err) {
      return done(new Error('Client Not Found'));
    }
    console.log('Client found');
    return done(null, client[0]);
  });
}
