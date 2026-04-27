const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

const DESIGNATIONS = ["Mason", "Electrician", "Plumber", "Supervisor", "Helper"];

// GET all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create employee
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate } = req.body;

    // Backend validations
    const errors = [];

    if (!name || !name.trim()) errors.push("Name is required");
    if (!email || !email.trim()) errors.push("Email is required");
    if (!department || !department.trim()) errors.push("Department is required");
    if (!designation) errors.push("Designation is required");
    if (!joiningDate) errors.push("Joining date is required");

    // LF-102: salary must be positive
    if (salary === undefined || salary === null || salary === "") {
      errors.push("Salary is required");
    } else if (Number(salary) <= 0) {
      errors.push("Salary must be a positive number");
    }

    // LF-103: designation must be from allowed list
    if (designation && !DESIGNATIONS.includes(designation)) {
      errors.push("Invalid designation");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    // Check duplicate email
    const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Employee with this email already exists" });
    }

    const employee = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      department: department.trim(),
      designation,
      salary: Number(salary),
      joiningDate,
    });

    res.status(201).json({ success: true, data: employee, message: "Employee created successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// PUT update employee
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate } = req.body;

    const errors = [];

    if (!name || !name.trim()) errors.push("Name is required");
    if (!email || !email.trim()) errors.push("Email is required");
    if (!department || !department.trim()) errors.push("Department is required");
    if (!designation) errors.push("Designation is required");

    // LF-102: salary must be positive
    if (salary === undefined || salary === null || salary === "") {
      errors.push("Salary is required");
    } else if (Number(salary) <= 0) {
      errors.push("Salary must be a positive number");
    }

    if (designation && !DESIGNATIONS.includes(designation)) {
      errors.push("Invalid designation");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), email: email.toLowerCase().trim(), phone, department: department.trim(), designation, salary: Number(salary), joiningDate },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, data: employee, message: "Employee updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// DELETE employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
