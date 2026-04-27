import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Overtime from "./pages/Overtime";
import Payslip from "./pages/Payslip";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/overtime" element={<Overtime />} />
            <Route path="/payslip" element={<Payslip />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
