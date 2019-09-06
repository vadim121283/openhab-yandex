// Модель Устройства Yandex не схема мангуста
class device {
    constructor(options) {
        this.data = {
            id: options.id,
            name: options.name || 'Без названия',
            description: options.description || '',
            room: options.room || '',
            type: options.type || 'devices.types.light',
            custom_data: options.custom_data,
            capabilities: options.capabilities,
        };
        // global.devices.push(this);
    }

    getInfo() {
        return this.data;
    };
}

module.exports = device;
