// Схема пользователя. Пользователь зарегистрированный в openHAB cloud
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var UserSchema = new Schema({
    id: ObjectId,
    username: {type: String, unique: true},     // openHAB cloud username
    password: String,                           // Password openHAB cloud user
    valid: { type: Boolean, default: true},     // Is this client is active?
    created: { type: Date, default: Date.now }  // When client was created
});

UserSchema.index({id: 1}, { unique: true }); // to find user by id
UserSchema.index({username: 1}, { unique: false }); // to find user by username

module.exports = mongoose.model('User', UserSchema);
