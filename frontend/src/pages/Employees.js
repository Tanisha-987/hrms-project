import { useState, useEffect } from "react";
import { API } from "../utils/api";
import { formatDate } from "../utils/dateFormat";
import { exportToCSV } from "../utils/csvExport";
import EmployeeModal from "../components/EmployeeModal";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [search, setSearch] = useState("");

  const fetchEmployees = () => {
    setLoading(true);
    fetch(API.employees)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEmployees(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    const res = await fetch(`${API.employees}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchEmployees();
    else alert(data.message);
  };

  const openAdd = () => { setEditEmployee(null); setShowModal(true); };
  const openEdit = (emp) => { setEditEmployee(emp); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditEmployee(null); };
  const onSaved = () => { closeModal(); fetchEmployees(); };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      (e.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Employees</h2>
          <p>{employees.length} Workers Registered</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* LF-104: CSV Export */}
          <button className="btn btn-secondary" onClick={() => exportToCSV(filtered)}>
            ⬇ Export CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Worker
          </button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by name, department, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "360px" }}
          />
        </div>

        <div className="card">
          {/* LF-105: table-wrapper for horizontal scroll on mobile */}
          <div className="table-wrapper">
            {loading ? (
              <div className="loading">Loading workers...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    {/* LF-103: Designation column */}
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    {/* LF-102: Salary (always positive) */}
                    <th>Salary (₹)</th>
                    {/* LF-101: DD/MM/YYYY */}
                    <th>Joining Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <p>No employees found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp) => (
                      <tr key={emp._id}>
                        <td style={{ color: "var(--text)", fontWeight: 600 }}>{emp.name}</td>
                        <td>
                          <span className="badge badge-pending" style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }}>
                            {emp.designation}
                          </span>
                        </td>
                        <td>{emp.department}</td>
                        <td style={{ fontSize: "12px" }}>{emp.email}</td>
                        <td>{emp.phone || "—"}</td>
                        <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                          ₹{emp.salary?.toLocaleString("en-IN")}
                        </td>
                        {/* LF-101: DD/MM/YYYY format */}
                        <td>{formatDate(emp.joiningDate)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)}>
                              Del
                            </button>
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

      {showModal && (
        <EmployeeModal
          employee={editEmployee}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
