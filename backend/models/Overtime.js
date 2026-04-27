const mongoose = require("mongoose");

const overtimeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    hours: {
      type: Number,
      required: [true, "Overtime hours are required"],
      min: [1, "Minimum 1 hour of overtime"],
      max: [6, "Maximum 6 hours of overtime per day (company policy)"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      minlength: [10, "Reason must be at least 10 characters"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Overtime", overtimeSchema);
