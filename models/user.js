// Схема пользователя. Пользователь зарегистрированный в openHAB cloud
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const UserSchema = new Schema({
  _id: ObjectId,
  username: { type: String, unique: true }, // openHAB cloud username
  password: String, // Password openHAB cloud user
  name: String, // Name
  ohValid: { type: Boolean, default: false }, // openHAB cloud username and pass is valid?
  valid: { type: Boolean, default: true }, // Is this user is active?
  created: { type: Date, default: Date.now }, // When client was created
});

UserSchema.index({ username: 1 }, { unique: false }); // to find user by username

module.exports = mongoose.model('User', UserSchema);
