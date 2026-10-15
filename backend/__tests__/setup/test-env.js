// Jest loads setupFiles before test files and the modules they import.
// Keep this value test-only: utils/jwt.js remains strict in every other environment.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-jwt-secret";
