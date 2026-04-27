// LF-104: Export employee list to CSV
export function exportToCSV(employees) {
  const headers = ["Name", "Designation", "Department", "Email", "Phone", "Salary (INR)", "Joining Date"];

  const rows = employees.map((emp) => {
    const joiningDate = emp.joiningDate
      ? new Date(emp.joiningDate).toLocaleDateString("en-IN")
      : "";
    return [
      emp.name,
      emp.designation,
      emp.department,
      emp.email,
      emp.phone || "",
      emp.salary,
      joiningDate,
    ];
  });

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `employees_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
