// Схема токена. Привязана к Client.
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const TokenSchema = new Schema({
  token: String, // token and id
  type: String, // type is token
  userId: { type: ObjectId, ref: 'User' }, // id from user
  clientId: { type: ObjectId, ref: 'Client' }, // id from client
  valid: { type: Boolean, default: true }, // Is this token is active?
  created: { type: Date, default: Date.now }, // When token was created
});

// to find token by token
TokenSchema.index({ token: 1 }, { unique: false });
// to find token by user and client
TokenSchema.index({ clientId: 1, userId: 1 }, { unique: false });
// to find token by user
TokenSchema.index({ userId: 1 }, { unique: false });

module.exports = mongoose.model('Token', TokenSchema);
