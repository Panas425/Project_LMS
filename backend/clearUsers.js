const mongoose = require("mongoose");
const User = require("./api/models/User"); // adjust path if needed
require("dotenv").config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Drop the old unique index on userName
    await User.collection.dropIndex("userName_1");
    console.log("✅ Dropped old userName index");

    await mongoose.connection.close();
    console.log("✅ Connection closed");
  } catch (err) {
    if (err.codeName === "IndexNotFound") {
      console.log("⚠️ Index not found, nothing to drop");
    } else {
      console.error("❌ Error dropping index:", err);
    }
    process.exit(1);
  }
}

dropIndex();