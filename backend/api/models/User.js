const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: false, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["teacher", "student", "admin"] },
  lastLogin: { type: Date, default: null },
  // courses the user is enrolled in
  courseIDs: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
