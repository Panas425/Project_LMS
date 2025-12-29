const mongoose = require("mongoose");

const ActivityDocumentSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },        // UUID
  name: { type: String, required: true },        // Original file name or custom name
  fileUrl: { type: String, required: true },     // Relative or absolute path
  fileType: { type: String },                    // Optional: pdf, docx, etc.
  uploadedBy: { type: String },                  // Optional: userId of uploader
  uploadedAt: { type: Date, default: Date.now }  // Timestamp
});

module.exports = ActivityDocumentSchema; // subdocument schema
