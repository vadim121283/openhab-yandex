// Достает из mongodb сведения о токенах
const Token = require('../models/token');

module.exports.find = (key, done) => {
  // Отправляем только clientID и userID на запрос, без токена.
  Token.findOne({ token: key }, (err, token) => {
    if (err) {
      // throw err;
      return done(new Error('Token Not Found'));
    }
    if (token === null) return done(new Error('Token Not Found'));
    console.log('Token found ');
    // Мы получаем массив
    const tokenArr = [];
    const userId = token.userId;
    const clientId = token.clientId;
    tokenArr[token.token] = { userId, clientId };
    return done(null, tokenArr[key]);
  });
};

module.exports.findByUserIdAndClientId = (userId, clientId, done) => {
  // Отправляем только один сам токен
  Token.findOne({ userId }, (err, token) => {
    if (err) {
      // throw err;
      return done(new Error('Tokens By userId Not Found'));
    }
    if (token === null) return done(new Error('Token Not Found'));
    console.log('Tokens by userID found');
    // Мы получаем массив
    const key = token.token;
    const loadUserId = token.userId;
    const loadClientID = token.clientId;
    if (loadUserId == userId && loadClientID == clientId) {
      return done(null, key);
    }
    return done(new Error('Tokens By clientId Not Found'));
  });
};

module.exports.deleteToken = (userId) => {
  console.log('Process delete token started...');
  Token.deleteMany({ userId }, (err) => {
    if (err) {
      throw err;
    } else {
      console.log(`Token deleted: ${userId}`);
    }
  });
};

module.exports.save = (token, userId, clientId, done) => {
  console.log('Start saving token');
  Token.findOne({ userId }, (err, loadToken) => {
    if (err) {
      // throw err;
      return done(new Error('DB Error'));
    } else if (loadToken) {
      // Пользователь найден, обновим
      console.log('userID in tokens found');
      loadToken.token = token;
      loadToken.userId = userId;
      loadToken.clientId = clientId;
      loadToken.save((err) => {
        if (err) throw err;

        console.log(loadToken.userId);
        console.log('User token updated');
      });
    } else {
      // Пользователя нет, создадим новый токен
      console.log('User not Found in Tokens. Create new...');

      const newToken = new Token({
        token,
        type: 'token',
        userId,
        clientId,
      });

      newToken.save((err) => {
        if (err) throw err;

        console.log('Token saved');
      });
    }
  });
  done();
};
