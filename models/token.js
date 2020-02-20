// Схема токена. Привязана к Client.
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var TokenSchema = new Schema({
  token: String, // token and id
  type: String, // type is token
  userId: { type: ObjectId, ref: 'User' }, // id from user
  clientId: { type: ObjectId, ref: 'Client' }, // id from client
  valid: { type: Boolean, default: true }, // Is this token is active?
  created: { type: Date, default: Date.now } // When token was created
});

TokenSchema.index({ token: 1 }, { unique: false }); // to find token by token
TokenSchema.index({ clientId: 1, userId: 1 }, { unique: false }); // to find token by user and client
TokenSchema.index({ userId: 1 }, { unique: false }); // to find token by user

module.exports = mongoose.model('Token', TokenSchema);
