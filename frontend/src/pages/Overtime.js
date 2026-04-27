import { useState, useEffect } from "react";
import { API } from "../utils/api";
import { formatDate } from "../utils/dateFormat";

export default function Overtime() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = { employeeId: "", date: "", hours: "", reason: "" };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch(API.overtime).then((r) => r.json()),
      fetch(API.employees).then((r) => r.json()),
    ]).then(([otRes, empRes]) => {
      if (otRes.success) setRecords(otRes.data);
      if (empRes.success) setEmployees(empRes.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAll(); }, []);

  // Frontend validation
  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = "Please select a worker";
    if (!form.date) {
      e.date = "Date is required";
    } else {
      const selected = new Date(form.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      if (selected > today) e.date = "Date cannot be in the future";
      else if (selected < sevenDaysAgo) e.date = "Date cannot be more than 7 days in the past";
    }
    if (!form.hours && form.hours !== 0) {
      e.hours = "Overtime hours are required";
    } else {
      const h = Number(form.hours);
      if (h < 1 || h > 6) e.hours = "Overtime hours must be between 1 and 6";
    }
    if (!form.reason.trim()) {
      e.reason = "Reason is required";
    } else if (form.reason.trim().length < 10) {
      e.reason = "Reason must be at least 10 characters";
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
    setApiError("");
    setApiSuccess("");
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      const res = await fetch(API.overtime, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: form.employeeId,
          date: form.date,
          hours: Number(form.hours),
          reason: form.reason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApiSuccess("Overtime entry logged successfully!");
        setForm(emptyForm);
        setErrors({});
        setShowForm(false);
        fetchAll();
      } else {
        setApiError(data.message || "Failed to log overtime");
      }
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    const res = await fetch(`${API.overtime}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) fetchAll();
    else alert(data.message);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this overtime entry?")) return;
    const res = await fetch(`${API.overtime}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchAll();
  };

  // Today's date as max for date input
  const todayStr = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 7);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Overtime Entries</h2>
          <p>Site Manager OT Logging — Max 6h/day, 60h/month</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setApiError(""); setApiSuccess(""); setErrors({}); setForm(emptyForm); }}>
          {showForm ? "✕ Cancel" : "+ Log Overtime"}
        </button>
      </div>

      <div className="page-body">
        {/* Overtime Entry Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: "20px" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                New Overtime Entry
              </h3>
            </div>
            <div style={{ padding: "20px" }}>
              {apiError && <div className="alert alert-error">⚠ {apiError}</div>}
              {apiSuccess && <div className="alert alert-success">✓ {apiSuccess}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label>Select Worker *</label>
                  <select
                    className={errors.employeeId ? "error" : ""}
                    value={form.employeeId}
                    onChange={handleChange("employeeId")}
                  >
                    <option value="">— Select Worker —</option>
                   
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.name} ({e.designation})
                      </option>
                    ))}
                  </select>
                  {errors.employeeId && <span className="field-error">{errors.employeeId}</span>}
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    className={errors.date ? "error" : ""}
                    value={form.date}
                    min={minDateStr}
                    max={todayStr}
                    onChange={handleChange("date")}
                  />
                  {errors.date && <span className="field-error">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label>Overtime Hours * (1–6 max)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    step="0.5"
                    className={errors.hours ? "error" : ""}
                    value={form.hours}
                    onChange={handleChange("hours")}
                    placeholder="e.g. 3"
                  />
                  {errors.hours && <span className="field-error">{errors.hours}</span>}
                </div>

                <div className="form-group full">
                  <label>Reason * (min 10 characters)</label>
                  <textarea
                    className={errors.reason ? "error" : ""}
                    value={form.reason}
                    onChange={handleChange("reason")}
                    placeholder="Describe why overtime was required for this worker..."
                    rows={3}
                  />
                  <span style={{ fontSize: "11px", color: form.reason.length < 10 ? "var(--text3)" : "var(--success)" }}>
                    {form.reason.length} / 10 characters minimum
                  </span>
                  {errors.reason && <span className="field-error">{errors.reason}</span>}
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Overtime"}
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowForm(false); setErrors({}); setApiError(""); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overtime Records Table */}
        <div className="card">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading">Loading records...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Designation</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <p>No overtime entries yet. Click + Log Overtime to add one.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r._id}>
                        <td style={{ color: "var(--text)", fontWeight: 600 }}>
                          {r.employee?.name || "—"}
                        </td>
                        <td>{r.employee?.designation || "—"}</td>
                        {/* LF-101: DD/MM/YYYY format */}
                        <td>{formatDate(r.date)}</td>
                        <td style={{ color: "var(--accent)", fontWeight: 700 }}>{r.hours}h</td>
                        <td style={{ maxWidth: "220px", fontSize: "12px", color: "var(--text2)" }}>
                          {r.reason}
                        </td>
                        <td>
                          <span className={`badge badge-${r.status}`}>{r.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {r.status === "pending" && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(r._id, "approved")}>✓</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(r._id, "rejected")}>✗</button>
                              </>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
