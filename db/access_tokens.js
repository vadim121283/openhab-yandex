'use strict';
// Достает из mongodb сведения о токенах
const Token = require('../models/token');

module.exports.find = (key, done) => {
    // Отправляем только clientID и userID на запрос, без токена.

    Token.findOne({ token: key }, function (err, token) {
        if (err) {
            //throw err;
            return done(new Error('Token Not Found'));
        } else {
            if (token === null) return done(new Error('Token Not Found'));
            console.log('Token found ');
            // Мы получаем массив
            let tokenArr = [];
            let userId = token.userId;
            let clientId = token.clientId;
            tokenArr[token.token] = { userId, clientId };
            return done(null, tokenArr[key]);
        };
    });
};

module.exports.findByUserIdAndClientId = (userId, clientId, done) => {
  // Отправляем только один сам токен
    Token.findOne({ userId: userId }, function (err, token) {
        if (err) {
            //throw err;
            return done(new Error('Tokens By userId Not Found'));
        } else {
            if (token === null) return done(new Error('Token Not Found'));
            console.log('Tokens by userID found');
            // Мы получаем массив
            let key = token.token;
            let loadUserId = token.userId;
            let loadClientID = token.clientId;
            //console.log('LU: ' + loadUserId + ' U: ' + userId + ' LC: ' + loadClientID + ' C: ' + clientId);
            if (loadUserId == userId && loadClientID == clientId) return done(null, key);
            return done(new Error('Tokens By clientId Not Found'));
        };
    });
};

module.exports.deleteToken = (userId) => {
    console.log('Process delete token started...')
    Token.deleteMany({ userId: userId }, function (err) {
        if (err) {
            throw err;
        } else {
            console.log('Token deleted: ' + userId);
            return;
        };
    });
};

module.exports.save = (token, userId, clientId, done) => {
  console.log('Start saving token');
  Token.findOne({ userId: userId }, function (err, loadToken) {
      if (err) {
          //throw err;
          return done(new Error('DB Error'));
      } else {
          if (loadToken) {
              // Пользователь найден, обновим
              console.log('userID in tokens found');
              loadToken.token = token;
              loadToken.userId = userId;
              loadToken.clientId = clientId;
              loadToken.save(function (err) {
                  if (err) throw err;

                  console.log(loadToken.userId);
                  console.log('User token updated');
              });
          } else {
              // Пользователя нет, создадим новый токен
              console.log('User not Found in Tokens. Create new...');

              let newToken = new Token({
                  token: token,
                  type: 'token',
                  userId: userId,
                  clientId: clientId
              });

              newToken.save(function (err) {
                  if (err) throw err;

                  console.log('Token saved');
              });
          }
      };
  });
  done();
};
