// Схема клиента. Клиент это каждый новый диалог умного дома в Yandex.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var ClientSchema = new Schema({
    id: ObjectId,
    name: String,                               // Random name
    yClientId: String,                          // Yandex Client ID
    clientSecret: String,                       // Yandex Client password
    valid: { type: Boolean, default: true},     // Is this client is active?
    created: { type: Date, default: Date.now }  // When client was created
});

ClientSchema.index({id: 1}, { unique: true }); // to find client by id
ClientSchema.index({yClientId: 1}, { unique: false }); // to find client by yClientId

module.exports = mongoose.model('Client', ClientSchema);
