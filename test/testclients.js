var clients = require('../db/clients');

clients.findById('5d6bfa4c874bf515c4b8db6c', (error, client) => {
    if (error) return error;
    console.log(client);
    return (null, client);
});
