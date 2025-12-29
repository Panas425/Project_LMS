require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./db/mongo");
const seedAdmin = require("./seeds/seedAdmin");

async function startServer() {
  try {
    await connectDB();
    await seedAdmin();

    const PORT = process.env.PORT || 3005;
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
