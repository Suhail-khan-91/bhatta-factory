const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI(endpoint, options = {}) {
  try {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// EMPLOYEES
export const createEmployee = async (data) => fetchAPI("/api/v1/employees", { method: "POST", body: JSON.stringify(data) });
export const getEmployees = async () => fetchAPI("/api/v1/employees");
export const getActiveEmployees = async () => fetchAPI("/api/v1/employees/active");
export const updateEmployee = async (id, data) => fetchAPI(`/api/v1/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteEmployee = async (id) => fetchAPI(`/api/v1/employees/${id}`, { method: "DELETE" });

// BRICK TEAMS & PRODUCTION
export const createBrickTeam = async (data) => fetchAPI("/api/v1/brick_teams", { method: "POST", body: JSON.stringify(data) });
export const getBrickTeams = async () => fetchAPI("/api/v1/brick_teams");
export const createDailyProduction = async (data) => fetchAPI("/api/v1/daily_production", { method: "POST", body: JSON.stringify(data) });
export const getDailyProductions = async () => fetchAPI("/api/v1/daily_production");
export const deleteDailyProduction = async (id) => fetchAPI(`/api/v1/daily_production/${id}`, { method: "DELETE" });

// FUEL
export const createFuelStock = async (data) => fetchAPI("/api/v1/fuel/stock", { method: "POST", body: JSON.stringify(data) });
export const getFuelStocks = async () => fetchAPI("/api/v1/fuel/stock");
export const getAvailableFuelStock = async () => fetchAPI("/api/v1/fuel/stock/available");
export const createFuelUsage = async (data) => fetchAPI("/api/v1/fuel/usage", { method: "POST", body: JSON.stringify(data) });
export const getFuelUsages = async () => fetchAPI("/api/v1/fuel/usage");
export const deleteFuelStock = async (id) => fetchAPI(`/api/v1/fuel/stock/${id}`, { method: "DELETE" });
export const deleteFuelUsage = async (id) => fetchAPI(`/api/v1/fuel/usage/${id}`, { method: "DELETE" });

// PAYROLL
export const createAdvancePayment = async (data) => fetchAPI("/api/v1/payroll/advance", { method: "POST", body: JSON.stringify(data) });
export const createSalaryPayment = async (data) => fetchAPI("/api/v1/payroll/salary", { method: "POST", body: JSON.stringify(data) });
export const getPayrollLedger = async (employeeId) => fetchAPI(`/api/v1/payroll/ledger/${employeeId}`);
export const deletePayrollRecord = async (id) => fetchAPI(`/api/v1/payroll/${id}`, { method: "DELETE" });
export const createExtraWork = async (data) => fetchAPI("/api/v1/payroll/extra-work", { method: "POST", body: JSON.stringify(data) });
export const getUnpaidExtraWork = async (employeeId) => fetchAPI(`/api/v1/payroll/extra-work/unpaid/${employeeId}`);

// SETTINGS
export const getSettings = async (category) => fetchAPI(`/api/v1/settings/${category}`);
export const getAllSettings = async () => fetchAPI("/api/v1/settings");
export const updateSettings = async (category, valuesArray) => fetchAPI(`/api/v1/settings/${category}`, { method: "PUT", body: JSON.stringify({ values: valuesArray }) });

// SALES
export const createOrder = async (data) => fetchAPI("/api/v1/sales/orders", { method: "POST", body: JSON.stringify(data) });

export const getOrders = async () => fetchAPI("/api/v1/sales/orders");
export const getOrderById = async (id) => fetchAPI(`/api/v1/sales/orders/${id}`);
export const updateOrder = async (id, data) => fetchAPI(`/api/v1/sales/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const recordPayment = async (orderId, data) => fetchAPI(`/api/v1/sales/orders/${orderId}/payment`, { method: "POST", body: JSON.stringify(data) });
export const logDispatch = async (orderId, data) => fetchAPI(`/api/v1/sales/orders/${orderId}/dispatch`, { method: "POST", body: JSON.stringify(data) });
export const forceCloseOrder = async (orderId, data) => fetchAPI(`/api/v1/sales/orders/${orderId}/force-close?close_reason=${encodeURIComponent(data.close_reason || data)}`, { method: "PATCH" });
export const getDispatches = async () => fetchAPI("/api/v1/sales/dispatches");
export const deleteDispatch = async (id) => fetchAPI(`/api/v1/sales/dispatch/${id}`, { method: "DELETE" });

// CALCULATOR
export const saveCalculation = async (expression, result) => fetchAPI("/api/v1/calculator/history", { method: "POST", body: JSON.stringify({ expression, result: String(result) }) });
export const getCalculatorHistory = async () => fetchAPI("/api/v1/calculator/history");
export const clearCalculatorHistory = async () => fetchAPI("/api/v1/calculator/history", { method: "DELETE" });

// ANALYTICS
export const getFuelSummary = async () => fetchAPI("/api/v1/fuel/summary");
export const getAnalyticsSummary = async () => fetchAPI("/api/v1/analytics/summary");