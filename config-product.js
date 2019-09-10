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
    },
}
