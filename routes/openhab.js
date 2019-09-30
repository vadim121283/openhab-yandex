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

module.exports.getDevices = async function (user) {

    let devices = [];
    let urlLight = config.openhab.host + '/rest/items?tags=Lighting&recursive=false';
    let urlSwitch = config.openhab.host + '/rest/items?tags=Switchable&recursive=false';

    let rooms = await loadRooms(user);

    await loadDevices(user, urlLight, rooms).then((ohdevices) => {
        ohdevices.forEach(function(item, index, array) {
            // Создаем объек по шаблону Яндекс и суем в массив devices
            let opts = createDevice(item, user);
            devices.push(new device(opts));
        });
        //console.log('First device: ' + devices[0].data.name);
    });

    await loadDevices(user, urlSwitch, rooms).then((ohdevices) => {
        ohdevices.forEach(function(item, index, array) {
            // Создаем объек по шаблону Яндекс и суем в массив devices
            let opts = createDevice(item, user);
            devices.push(new device(opts));
        });
        //console.log('First device: ' + devices[0].data.name);
    });

    return devices;
};

module.exports.setDevices = async function (user, sdevices) {
    // Перечисляем устройства в массиве и по очереди отправляем запрос на API
    // Обычно это один объект, но может быть несколько если команда по комнате
    await asyncForEach(sdevices, async (item) => {
        let url = item.custom_data.openhab.link;

        // Определить что нужно сделать в капабилитис
        // Пока делаем только on, range, color
        // Сколько в капабилитис объектов
        let count = item.capabilities.length; // Их несколько - цикл сбора всех

        // Формирование body
        // ON, OFF, Color - {0,100,100}, Range - 0-100
        let data = 'OFF';
        let indx = 0;

        // Цикл капабилитис
        if (count >= 1) {
            // Много капабилитис
            for (let i = 0; i < item.capabilities.length; i++) {
                // case
                let off = false;
                switch (item.capabilities[i].state.instance) {
                    case 'on':
                        // ВКЛ ВЫКЛ Если устройство выключить, то остальное и не смотрим
                        if (item.capabilities[i].state.value === false) {
                            data = 'OFF';
                            off = true;
                        }
                        if (item.capabilities[i].state.value === true) {
                            data = 'ON';
                        }
                        indx = i;
                        break;
                    case 'brightness':
                        if (!off) {
                            data = item.capabilities[i].state.value;
                        }
                        indx = i;
                        break;
                    case 'temperature':
                    case 'volume':
                    case 'channel':
                    case 'hsv':
                        if (!off) data = (item.capabilities[i].state.value.h + ',' + item.capabilities[i].state.value.s + ',' + item.capabilities[i].state.value.v);
                        indx = i;
                        break;
                    default:
                        // todo Все что не нашлось, отдать ошибкой.
                        console.log('Instance not found');
                };
            }
        } else if (count === -1) {
            // Нет капабилитис, возврат с ошибкой
            console.log('Capabilities not found');
        }

        //console.log('Data: ' + JSON.stringify(data));

        // Отправка Json команды на openHAB
        // Авторизация на API
        let headers = {
            'Authorization': 'Basic ' + base64.encode(user.username + ":" + user.password),
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
        };

        await fetch(url, {
            method: 'POST', // или 'PUT'
            body: data.toString(), // data может быть типа `string` или {object}!
            headers: headers,
        }).then(function (res) {
            console.log(res.status);
            if (res.status === 200) {
                // Успешно - сформировать объект этого устройства для отправки с DONE
                // 200 - OK, 400 - Item command null, 404 - Item not found
                item.capabilities[indx].state.action_result = { 'status': 'DONE' };
            } else if (res.status === 400) {
                item.capabilities[indx].state.action_result =
                    {
                        "status": "ERROR",
                        "error_code": "INVALID_ACTION",
                        "error_message": "Ошибка выполнения команды"
                    };
            } else if (res.status === 404) {
                item.capabilities[indx].state.action_result =
                    {
                        "status": "ERROR",
                        "error_code": "INVALID_ACTION",
                        "error_message": "Устройство не найдено"
                    };
            }
            return res.json();
        }).then(function(response) {
               // Тела не будет
            })
            .catch(function(error) {
                // Тела не будет
            });
        console.log(JSON.stringify(item.capabilities[indx].state.action_result));
        // Выйти из цикла
    });
    // Отправляем обратно массив с результатами
    return sdevices;
};

module.exports.getDevicesQuery = async function (user, qdevices) {
    // Авторизация на API
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + base64.encode(user.username + ":" + user.password));

    let devices = [];

    let rooms = await loadRooms(user);

    await asyncForEach(qdevices, async (item) => {
        let url = item.custom_data.openhab.link;
        await loadDevices(user, url, rooms).then((ohdevices) => {
            ohdevices.forEach(function(item, index, array) {
                // Создаем объек по шаблону Яндекс и суем в массив devices
                let opts = createDevice(item, user);
                devices.push(new device(opts));
            });
            console.log('Action device done: ' + devices[0].data.name);
        });
    });
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
        //console.log('Light CD');
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
        //console.log('Switch CD');
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
        //console.log('Dimmer CD');
        let state = false;
        let dim = 0;
        if (item.state > 0) {
            state = true;
            dim = parseInt(item.state);
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
                    random_access: true,
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
        //console.log('Color CD');
        let color = item.state.split(',');
        let state = false;
        let dim = 0;
        if (color[2] > 0) {
            state = true;
            dim = parseInt(color[2]);
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
                        h: parseInt(color[0]),
                        s: parseInt(color[1]),
                        v: parseInt(color[2])
                    }
                },
            },
        ];
        console.log(opts);
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
                if (item.tags[0] === 'Lighting' && item.type === 'Switch') item.type = 'Light';
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
                rooms.push({ name: item.name, label: item.label });
            }
            //console.log(rooms);
            return rooms;
        });
    console.log('Rooms: ' + rooms.length);

    return rooms;
}
