// 1. Rename this to config.js
// 2. set user & pass for db
// 3. Genera
module.exports = {
  openhab: {
    host: ['https://myopenhab.org']
  },
  mongodb: {
    hosts: ['127.0.0.1'],
    db: 'openhabyandex',
    user: '',
    password: ''
  },
  https: {
    privateKey: '/mnt/data/root/private.pem',
    certificate: '/mnt/data/root/cert.crt',
    port: 443
  }
};
