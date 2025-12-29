require("dotenv").config({ path: ".env.test" });
const mongoose = require("mongoose");
const { connectDB } = require("../db/mongo"); // <-- Your file

beforeAll(async () => {
  await connectDB();  // uses MONGO_URL from .env.test
});

afterEach(async () => {
  // Clean test DB between tests
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // optional but clean
  await mongoose.connection.close();
});
