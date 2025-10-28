const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.test" });

beforeAll(async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL must be defined in .env.test");
  }

  await mongoose.connect(process.env.MONGO_URL);

  // Silence des logs pendant les tests
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
