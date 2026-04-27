import { useState, useEffect } from "react";
import { API } from "../utils/api";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [overtime, setOvertime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(API.employees).then((r) => r.json()),
      fetch(API.overtime).then((r) => r.json()),
    ]).then(([empRes, otRes]) => {
      if (empRes.success) setEmployees(empRes.data);
      if (otRes.success) setOvertime(otRes.data);
      setLoading(false);
    });
  }, []);

  const totalSalary = employees.reduce((s, e) => s + (e.salary || 0), 0);
  const pendingOT = overtime.filter((o) => o.status === "pending").length;
  const approvedOT = overtime.filter((o) => o.status === "approved").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Site Overview — LabourForce HRMS</p>
        </div>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Workers</div>
                <div className="stat-value">{employees.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Monthly Payroll</div>
                <div className="stat-value">₹{(totalSalary / 1000).toFixed(0)}K</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">OT Pending</div>
                <div className="stat-value" style={{ color: "#fbbf24" }}>{pendingOT}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">OT Approved</div>
                <div className="stat-value" style={{ color: "#22c55e" }}>{approvedOT}</div>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Recent Overtime Entries
                </h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Designation</th>
                      <th>Date</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overtime.slice(0, 8).map((o) => (
                      <tr key={o._id}>
                        <td style={{ color: "var(--text)", fontWeight: 500 }}>
                          {o.employee?.name || "—"}
                        </td>
                        <td>{o.employee?.designation || "—"}</td>
                        <td>
                          {o.date
                            ? new Date(o.date).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                          {o.hours}h
                        </td>
                        <td>
                          <span className={`badge badge-${o.status}`}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                    {overtime.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text3)", padding: "32px" }}>
                          No overtime entries yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
