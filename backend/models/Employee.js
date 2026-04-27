const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    // LF-103: Designation dropdown field
    designation: {
      type: String,
      required: [true, "Designation is required"],
      enum: ["Mason", "Electrician", "Plumber", "Supervisor", "Helper"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      // LF-102: salary must be positive
      min: [1, "Salary must be a positive number"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
