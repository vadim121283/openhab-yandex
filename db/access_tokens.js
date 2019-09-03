'use strict';
// Достает из mongodb сведения о токенах
const Token = require('../models/token');

const tokens = {};

const loki = require('lokijs');
global.dbl = new loki('./loki.json', {
  autoload: true,
  autosave: true,
  autosaveInterval: 5000,
  autoloadCallback() {
    global.authl = global.dbl.getCollection('tokens');
    if (global.authl === null) {
      global.authl = global.dbl.addCollection('tokens');
    }
  }
});

module.exports.find = (key, done) => {
    console.log('token.find proc');
    loadToken(key);
    console.log('token.find for: ' + tokens[key]);
    if (tokens[key]) return done(null, tokens[key]);
    return done(new Error('Token Not Found'));
};

module.exports.findOld = (key, done) => {
  console.log('token.find:');
  loadToken(key);
  console.log(tokens[key]);
  if (tokens[key]) return done(null, tokens[key]);
  return done(new Error('Token Not Found'));
};

module.exports.findByUserIdAndClientId = (userId, clientId, done) => {
  loadTokenByUserId(userId);
  for (const token in tokens) {
    if (tokens[token].userId === userId && tokens[token].clientId === clientId) return done(null, token);
  }
  return done(new Error('Token Not Found'));
};

module.exports.save = (token, userId, clientId, done) => {
  console.log('Start saving token');
  tokens[token] = { userId, clientId };
  var ltoken1 = global.authl.findOne( {'userId': userId} );
  if(ltoken1){
    console.log(ltoken1.userId);
    console.log('User Updated');
    ltoken1.token = token;
    ltoken1.userId = userId;
    ltoken1.clientId = clientId;
    global.authl.update(ltoken1);
  }else{
    console.log('User not Found. Create new...');
    global.authl.insert({
        'type': 'token',
        'token': token,
        'userId': userId,
        'clientId': clientId
      });
  }
  done();
};

function loadTokenByUserId(userId, done) {
  console.log('HERE 1: ' + userId);
  var ltoken = global.authl.findOne( {'userId': userId} );
  console.log('HERE 2');
  if(ltoken){
    console.log('Load token by userId: User found');
    var token = ltoken.token;
    var userId = ltoken.userId;
    var clientId = ltoken.clientId;
    tokens[token] = { userId, clientId };
  }else{
    console.log('Load token by userId: User not found');
    return;
  }
};

function loadToken(token, done) {
    Token.find({ token: token }, function (err, token) {
        if (err) {
            //throw err;
            return done(new Error('Token Not Found'));
        } else {
            console.log('Token found');
            // Мы получаем массив, поэтому вместо массива отправляем объект
            let userId = token[0].userId;
            let clientId = token[0].clientId;
            tokens[key] = { userId, clientId };
        };
    });
};

function loadTokenOld(token, done) {
    var ltoken2 = global.authl.findOne( {'token': token} );
    if(ltoken2){
        console.log('Token found');
        var token1 = ltoken2.token;
        var userId = ltoken2.userId;
        var clientId = ltoken2.clientId;
        tokens[token1] = { userId, clientId };
    }else{
        console.log('Token not found');
        return;
    }
};
