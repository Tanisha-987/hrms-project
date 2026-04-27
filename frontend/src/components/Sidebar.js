import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: "⬛" },
  { path: "/employees", label: "Employees", icon: "👷" },
  { path: "/overtime", label: "Overtime", icon: "⏱" },
  { path: "/payslip", label: "Payslip", icon: "📋" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>LF·HRMS</h1>
        <p>Construction Workforce</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
