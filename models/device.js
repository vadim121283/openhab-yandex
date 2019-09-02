// Схема Устройства Yandex.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var DeviceSchema = new Schema({
    _id: ObjectId,
    name: String,                               // Random name Ru
    room: String,                               // Room name Ru
    type: String,   // Yandex Device Type devices.types.light
    openhab: [
        {
            user: {type: ObjectId, ref: 'User'},
            name: {type: String, ref: 'Item'},
        }
    ],
    capabilities: [
        {
            type: 'devices.capabilities.on_off',
            retrievable: true,
            state: {
                instance: 'on',
                value: true
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
                value: 10,
            },
        },
        {
            type: 'devices.capabilities.color_setting',
            retrievable: true,
            parameters: {
                color_model: 'rgb',
                temperature_k: {
                    min: 2000,
                    max: 8500,
                    precision: 500,
                }
            },
            state: {
                instance: 'rgb',
                value: 0
            },
        },
    ],
    valid: { type: Boolean, default: true},     // Is this client is active?
    created: { type: Date, default: Date.now }  // When client was created
});

DeviceSchema.index({yDeviceId: 1}, { unique: false }); // to find client by yDeviceId

module.exports = mongoose.model('Device', DeviceSchema);
