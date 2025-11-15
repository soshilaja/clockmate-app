// src/views/AdminDashboardView.jsx

import React, { useState, useEffect } from "react";
import {
  Users,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Settings as SettingsIcon,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  UserCheck,
  UserX,
  RefreshCw,
  FileSpreadsheet,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
// All time utility imports are now used
import {
  formatDateTime,
  formatDate,
  formatTime,
  calculateTotalHours,
  groupLogsByDate,
} from "../utils/timeUtils";

// const API_URL =
  // import.meta.env.VITE_API_URL || "https://your-infinityfree-domain.com/api";

export default function AdminDashboardView({ session }) {
  // State management
  const [pending, setPending] = useState([]);
  const [employees, setEmployees] = useState([]);
  // selectedEmployee is used to track which employee's logs are currently shown
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // employeeLogs is used to store the fetched logs for the selected employee
  const [employeeLogs, setEmployeeLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  // Date range state is now used in fetchEmployeeLogs
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingApprovals: 0,
    todayClockIns: 0,
  });
  // expandedEmployee is used to control the visual expansion of the employee row
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch data on mount
  useEffect(() => {
    fetchPending();
    fetchEmployees();
    fetchStats();
  }, []);

  // Effect to fetch logs when an employee is selected for viewing
  useEffect(() => {
    if (selectedEmployee) {
      // Re-fetch logs when selectedEmployee or dateRange changes
      fetchEmployeeLogs(selectedEmployee, dateRange.start, dateRange.end);
    } else {
      setEmployeeLogs([]);
    }
  }, [selectedEmployee, dateRange.start, dateRange.end]); // Dependency array includes selectedEmployee and dateRange

  // Show message with auto-dismiss
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Fetch pending approvals
  const fetchPending = async () => {
    try {
      const res = await fetch(`/api/admin/pending`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        setPending(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch pending:", err);
      showMessage("Failed to load pending approvals", "error");
    }
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/employees`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        // Ensure data is an array before setting
        setEmployees(Array.isArray(result.data) ? result.data : []);
      } else {
        setEmployees([]);
        showMessage("Failed to load employees", "error");
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setEmployees([]);
      showMessage("Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        // console.log("Fetched stats:", result.data);
        setStats(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Fetch employee logs with date range (Now correctly used)
  const fetchEmployeeLogs = async (
    employee_id,
    startDate = "",
    endDate = ""
  ) => {
    if (!employee_id) return;
    try {
      setLoading(true);
      let url = `/api/clock/logs/${employee_id}`;
      if (startDate && endDate) {
        // API expects YYYY-MM-DD format, which is standard for <input type="date">
        url += `?start=${startDate}&end=${endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        // console.log("Fetched logs for employee:", result.data);
        setEmployeeLogs(result.data);
        // Note: selectedEmployee is set in toggleEmployeeExpansion
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      showMessage("Failed to load employee logs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Employee Logs View (New function to fix 'not defined' error)
  const toggleEmployeeExpansion = (employeeId) => {
    // If the same employee is clicked, collapse the view
    if (expandedEmployee === employeeId) {
      setExpandedEmployee(null);
      setSelectedEmployee(null);
      setEmployeeLogs([]);
      setDateRange({ start: "", end: "" }); // Reset date filter on collapse
    } else {
      // Expand the new employee
      setExpandedEmployee(employeeId);
      setSelectedEmployee(employeeId);
      // Logs will be fetched by the useEffect hook
    }
  };

  // Handle Date Filter application
 const handleClearDateFilter = () => {
   setDateRange({ startDate: "", endDate: "" });
 };

  // Approve employee
  const handleApprove = async (id, name) => {
    if (!confirm(`Approve ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/approve/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        showMessage(`${name} approved successfully`, "success");
        fetchPending();
        fetchEmployees();
        fetchStats();
      } else {
        throw new Error("Approval failed");
      }
    } catch (err) {
      console.error("Failed to approve:", err);
      showMessage(`Failed to approve ${name}`, "error");
    }
  };

  // Reject employee
  const handleReject = async (id, name) => {
    const reason = prompt(`Reject ${name}? Enter reason (optional):`);
    if (reason === null) return; // User cancelled

    try {
      const res = await fetch(`/api/admin/reject/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        showMessage(`${name} rejected`, "success");
        fetchPending();
      } else {
        throw new Error("Rejection failed");
      }
    } catch (err) {
      console.error("Failed to reject:", err);
      showMessage(`Failed to reject ${name}`, "error");
    }
  };

  // Reset PIN
  const handleResetPin = async (id, employeeName) => {
    const newPin = prompt(`Enter new 6-digit PIN for ${employeeName}:`);
    if (!newPin) return;

    if (!/^\d{6}$/.test(newPin)) {
      showMessage("Invalid PIN. Must be exactly 6 digits.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/admin/reset-pin/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ newPin }),
      });
      if (res.ok) {
        showMessage(`PIN reset successfully for ${employeeName}`, "success");
      } else {
        throw new Error("PIN reset failed");
      }
    } catch (err) {
      console.error("Failed to reset PIN:", err);
      showMessage("Failed to reset PIN", "error");
    }
  };

  // Deactivate employee
  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}? They will not be able to clock in/out.`))
      return;
    try {
      const res = await fetch(`/api/admin/deactivate/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        showMessage(`${name} deactivated`, "success");
        fetchEmployees();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to deactivate:", err);
      showMessage("Failed to deactivate employee", "error");
    }
  };

  // Reactivate employee
  const handleReactivate = async (id, name) => {
    if (!confirm(`Reactivate ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/reactivate/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        showMessage(`${name} reactivated`, "success");
        fetchEmployees();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to reactivate:", err);
      showMessage("Failed to reactivate employee", "error");
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/export`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `clockmate-export-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage("Export successful", "success");
      } else {
        throw new Error("Export failed");
      }
    } catch (err) {
      console.error("Failed to export:", err);
      showMessage("Failed to export data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Export specific employee logs (Now correctly used)
  const exportEmployeeLogs = async (employeeId, employeeName) => {
    try {
      const res = await fetch(`/api/admin/export-employee/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${employeeName}-logs-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage(`Export successful for ${employeeName}`, "success");
      }
    } catch (err) {
      console.error("Failed to export employee logs:", err);
      showMessage("Failed to export employee logs", "error");
    }
  };

  // Send notification email
  const sendNotification = async (employeeId, subject, message) => {
    try {
      const res = await fetch(`/api/admin/notify/${employeeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        showMessage("Notification sent", "success");
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
      showMessage("Failed to send notification", "error");
    }
  };

  // Filter and sort employees
  const getFilteredEmployees = () => {
    let filtered = [...employees];
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((emp) => emp.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return filtered;
  };

  // Calculate employee statistics (Now correctly used)
  const calculateEmployeeStats = (logs) => {
    // console.log("Calculating stats for logs:", logs);
    const today = new Date().toDateString();
    const todayLogs = logs.filter(
      (log) => new Date(log.timestamp).toDateString() === today
    );
    // Uses the imported timeUtils function
    const totalHours = calculateTotalHours(logs);
    // Uses the imported timeUtils function
    const dailyHours = groupLogsByDate(logs);

    return {
      totalHours: totalHours.toFixed(2),
      todayHours: calculateTotalHours(todayLogs).toFixed(2),
      daysWorked: Object.keys(dailyHours).length,
      averageHours: (
        totalHours / Math.max(Object.keys(dailyHours).length, 1)
      ).toFixed(2),
    };
  };

  // Render Employee Logs (New function to fix 'not defined' error)
  const renderEmployeeLogs = (employee) => {
    const logs = employeeLogs; // Ensure only this employee's logs are used
    const stats = calculateEmployeeStats(logs); // Calculate stats using the function
    // console.log("Rendering logs for employee:", stats);

    const groupedLogs = groupLogsByDate(logs); // Use the imported timeUtils function

    return (
      <div className="mt-6 pt-6 border-t border-amber-200">
        <h4 className="text-xl font-bold text-red-900 mb-4">
          Time Logs for {employee?.name}
        </h4>

        {/* Date Filtering Controls */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-red-900 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 focus:outline-none focus:border-red-800"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-red-900 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 focus:outline-none focus:border-red-800"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={handleClearDateFilter}
              disabled={!dateRange.start || !dateRange.end || loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold disabled:opacity-50 h-10"
            >
              <Calendar className="w-4 h-4" />
              Clear Filter
            </button>
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={() => exportEmployeeLogs(employee.id, employee.name)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold disabled:opacity-50 h-10"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Log Stats Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <p className="text-2xl font-bold text-blue-800">
              {stats?.totalHours}
            </p>
            <p className="text-xs text-blue-700">Total Hours</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-800">
              {stats?.todayHours}
            </p>
            <p className="text-xs text-green-700">Today's Hours</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <p className="text-2xl font-bold text-amber-800">
              {stats?.daysWorked}
            </p>
            <p className="text-xs text-amber-700">Days Tracked</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <p className="text-2xl font-bold text-purple-800">
              {stats?.averageHours}
            </p>
            <p className="text-xs text-purple-700">Avg. Daily Hrs</p>
          </div>
        </div>

        {/* Actual Logs List */}
        {loading && logs.length === 0 ? (
          <div className="text-center py-8 text-red-800">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-red-900" />
            <p>Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-red-800">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-md">No clock logs found for this period.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedLogs)
              .sort()
              .reverse()
              .map((dateKey) => {
                //Get logs for the day
                let dailyLogs = groupedLogs[dateKey];

                // 💡 FIX: Sort the daily logs by timestamp before calculating the total
                dailyLogs.sort(
                  (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );

                return (
                  <div
                    key={dateKey}
                    className="border border-red-100 rounded-xl overflow-hidden shadow-sm"
                  >
                    <h5 className="bg-red-50 text-red-900 font-bold p-3 border-b border-red-100">
                      {dateKey}
                    </h5>
                    <div className="p-3 space-y-2">
                      {/* Display individual log entries */}
                      {dailyLogs.map((log, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 rounded-lg text-sm ${
                            log.type === "in"
                              ? "bg-green-50 text-green-800"
                              : "bg-red-50 text-red-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {log.type === "in" ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                            <span className="font-semibold">{log.type}</span>
                          </div>
                          {/* Use formatTime, formatDate, and formatDateTime */}
                          <span className="text-xs md:text-sm">
                            Time: {formatTime(log.timestamp)} | Full:{" "}
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                      ))}
                      {/* Calculate and display total hours for the day */}
                      <div className="text-right pt-2 text-sm font-bold text-red-900 border-t border-amber-100">
                        Daily Total: {calculateTotalHours(dailyLogs).toFixed(2)}{" "}
                        hours
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  const filteredEmployees = getFilteredEmployees();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ... (Header with Actions, Alert Messages, Statistics Cards, Navigation Tabs - NO CHANGES) ... */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-amber-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-red-800 text-sm">
              Manage employees and monitor time tracking
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                fetchPending();
                fetchEmployees();
                fetchStats();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportToExcel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-xl p-3 border ${
              message.type === "success"
                ? "bg-green-50 border-green-200"
                : message.type === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 ${
                message.type === "success"
                  ? "text-green-600"
                  : message.type === "error"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            />
            <p
              className={`text-sm ${
                message.type === "success"
                  ? "text-green-700"
                  : message.type === "error"
                  ? "text-red-600"
                  : "text-blue-700"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats?.totalEmployees}</p>
            <p className="text-sm opacity-90">Total Employees</p>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats?.activeEmployees}</p>
            <p className="text-sm opacity-90">Active Today</p>
          </div>

          <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats?.todayClockIns}</p>
            <p className="text-sm opacity-90">Today's Clock-Ins</p>
          </div>

          <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <UserX className="w-8 h-8 opacity-80" />
              <AlertCircle className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats?.pendingApprovals}</p>
            <p className="text-sm opacity-90">Pending Approvals</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-amber-200 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            {
              id: "pending",
              label: `Pending (${pending.length})`,
              icon: UserX,
            },
            {
              id: "employees",
              label: `Employees (${employees.length})`,
              icon: Users,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedEmployee(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-red-900 border-b-2 border-red-900"
                  : "text-red-800/60 hover:text-red-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ... (Overview Tab and Pending Approvals Tab - NO CHANGES) ... */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-red-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employees.slice(0, 10).map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center text-white font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-red-900">{emp.name}</p>
                      <p className="text-xs text-red-700">
                        Last active: {emp.created_at || "Never"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      emp.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {emp.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-red-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setActiveTab("pending")}
                className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <UserX className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      Pending Approvals
                    </p>
                    <p className="text-xs text-red-700">
                      {pending.length} waiting for review
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-red-800" />
              </button>

              <button
                onClick={exportToExcel}
                className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-red-900">Export Reports</p>
                    <p className="text-xs text-red-700">
                      Download all employee data
                    </p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-red-800" />
              </button>

              <button
                onClick={() => setActiveTab("employees")}
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      Manage Employees
                    </p>
                    <p className="text-xs text-red-700">
                      {employees.length} total employees
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-red-800" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === "pending" && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-amber-200">
          <h2 className="text-2xl font-bold text-red-900 mb-6">
            Pending Approvals
          </h2>

          {pending.length === 0 ? (
            <div className="text-center py-16 text-red-800">
              <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No Pending Approvals</p>
              <p className="text-sm">
                All employee registrations have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((user) => (
                <div
                  key={user.id}
                  className="bg-white/60 rounded-2xl border border-amber-200 p-6 hover:bg-white/80 transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-linear-to-br from-red-900 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-red-900 mb-1">
                            {user.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-red-800">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-red-700" />
                            <p className="text-xs text-red-700">
                              Requested:{" "}
                              {new Date(user.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {user.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                          <p className="text-sm text-amber-900">
                            <strong>Notes:</strong> {user.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleApprove(user.id, user.name)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id, user.name)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-amber-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Employee Management
            </h2>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-800/50" />
                  <input
                    type="text"
                    placeholder="Search employees by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/60 border-2 border-amber-300 rounded-xl focus:outline-none focus:border-red-800 transition-all"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 text-red-900 rounded-xl hover:bg-amber-200 transition-all font-semibold"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-sm font-semibold text-red-900 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 focus:outline-none focus:border-red-800"
                    >
                      <option value="all">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending (Error)</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-red-900 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 focus:outline-none focus:border-red-800"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="created_at">Join Date</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-red-900 mb-1">
                      Sort Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 focus:outline-none focus:border-red-800"
                    >
                      <option value="asc">Ascending (A-Z, Oldest)</option>
                      <option value="desc">Descending (Z-A, Newest)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee List */}
          {loading ? (
            <div className="text-center py-12 text-red-800">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-red-900" />
              <p>Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-16 text-red-800">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No Employees Found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white/60 rounded-2xl border border-amber-200 p-6 hover:bg-white/80 transition-all shadow-lg"
                >
                  {/* Employee Summary Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {employee.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-red-900 truncate">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-red-800 truncate">
                          {employee.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Status Badge */}
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          employee.status === "approved"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : employee.status === "deactivated"
                            ? "bg-gray-100 text-gray-700 border border-gray-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {employee.status}
                      </span>

                      {/* Actions Dropdown/Buttons (Simplified inline) */}
                      <div className="relative group">
                        <button
                          onClick={() => toggleEmployeeExpansion(employee.id)}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold text-sm"
                        >
                          {expandedEmployee === employee.id ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide Logs
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              View Logs
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details/Actions */}
                  {expandedEmployee === employee.id && (
                    <>
                      <div className="mt-4 pt-4 border-t border-amber-100 space-y-4">
                        {/* Detailed Info (Optional) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-red-800">
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-600" /> Phone:{" "}
                            {employee.phone || "N/A"}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />{" "}
                            Location: {employee.location || "N/A"}
                          </p>
                          {/* Use formatDate */}
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />{" "}
                            Joined: {formatDate(employee.created_at)}
                          </p>
                        </div>

                        {/* Management Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-100">
                          <button
                            onClick={() =>
                              handleResetPin(employee.id, employee.name)
                            }
                            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
                          >
                            <SettingsIcon className="w-4 h-4" />
                            Reset PIN
                          </button>
                          <button
                            onClick={() => {
                              const subject = prompt(
                                `Enter email subject for ${employee.name}:`
                              );
                              if (!subject) return;
                              const body = prompt(
                                `Enter email message for ${employee.name}:`
                              );
                              if (body)
                                sendNotification(employee.id, subject, body);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
                          >
                            <Mail className="w-4 h-4" />
                            Send Email
                          </button>

                          {employee.status === "deactivated" ? (
                            <button
                              onClick={() =>
                                handleReactivate(employee.id, employee.name)
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
                            >
                              <UserCheck className="w-4 h-4" />
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleDeactivate(employee.id, employee.name)
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-medium"
                            >
                              <UserX className="w-4 h-4" />
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Employee Logs Section - Calls the new render function */}
                      {renderEmployeeLogs(employee)}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer (Optional, good practice) */}
      <div className="text-center py-4 text-xs text-red-800/60">
        &copy; {new Date().getFullYear()} ClockMate Admin Panel. Data is
        refreshed automatically.
      </div>
    </div>
  );
}
