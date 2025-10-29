const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
let MongoMemoryServer; // lazy-loaded only if needed

jest.setTimeout(30000);

let mongo;
let usedExternalMongo = false;

// --- Mock noisy or side-effectful middlewares to pure no-ops in tests ---
jest.mock("morgan", () => () => (req, res, next) => next());
jest.mock("helmet", () => () => (req, res, next) => next());
jest.mock("compression", () => () => (req, res, next) => next());
jest.mock("xss-clean", () => () => (req, res, next) => next());

beforeAll(async () => {
  // Load backend/.env.test if present (e.g., CI with external Mongo service)
  try {
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env.test") });
  } catch (_) {}

  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
  process.env.NODE_ENV = "test";

  // Detect Alpine to avoid mongodb-memory-server (unsupported)
  const isAlpine = (() => {
    try {
      const osRelease = fs.readFileSync("/etc/os-release", "utf8");
      return /ID=alpine/.test(osRelease);
    } catch (e) {
      return false;
    }
  })();

  const externalUrl = process.env.MONGO_URL || process.env.TEST_MONGO_URL;

  if (externalUrl) {
    usedExternalMongo = true;
    await mongoose.connect(externalUrl);
  } else if (!isAlpine && process.env.DISABLE_MMS !== "1") {
    // Use in-memory Mongo only when supported and not explicitly disabled
    try {
      ({ MongoMemoryServer } = require("mongodb-memory-server"));
      mongo = await MongoMemoryServer.create();
      const uri = mongo.getUri();
      process.env.MONGO_URL = uri;
      await mongoose.connect(uri);
    } catch (err) {
      // Graceful fallback with guidance
      console.warn(
        `MongoMemoryServer unavailable (${err?.message}). Set MONGO_URL to an external MongoDB in CI.`
      );
      // Avoid long buffering timeouts if no DB gets connected later
      mongoose.set("bufferTimeoutMS", 0);
    }
  } else {
    // Alpine or explicitly disabled; rely on external Mongo via MONGO_URL
    console.warn(
      "mongodb-memory-server disabled (alpine or DISABLE_MMS=1). Provide MONGO_URL for tests."
    );
    mongoose.set("bufferTimeoutMS", 0);
  }

  // Silence noisy logs
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { collections } = mongoose.connection;
      for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
      }
    }
  } catch (_) {}
});

afterAll(async () => {
  try {
    // Disconnect primary connection
    await mongoose.disconnect();

    // Close any remaining connections forcefully
    if (mongoose.connections && mongoose.connections.length) {
      await Promise.all(
        mongoose.connections.map((c) =>
          c && c.readyState !== 0
            ? c.close(true).catch(() => {})
            : Promise.resolve()
        )
      );
    }

    // Remove listeners that could keep event loop alive
    mongoose.connection.removeAllListeners("connected");
    mongoose.connection.removeAllListeners("disconnected");
    mongoose.connection.removeAllListeners("error");

    // Stop in-memory server
    if (mongo && typeof mongo.stop === "function") await mongo.stop();
  } finally {
    // Ensure mocks/timers are restored
    jest.useRealTimers();
    jest.restoreAllMocks && jest.restoreAllMocks();
  }
});
