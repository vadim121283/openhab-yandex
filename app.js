'use strict';

const express = require('express');
const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
const config = require('./config');
const fs = require('fs');
const app = express();
const https = require('https');
const privateKey = fs.readFileSync(config.https.privateKey, 'utf8');
const certificate = fs.readFileSync(config.https.certificate, 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate
};

const mongoose = require('mongoose');
const MongoConnect = require('./db/mongoconnect');
let mongoConnect;

// HTTPS server
const httpsServer = https.createServer(credentials, app);

// MongoDB
mongoConnect = new MongoConnect();
mongoConnect.connect(mongoose);

// Запуск Express
app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('views'));
app.use(cookieParser());
app.use(bodyParser.json({
    extended: false
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(errorHandler());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration API urls
require('./auth');
app.get('/', routes.site.index);
app.get('/login', routes.site.loginForm);
app.post('/login', routes.site.login);
app.get('/logout', routes.site.logout);
app.get('/account', routes.site.account);
app.get('/dialog/authorize', routes.oauth2.authorization);
app.post('/dialog/authorize/decision', routes.oauth2.decision);
app.post('/oauth/token', routes.oauth2.token);
app.get('/api/userinfo', routes.user.info);
app.get('/api/clientinfo', routes.client.info);
app.get('/provider/v1.0', routes.user.ping);
app.get('/provider', routes.user.ping);
app.get('/provider/v1.0/user/devices', routes.user.devices);
app.post('/provider/v1.0/user/devices/query', routes.user.query);
app.post('/provider/v1.0/user/devices/action', routes.user.action);
app.post('/provider/v1.0/user/unlink', routes.user.unlink);
httpsServer.listen(config.https.port);

module.exports = app;
