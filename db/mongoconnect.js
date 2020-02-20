const config = require('../config');

/**
 * @param {System} system
 * @constructor
 */
// function MongoConnect(system) {
//    this.system = system;
// }

function MongoConnect() {}

/**
 * Takes the mongoose object and tries to connect it with the configured database of the system
 * object provided to the constructor of this object.
 *
 * The optional callback parameter can be used to pass a callback to the mongoose.connect function.
 *
 * @param mongoose
 * @param callback
 */
MongoConnect.prototype.connect = function(mongoose, callback) {
  if (typeof callback !== 'function') {
    callback = this.defaultCallback;
  }
  console.log(`Trying to connect to mongodb at: ${this.getMongoHostAndDatabase()}`);
  mongoose.connect(
    this.getMongoUri(),
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    callback,
  );
};

/**
 * The callback used in #connect, if no callback was provided.
 *
 * @param error
 * @private
 */
MongoConnect.prototype.defaultCallback = function(error) {
  if (error) {
    console.log(`Error while connecting to mongodb: ${error}`);
    console.log('Stopping openHAB-cloud due to error with mongodb');
  }

  console.log('Successfully connected to mongodb');
};

/**
 * Returns the connection string to use to connect to mongodb.
 *
 * @return {string}
 * @private
 */
MongoConnect.prototype.getMongoUri = function() {
  let mongoUri = 'mongodb://';

  // if (this.system.hasDbCredentials()){
  //      mongoUri += this.system.getDbUser() + ':' + this.system.getDbPass() + '@';
  // }

  mongoUri += config.mongodb.hosts;

  return `${mongoUri}/${config.mongodb.db}`;
};

/**
 * Returns the dbhost and database string used for the mongodb connection
 *
 * @return {string}
 * @private
 */
MongoConnect.prototype.getMongoHostAndDatabase = function() {
  let mongoUri = 'mongodb://';

  mongoUri += config.mongodb.hosts;

  return `${mongoUri}/${config.mongodb.db}`;
};

module.exports = MongoConnect;
