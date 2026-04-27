const express = require("express");
const router = express.Router();
const Overtime = require("../models/Overtime");
const Employee = require("../models/Employee");

// GET all overtime records (with employee details populated)
router.get("/", async (req, res) => {
  try {
    const records = await Overtime.find()
      .populate("employee", "name designation department")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create overtime entry
router.post("/", async (req, res) => {
  try {
    const { employeeId, date, hours, reason } = req.body;

    // --- Backend Validations ---
    const errors = [];

    if (!employeeId) errors.push("Please select a worker");
    if (!date) errors.push("Date is required");
    if (!hours && hours !== 0) errors.push("Overtime hours are required");
    if (!reason || !reason.trim()) errors.push("Reason is required");

    const parsedHours = Number(hours);
    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date) {
      if (parsedDate > today) {
        errors.push("Date cannot be in the future");
      }
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      if (parsedDate < sevenDaysAgo) {
        errors.push("Date cannot be more than 7 days in the past");
      }
    }

    if (hours !== undefined && hours !== "") {
      if (parsedHours < 1 || parsedHours > 6) {
        errors.push("Overtime hours must be between 1 and 6");
      }
    }

    if (reason && reason.trim().length < 10) {
      errors.push("Reason must be at least 10 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    // Worker must exist in system
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Worker not found in the system" });
    }

    // No duplicate entry for same worker + same date
    const entryDate = new Date(date);
    const dayStart = new Date(entryDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(entryDate);
    dayEnd.setHours(23, 59, 59, 999);

    const duplicate = await Overtime.findOne({
      employee: employeeId,
      date: { $gte: dayStart, $lte: dayEnd },
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Overtime entry for ${employee.name} on this date already exists`,
      });
    }

    // Monthly cap: total monthly overtime cannot exceed 60 hours
    const monthStart = new Date(entryDate.getFullYear(), entryDate.getMonth(), 1);
    const monthEnd = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyRecords = await Overtime.find({
      employee: employeeId,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    const totalMonthlyHours = monthlyRecords.reduce((sum, r) => sum + r.hours, 0);

    if (totalMonthlyHours + parsedHours > 60) {
      const remaining = 60 - totalMonthlyHours;
      return res.status(400).json({
        success: false,
        message: `Monthly overtime limit of 60 hours would be exceeded. ${employee.name} has already logged ${totalMonthlyHours} hours this month. Only ${remaining} hours remaining.`,
      });
    }

    const overtime = await Overtime.create({
      employee: employeeId,
      date: entryDate,
      hours: parsedHours,
      reason: reason.trim(),
    });

    await overtime.populate("employee", "name designation department");

    res.status(201).json({
      success: true,
      data: overtime,
      message: "Overtime entry logged successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// PATCH update overtime status (approve/reject)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const record = await Overtime.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("employee", "name designation department");

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    res.json({ success: true, data: record, message: `Overtime ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE overtime entry
router.delete("/:id", async (req, res) => {
  try {
    const record = await Overtime.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    res.json({ success: true, message: "Overtime entry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
