'use strict';
// Достает из mongodb сведения о user
const Headers = require('fetch-headers');
const fetch = require('node-fetch');
const User = require('../models/user');
const config = require('../config');
let base64 = require('base-64');
let mongoose = require('mongoose');

module.exports.findById = (id, done) => {
  console.log(id);
  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      //throw err;
      return done(new Error('User Not Found'));
    } else {
      console.log('User found');
      return done(null, user);
    }
  });
};

module.exports.findByUsername = (username, password, done) => {
  console.log(username);
  User.findOne({ username: username }, async function(err, user) {
    if (err) {
      throw err;
    } else {
      if (user) {
        console.log('User found db.users');
        // Есть в базе, просто отдадим
        return done(null, user);
      } else {
        let user = await saveUser(username, password);
        if (user) {
          console.log('User Found FBU');
          return done(null, user);
        } else {
          return done(console.log('User Not Found FBU'));
        }
      }
    }
  });
};

module.exports.deleteUser = username => {
  console.log('Process delete user started...');
  User.deleteOne({ username: username }, function(err) {
    if (err) {
      throw err;
    } else {
      console.log('User deleted: ' + username);
      return;
    }
  });
};

async function saveUser(username, password) {
  // Проверим что он входит в openHAB и создадим в базе
  let ohValid = await checkOpenHabPassword(username, password);

  let user = await User.findOne({ username: username });

  if (user) {
    if (ohValid) {
      // Пользователь найден и текущие данные норм, обновим пароль
      console.log('User found, save new pass');
      user.username = username;
      user.password = password;
      user.ohValid = true;
    } else {
      // Пользователь найден, но ohValid не сработал, сравним пароли и если одинаковы
      console.log('User found. openHAB user not Found.');
      if (user.password === password) {
        user.ohValid = false;
      }
    }
    await user.save(function(err) {
      if (err) throw err;

      console.log(loadUser.username);
      console.log('User pass updated');
    });
    return user;
  } else {
    // Пользователя нет
    if (ohValid) {
      // Пользователя нет, создадим нового пользователя, ohValid - норм.
      console.log('User not Found. Create new...');

      let newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        password: password,
        name: username,
        ohValid: true
      });
      await newUser.save(function(err) {
        if (err) throw err;

        console.log('User saved');
      });
      return newUser;
    } else {
      return new Error('User - Not, OH - Not');
    }
  }
}

async function checkOpenHabPassword(username, password) {
  // Проверка пользователя и пароль openHAB
  // Авторизация на API
  let headers = new Headers();
  headers.set(
    'Authorization',
    'Basic ' + base64.encode(username + ':' + password)
  );

  let url = config.openhab.host + '/rest/uuid';

  let ohValid = false;

  await fetch(url, {
    method: 'GET',
    headers: headers
  })
    .then(function(res) {
      if (res.status === 200) {
        // Успешно
        // 200 - OK, 401 - Unauthorized
        console.log('openHAB Valid');
        ohValid = true;
      } else if (res.status === 401) {
        // 401 - Unauthorized
        console.log('openHAB Not Valid');
        ohValid = false;
      }
      return res.json();
    })
    .then(function(response) {
      // Тело содержжит UUID
    })
    .catch(function(error) {
      // Тела не будет
    });
  return ohValid;
}
