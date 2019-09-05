// Достаем через API до openHAB
let base64 = require('base-64');
const Headers = require('fetch-headers');
const fetch = require("node-fetch");
const config = require('../config');
const device = require('../models/device');

// Сначала загрузить соответствие групп и комнат на русском
// Пока в загружаемых граппах оставляю только первую группу, где обычно указана комната
// Если пометить комнаты тегом Room то можно загрузить их по тегу
// (Теги можно добавить только через файл, но мы все равно ориентируемся только по ним):
// http://myopenhab.org/rest/items?tags=Room&recursive=false&fields=name%2C%20label
// Тег выключателей
// http://myopenhab.org/rest/items?tags=Switchable&recursive=false';
// Тег света
// http://myopenhab.org/rest/items?tags=Lighting&recursive=false';

// Создает массив с объектами устройств для Яндекса
// Как отрабатывать await promise
module.exports.getDevices = async function (user) {

    let devices = [];
    let urlLight = config.openhab.host + '/rest/items?tags=Lighting&recursive=false';
    let urlSwitch = config.openhab.host + '/rest/items?tags=Switchable&recursive=false';

    let rooms = await loadRooms(user);

    await loadDevices(user, urlLight, rooms).then((ohdevices) => {
        // Тут сделать перевод на яндекс устройства
        //console.log(ohdevices[0]);

        ohdevices.forEach(function(item, index, array) {
            // Создаем объек по шаблону Яндекс и суем в массив devices
            let opts = createDevice(item, user);
            devices.push(new device(opts));
        });
        console.log('First device: ' + devices[0].data.name);
        //global.devices2.forEach(function(item, index, array) {
        //    console.log(item.data.capabilities[0].state);
        //});
    });

    await loadDevices(user, urlSwitch, rooms).then((ohdevices) => {
        // Тут сделать перевод на яндекс устройства
        //console.log(ohdevices[0]);

        ohdevices.forEach(function(item, index, array) {
            // Создаем объек по шаблону Яндекс и суем в массив devices
            let opts = createDevice(item, user);
            devices.push(new device(opts));
        });
        console.log('First device: ' + devices[0].data.name);
        //global.devices2.forEach(function(item, index, array) {
        //    console.log(item.data.capabilities[0].state);
        //});
    });

    return devices;
};

