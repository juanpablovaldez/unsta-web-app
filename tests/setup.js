'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

module.exports = async function globalSetup() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  global.__MONGOD__ = mongod;
};
