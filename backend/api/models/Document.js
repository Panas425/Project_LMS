const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },          // UUID
  name: { type: String, required: true },         // original file name or custom name
  fileUrl: { type: String, required: true },     // relative or absolute path
  uploadedAt: { type: Date, default: Date.now }  // timestamp
});

module.exports = DocumentSchema; // export as schema, not model