module.exports.getDevicesQuery = async function (user, qdevices) {
    let devices = [];

    let rooms = await loadRooms(user);

    await asyncForEach(qdevices, async (item) => {
        let url = item.custom_data.openhab.link;
        await loadDevices(user, url, rooms).then((ohdevices) => {
            // Тут сделать перевод на яндекс устройства
            //console.log(ohdevices[0]);

            ohdevices.forEach(function(item, index, array) {
                // Создаем объек по шаблону Яндекс и суем в массив devices
                let opts = createDevice(item, user);
                devices.push(new device(opts));
            });
            console.log('Query device done: ' + devices[0].data.name);
            //global.devices2.forEach(function(item, index, array) {
            //    console.log(item.data.capabilities[0].state);
            //});
        });
    });

    //qdevices.forEach(function (item, index, array) {});

    return devices;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function createDevice(item, user) {
    let opts = {
        id: user._id + '-' + item.name,
        name: item.label,
        description: '',
        room: item.room,
        custom_data: {
            openhab: {
                username: user.username,
                name: item.name,
                link: item.link,
                type: item.type,
                group: item.group
            }
        },
    };
    if (item.type === 'Light') {
        //console.log('Light');
        let state = false;
        if (item.state === 'ON') state = true;
        opts.type = 'devices.types.light';
        opts.capabilities = [{
            type: 'devices.capabilities.on_off',
            retrievable: true,
            state: {
                instance: 'on',
                value: state
            }
        }];
        return opts;
    }
    if (item.type === 'Switch') {
        //console.log('Switch');
        let state = false;
        if (item.state === 'ON') state = true;
        opts.type = 'devices.types.switch';
        opts.capabilities = [{
            type: 'devices.capabilities.on_off',
            retrievable: true,
            state: {
                instance: 'on',
                value: state
            }
        }];
        return opts;
    }
    if (item.type === 'Dimmer') {
        //console.log('Dimmer');
        let state = false;
        let dim = 0;
        if (item.state > 0) {
            state = true;
            dim = item.state;
        }
        opts.type = 'devices.types.light';
        opts.capabilities = [{
            type: 'devices.capabilities.on_off',
            retrievable: true,
            state: {
                instance: 'on',
                value: state
            }
        },
            {
                type: 'devices.capabilities.range',
                retrievable: true,

                parameters: {
                    instance: 'brightness',
                    unit: 'unit.percent',
                    range: {
                        min: 0,
                        max: 100,
                        precision: 1
                    }
                },
                state: {
                    instance: 'brightness',
                    value: dim,
                },
            },
        ];
        return opts;
    }
    if (item.type === 'Color') {
        //console.log('Color');
        let color = item.state.split(',');
        let state = false;
        let dim = 0;
        if (color[2] > 0) {
            state = true;
            dim = color[2];
        }
        opts.type = 'devices.types.light';
        opts.capabilities = [{
            type: 'devices.capabilities.on_off',
            retrievable: true,
            state: {
                instance: 'on',
                value: state
            }
        },
            {
                type: 'devices.capabilities.range',
                retrievable: true,

                parameters: {
                    instance: 'brightness',
                    unit: 'unit.percent',
                    range: {
                        min: 0,
                        max: 100,
                        precision: 1
                    }
                },
                state: {
                    instance: 'brightness',
                    value: dim,
                },
            },
            {
                type: 'devices.capabilities.color_setting',
                retrievable: true,
                parameters: {
                    color_model: 'hsv',
                    temperature_k: {
                        min: 2000,
                        max: 8500,
                        precision: 500,
                    }
                },
                state: {
                    instance: 'hsv',
                    value: {
                        h: color[0],
                        s: color[1],
                        v: color[2]
                    }
                },
            },
        ];
        return opts;
    }
}

async function loadDevices(user, url, rooms) {

    // Авторизация на API
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + base64.encode(user.username + ":" + user.password));

    // Загрузка Devices
    let ohdevices = [];
    await fetch(url, {method:'GET',
        headers: headers,})
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            //console.log(JSON.stringify(myJson));
            // Пока в загружаемых граппах оставляю только первую группу, где обычно указана комната
            // Если один то не массив, и надо его привести к массиву, или новую тему заводить.

            function run(item) {
                let roomname = item.groupNames[0];
                let room = 'Дом';
                rooms.forEach(function(item2, index, array) {
                    if (item2.name === roomname) {
                        room = item2.label;
                    }
                });
                //console.log(item.type);
                // Проверяю не лампа ли это?
                if (item.tags[0] === 'Lighting') item.type = 'Light';
                //console.log(item.type);
                ohdevices.push(
                    {
                        userId: user._id,
                        name: item.name,
                        label: item.label,
                        link: item.link,
                        state: item.state,
                        type: item.type,            // Light, Switch, Dimmer, Color
                        group: item.groupNames[0],
                        room: room
                    });
            }

            if (myJson[0]) {
                for (let item of myJson) {
                    run(item);
                }
            } else {
                run(myJson);
            }
            console.log('Devices: ' + ohdevices.length);
        });
    return ohdevices;
};

async function loadRooms(user) {
    // Rooms
    let urlRoom = config.openhab.host + '/rest/items?tags=Room&recursive=false&fields=name%2C%20label';

    // Авторизация на API
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + base64.encode(user.username + ":" + user.password));

    // Загрузка комнат
    let rooms = [];
    await fetch(urlRoom, {method:'GET',
        headers: headers,})
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            //console.log(JSON.stringify(myJson));
            for (let item of myJson) {
                // { hallway: 'Коридор' }
                //let name = item.name.toLowerCase();
                //rooms.push({ [name]: item.label });
                // Формат по умолчанию
                rooms.push({ name: item.name, label: item.label });
            }
            //console.log(rooms);
            return rooms;
        });
    console.log('Rooms: ' + rooms.length);

    return rooms;
}

function postState(userId, done) {
    // Отправка Json
    var url = 'https://example.com/profile';
    var data = {username: 'example'};

    fetch(url, {
        method: 'POST', // или 'PUT'
        body: JSON.stringify(data), // data может быть типа `string` или {object}!
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .then(response => console.log('Успех:', JSON.stringify(response)))
        .catch(error => console.error('Ошибка:', error));
};
