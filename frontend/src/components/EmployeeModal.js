import { useState, useEffect } from "react";
import { API } from "../utils/api";
import { toInputDate } from "../utils/dateFormat";

const DESIGNATIONS = ["Mason", "Electrician", "Plumber", "Supervisor", "Helper"];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  joiningDate: "",
};

export default function EmployeeModal({ employee, onClose, onSaved }) {
  const isEdit = !!employee;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "",
        salary: employee.salary || "",
        joiningDate: toInputDate(employee.joiningDate) || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setApiError("");
  }, [employee]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.department.trim()) e.department = "Department is required";
    if (!form.designation) e.designation = "Designation is required";
    if (!form.joiningDate) e.joiningDate = "Joining date is required";
    // LF-102: salary must be a positive number
    if (!form.salary && form.salary !== 0) {
      e.salary = "Salary is required";
    } else if (Number(form.salary) <= 0) {
      e.salary = "Salary must be a positive number";
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
    setApiError("");
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError("");

    try {
      const url = isEdit ? `${API.employees}/${employee._id}` : API.employees;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setApiError(data.message || "Something went wrong");
      }
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Worker" : "Add New Worker"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {apiError && (
            <div className="alert alert-error">⚠ {apiError}</div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                className={errors.name ? "error" : ""}
                value={form.name}
                onChange={handleChange("name")}
                placeholder="e.g. Ramesh Kumar"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                className={errors.email ? "error" : ""}
                value={form.email}
                onChange={handleChange("email")}
                placeholder="e.g. ramesh@site.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <input
                className={errors.department ? "error" : ""}
                value={form.department}
                onChange={handleChange("department")}
                placeholder="e.g. Civil, Electrical"
              />
              {errors.department && <span className="field-error">{errors.department}</span>}
            </div>

            {/* LF-103: Designation dropdown */}
            <div className="form-group">
              <label>Designation *</label>
              <select
                className={errors.designation ? "error" : ""}
                value={form.designation}
                onChange={handleChange("designation")}
              >
                <option value="">— Select Designation —</option>
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.designation && <span className="field-error">{errors.designation}</span>}
            </div>

            {/* LF-102: Salary must be positive */}
            <div className="form-group">
              <label>Monthly Salary (₹) *</label>
              <input
                type="number"
                min="1"
                className={errors.salary ? "error" : ""}
                value={form.salary}
                onChange={handleChange("salary")}
                placeholder="e.g. 18000"
              />
              {errors.salary && <span className="field-error">{errors.salary}</span>}
            </div>

            <div className="form-group full">
              <label>Joining Date *</label>
              <input
                type="date"
                className={errors.joiningDate ? "error" : ""}
                value={form.joiningDate}
                onChange={handleChange("joiningDate")}
              />
              {errors.joiningDate && <span className="field-error">{errors.joiningDate}</span>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Worker"}
          </button>
        </div>
      </div>
    </div>
  );
}
