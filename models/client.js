// Схема клиента. Клиент это каждый новый диалог умного дома в Yandex.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
    name: String,                               // Random name
    yClientId: {type: String, unique: true},    // Yandex Client ID
    clientSecret: String,                       // Yandex Client password
    isTrusted: { type: Boolean, default: false}, // Авто выдача токена этому клиенту, без user
    valid: { type: Boolean, default: true},     // Is this client is active?
    created: { type: Date, default: Date.now }  // When client was created
});

ClientSchema.index({yClientId: 1}, { unique: true }); // to find client by yClientId

module.exports = mongoose.model('Client', ClientSchema);
