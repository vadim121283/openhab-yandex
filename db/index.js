'use strict';

const users = require('./users');
const clients = require('./clients');
const accessTokens = require('./access_tokens');
const authorizationCodes = require('./authorization_codes');
const mongoConnect = require('./mongoconnect');

module.exports = {
  users,
  clients,
  accessTokens,
  authorizationCodes,
    mongoConnect,
};
