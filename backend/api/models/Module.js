const mongoose = require("mongoose");
const ActivitySchema = require("./Activity");

const ModuleSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  description: String,
  start: Date,
  end: Date,
  activities: { type: [ActivitySchema], default: [] }
}, { timestamps: true });

module.exports = ModuleSchema;
