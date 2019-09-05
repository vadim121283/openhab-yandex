'use strict';

const passport = require('passport');
const openhab = require('./openhab');
const utils = require('../utils');

// Информация по пользователю
module.exports.info = [
  passport.authenticate('bearer', { session: true }),
  (request, response) => {
    response.json({ user_id: request.user._id, name: request.user.name, scope: request.authInfo.scope });
  }
];

module.exports.ping = [
  passport.authenticate('bearer', { session: true }),
  (request, response) => {
    response.status(200);
    response.send('OK');
  }
];

// Выдача массива devices
module.exports.devices = [
  passport.authenticate('bearer', { session: true }),
    (request, response) => {
  openhab.getDevices(request.user).then((devices) => {
      var r = {
          request_id: utils.getUid(16),
          payload: {
              user_id: request.user._id,
              devices: []
          }
      };
      for (var i in devices) {
          r.payload.devices.push(devices[i].getInfo());
      }
      response.status(200);
      response.send(r);
  });
  }
];

// Выдача состояния устройств
module.exports.query = [
  passport.authenticate('bearer', { session: true }),
  (request, response) => {
      openhab.getDevicesQuery(request.user, request.body.devices).then((devices) => {
          //console.log(devices);
          const r = {
              request_id: utils.getUid(16),
              payload: {
                  devices: []
              }
          };
          for (var i in devices) {
              r.payload.devices.push(devices[i].getInfo());
              console.log(r);
          }
          response.send(r);
      });
  }
];

// Изменение состояния устройств
module.exports.action = [
  passport.authenticate('bearer', { session: true }),
  (request, response) => {
  var r = {
    request_id: "1",
    payload: {
      devices: []
    }
  };
  for (var i in request.body.payload.devices) {
    var id = request.body.payload.devices[i].id;
    try {

        var capabilities = global.devices2[id].setState(request.body.payload.devices[i].capabilities[0].state.value , request.body.payload.devices[i].capabilities[0].type, request.body.payload.devices[i].capabilities[0].state.instance);

    } catch (err) {

        var capabilities = global.devices2[id].setState(true , request.body.payload.devices[i].capabilities[0].type, 'mute');
    }

    r.payload.devices.push({ id: id, capabilities: capabilities });
  }
  response.send(r);
  }
];
// Отключение пользователя разъединение аккаунтов
module.exports.unlink = [
  passport.authenticate('bearer', { session: true }),
  (request, response) => {
    // todo сделать очистку токена
  response.status(200);
  }
];
