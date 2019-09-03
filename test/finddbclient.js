let clients = require('../db/clients');

clients.findByYClientId('YandexDialog1', (error, client) => {
    if (error) return done(error);
    if (!client) return done(null, false);
    console.log(client.clientSecret);
});

