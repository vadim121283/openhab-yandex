const assert = require("assert");
const openhab = require("../../routes/openhab");
const config = require('../../config');

const host15 = 'http://192.168.30.102:8080';
//const host15 = 'https://myopenhab.org';
const host14 = 'http://192.168.30.5:8080';

const user = {
    _id: "fakeId123",
    username: "test@gmail.com",
    password: "1234"
};
/*beforeEach(async function() {
    await db.clear();
    await db.save([tobi, loki, jane]);
});*/

describe('openHABian API test', function() {
    let expectedObj = {
        name: expect.any(String),
        room: expect.any(String),
    };
    let devices = [];
    let devicesQuery = [];
    it('load devices from openhab 1.4', async function() {
        config.openhab.host = host14;
        devices = await openhab.getDevices(user);
        expect(devices[0].data).toEqual(expect.objectContaining(expectedObj));
        console.log('openHABian 1.4 Devices count: ' + devices.length + ' First device: ' + devices[0].data.name);
    });
    it('query one device from openhab 1.4', async function() {
        config.openhab.host = host14;
        devicesQuery = await openhab.getDevicesQuery(user, [devices[0].getInfo()]);
        expect(devicesQuery[0].data).toEqual(expect.objectContaining(expectedObj));
        console.log('Query device: ' + devicesQuery[0].data.name);
    });
    it('turn off one device from openhab 1.4', async function() {
        config.openhab.host = host14;
        let device = devices[0].getInfo();
        device.capabilities = [
            {
                state: {
                    instance: 'on',
                    value: 'false'
                },
                type: 'device.capabilities.on_off'
            }
        ];
        let res = await openhab.setDevices(user, [device]);
        console.log('Action: ' + JSON.stringify(res[0].capabilities[0].state.action_result.status));
        expect(res[0].capabilities[0].state.action_result.status).toEqual(expect.any(String));
    });

    it('load devices from openhab 1.5', async function() {
        config.openhab.host = host15;
        devices = await openhab.getDevices(user);
        expect(devices[0].data).toEqual(expect.objectContaining(expectedObj));
        console.log('openHABian 1.5 Devices count: ' + devices.length + ' First device: ' + devices[0].data.name);
    });
    it('query one device from openhab 1.5', async function() {
        config.openhab.host = host15;
        devicesQuery = await openhab.getDevicesQuery(user, [devices[0].getInfo()]);
        //expect(devicesQuery[0].data).toEqual(expect.objectContaining(expectedObj));
        console.log('Query device: ' + devicesQuery[0].data.name);
    });
    it('turn off one device from openhab 1.5', async function() {
        config.openhab.host = host15;
        let device = devices[0].getInfo();
        device.capabilities = [
            {
                state: {
                    instance: 'on',
                    value: 'false'
                },
                type: 'device.capabilities.on_off'
            }
        ];
        let res = await openhab.setDevices(user, [device]);
        console.log('Action: ' + JSON.stringify(res[0].capabilities[0].state.action_result.status));
        expect(res[0].capabilities[0].state.action_result.status).toEqual(expect.any(String));
    });
});
