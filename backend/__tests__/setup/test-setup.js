const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(30000);

let mongo;

// --- Mock noisy or side-effectful middlewares to pure no-ops in tests ---
jest.mock('morgan', () => () => (req, res, next) => next());
jest.mock('helmet', () => () => (req, res, next) => next());
jest.mock('compression', () => () => (req, res, next) => next());
jest.mock('xss-clean', () => () => (req, res, next) => next());

beforeAll(async () => {
  // Start in-memory Mongo and expose URL for app/db module
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGO_URL = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  process.env.NODE_ENV = 'test';

  // Connect mongoose explicitly (app.js skips connect in test)
  await mongoose.connect(uri);

  // Silence noisy logs
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  try {
    // Disconnect primary connection
    await mongoose.disconnect();

    // Close any remaining connections forcefully
    if (mongoose.connections && mongoose.connections.length) {
      await Promise.all(
        mongoose.connections.map((c) => c && c.readyState !== 0 ? c.close(true).catch(() => {}) : Promise.resolve())
      );
    }

    // Remove listeners that could keep event loop alive
    mongoose.connection.removeAllListeners('connected');
    mongoose.connection.removeAllListeners('disconnected');
    mongoose.connection.removeAllListeners('error');

    // Stop in-memory server
    if (mongo) await mongo.stop();
  } finally {
    // Ensure mocks/timers are restored
    jest.useRealTimers();
    jest.restoreAllMocks && jest.restoreAllMocks();
  }
});

// Note: Do NOT force process.exit here — this file runs per test suite via setupFilesAfterEnv.
// Use Jest CLI flag --forceExit instead if you need to force termination in CI.
