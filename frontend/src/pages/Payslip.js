import { useState, useEffect } from "react";
import { API } from "../utils/api";
import { formatDate } from "../utils/dateFormat";

export default function Payslip() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API.employees)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEmployees(res.data);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => window.print();

  // LF-101: All dates formatted as DD/MM/YYYY
  const currentMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  // DD/MM/YYYY for payslip issue date
  const issueDate = formatDate(new Date().toISOString());

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Payslip</h2>
          <p>Generate payslip for any worker</p>
        </div>
        {selected && (
          <button className="btn btn-primary" onClick={handlePrint}>🖨 Print Payslip</button>
        )}
      </div>

      <div className="page-body">
        <div style={{ marginBottom: "20px", maxWidth: "360px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)" }}>
            Select Worker
          </label>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <select
              value={selected?._id || ""}
              onChange={(e) => {
                const emp = employees.find((em) => em._id === e.target.value);
                setSelected(emp || null);
              }}
            >
              <option value="">— Select Employee —</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.designation})
                </option>
              ))}
            </select>
          )}
        </div>

        {selected && (
          <div className="card" style={{ maxWidth: "680px" }} id="payslip-doc">
            {/* Payslip Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: "22px", color: "var(--accent)", letterSpacing: "0.08em" }}>
                    LABOURFORCE HRMS
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
                    Construction Workforce Management
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "11px", textTransform: "uppercase", color: "var(--text3)", letterSpacing: "0.08em" }}>
                    Pay Period
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text)", marginTop: "2px" }}>{currentMonth}</div>
                  {/* LF-101: Issue date in DD/MM/YYYY */}
                  <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                    Issued: {issueDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Details */}
            <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  ["Worker Name", selected.name],
                  ["Designation", selected.designation],
                  ["Department", selected.department],
                  ["Email", selected.email],
                  /* LF-101: Joining date in DD/MM/YYYY */
                  ["Joining Date", formatDate(selected.joiningDate)],
                  ["Phone", selected.phone || "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", fontWeight: 700 }}>
                      {label}
                    </div>
                    <div style={{ marginTop: "3px", color: "var(--text)", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Breakdown */}
            <div style={{ padding: "20px 28px" }}>
              <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", marginBottom: "14px" }}>
                Salary Breakdown
              </h4>
              <table style={{ minWidth: "unset" }}>
                <tbody>
                  {[
                    ["Basic Salary", Math.round(selected.salary * 0.5)],
                    ["HRA", Math.round(selected.salary * 0.2)],
                    ["Transport Allowance", Math.round(selected.salary * 0.1)],
                    ["Special Allowance", Math.round(selected.salary * 0.2)],
                  ].map(([comp, amount]) => (
                    <tr key={comp}>
                      <td style={{ color: "var(--text2)", border: "none", padding: "7px 0" }}>{comp}</td>
                      <td style={{ color: "var(--text)", textAlign: "right", border: "none", padding: "7px 0", fontWeight: 500 }}>
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} style={{ border: "none", borderTop: "1px solid var(--border)", padding: "12px 0 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Net Salary
                        </span>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--accent)" }}>
                          ₹{selected.salary.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!selected && !loading && (
          <div className="empty-state">
            <p>Select a worker from the dropdown to generate their payslip</p>
          </div>
        )}
      </div>
    </div>
  );
}
