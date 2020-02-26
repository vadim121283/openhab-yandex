const frisby = require('frisby');
const config = require('../../config');
const getPort = require('get-port');

// Test data
const client = {
  name: 'Test Client Name',
  yClientId: 'TestClientId',
  clientSecret: 'TestClientSecret',
};
// Test User
const user = {
  username: 'test@gmail.com',
  password: '1234',
};
// Fake openhab
const ohHost = 'http://localhost:3000';

/* frisby.globalSetup({
    request: {
        headers: {
            'Authorization': 'Basic ' + Buffer.from("username:password").toString('base64'),
            'Content-Type': 'application/json',
        }
    }
}); */

describe('Server', () => {
  it('should return a status of 200', () => {
    getPort()
      .then((port) => {
        config.https.port = port;
        config.openhab.host = ohHost;
        const api = require('../../app.js');
        const baseUrl = `http://localhost:${config.https.port}`;
        return frisby
          .get(`${baseUrl}/`)
          .expect('status', 200)
          .after((err) => {
            api.closeServer();
            if (err) throw err;
          });
      });
  });
});
