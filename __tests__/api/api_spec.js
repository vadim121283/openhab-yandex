const frisby = require('frisby');
const config = require('../../config');
const getPort = require('get-port');

// Test data
const client = {
    name: "Test Client Name",
    yClientId: "TestClientId",
    clientSecret: "TestClientSecret"
};
// Test User
const user = {
    username: "test@gmail.com",
    password: "1234"
};
// Fake openhab
const ohHost = 'http://localhost:3000';

/*frisby.globalSetup({
    request: {
        headers: {
            'Authorization': 'Basic ' + Buffer.from("username:password").toString('base64'),
            'Content-Type': 'application/json',
        }
    }
});*/

describe('Server', function () {
    it('should return a status of 200', function () {
        getPort().then(port => {
            config.https.port = port;
            config.openhab.host = ohHost;
            let api = require('../../app.js'),
                baseUrl = `http://localhost:${config.https.port}`;
            return frisby.get(`${baseUrl}/`)
                .expect('status', 200)
                .after(function (err) {
                    if (err) fail(err);
                    api.closeServer();
            });
        });
    });
});


