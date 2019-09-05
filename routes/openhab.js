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
    await loadFromAPI(user).then((ohdevices) => {
        // Тут сделать перевод на яндекс устройства
        //console.log(ohdevices[0]);

        ohdevices.forEach(function(item, index, array) {
            // Создаем объек по шаблону Яндекс и суем в массив devices
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
                devices.push(new device(opts));
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
                devices.push(new device(opts));
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
                devices.push(new device(opts));
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
                            value: item.state
                        },
                    },
                ];
                devices.push(new device(opts));
            }
        });
        //console.log(global.devices2[0].data.capabilities);
        //console.log('Devices in arr: ' + devices.length);
        console.log('First device: ' + devices[0].data.name);
        //global.devices2.forEach(function(item, index, array) {
        //    console.log(item.data.capabilities[0].state);
        //});
    });
    return devices;
};

async function loadFromAPI(user) {
    // Rooms
    let urlRoom = config.openhab.host + '/rest/items?tags=Room&recursive=false&fields=name%2C%20label';
    let urlLight = config.openhab.host + '/rest/items?tags=Lighting&recursive=false';
    let urlSwitch = config.openhab.host + '/rest/items?tags=Switchable&recursive=false';

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

    // Загрузка Lights
    let ohdevices = [];
    await fetch(urlLight, {method:'GET',
        headers: headers,})
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            //console.log(JSON.stringify(myJson));
            // Пока в загружаемых граппах оставляю только первую группу, где обычно указана комната
            for (let item of myJson) {

                let roomname = item.groupNames[0];
                let room = 'Дом';
                rooms.forEach(function(item2, index, array) {
                    if (item2.name === roomname) {
                        room = item2.label;
                    }
                });
                //console.log(item.type);
                if (item.type === 'Switch') item.type = 'Light';
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
            console.log('Lights: ' + ohdevices.length);
        });

    // Загрузка Switchs
    await fetch(urlSwitch, {method:'GET',
        headers: headers,})
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            //console.log(JSON.stringify(myJson));
            // Пока в загружаемых граппах оставляю только первую группу, где обычно указана комната
            for (let item of myJson) {

                let roomname = item.groupNames[0];
                let room = 'Дом';
                rooms.forEach(function(item2, index, array) {
                    if (item2.name === roomname) {
                        room = item2.label;
                    }
                });

                ohdevices.push(
                    {
                        userId: user._id,
                        name: item.name,
                        label: item.label,
                        link: item.link,
                        state: item.state,
                        type: item.type,
                        group: item.groupNames[0]
                    });
            }
            console.log('Devices: ' + ohdevices.length);
            //console.log(ohdevices[0]);
        });
    return ohdevices;
};

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
