// Change this to your Render.com backend URL after deployment
// Example: https://hrms-backend-abc123.onrender.com
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const API = {
  employees: `${BASE_URL}/api/employees`,
  overtime: `${BASE_URL}/api/overtime`,
};
