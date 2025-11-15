// src/views/DashboardView.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { queueEvent } from "../utils/indexedDB";
import {
  formatTime,
  formatDate,
  calculateTotalHours,
  formatHours,
} from "../utils/timeUtils";
import OfflineStatus from "../components/OfflineStatus";

// Configuration
const AUTO_LOGOUT_DELAY = 5000; // 5 seconds
const MESSAGE_DISPLAY_DURATION = 4000; // 4 seconds
const SHOW_DEBUG_PANEL = true; // Force show for debugging

/**
 * Converts a timestamp string into a "YYYY-MM-DD" string
 * based on the America/Halifax timezone.
 * Handles MySQL datetime format (YYYY-MM-DD HH:MM:SS)
 */
const getHalifaxDateString = (timestamp) => {
  if (!timestamp) return ""; // If it's already a MySQL datetime format (YYYY-MM-DD HH:MM:SS) // and we sent it in Halifax timezone, just extract the date part

  if (
    typeof timestamp === "string" &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)
  ) {
    // Simply return the date part (first 10 characters)
    return timestamp.substring(0, 10);
  } // For ISO format or other formats, parse and convert

  let date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    // ERROR FIX: Removed console.error, return empty string instead
    return "";
  } // Format as YYYY-MM-DD in Halifax timezone

  const year = date.toLocaleString("en-US", {
    timeZone: "America/Halifax",
    year: "numeric",
  });
  const month = date.toLocaleString("en-US", {
    timeZone: "America/Halifax",
    month: "2-digit",
  });
  const day = date.toLocaleString("en-US", {
    timeZone: "America/Halifax",
    day: "2-digit",
  });

  return `${year}-${month}-${day}`;
};

export default function DashboardView({ session, isOnline }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clocking, setClocking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Refs for cleanup

  const logoutTimerRef = useRef(null);
  const messageTimerRef = useRef(null); // Validate session on mount

  useEffect(() => {
    if (!session?.user?.userId) {
      // Kept console.error for critical initialization failure
      navigate("/");
      return;
    }
  }, [session, navigate]); // Fetch logs when userId changes

  useEffect(() => {
    if (session?.user?.userId) {
      fetchLogs();
    }
  }, [session?.user?.userId]); // Cleanup timers on unmount

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);
  /**
   * Clear any existing message after a delay
   */

  const showMessage = useCallback((msg, isError = false) => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    if (isError) {
      setError(msg);
      setMessage("");
    } else {
      setMessage(msg);
      setError("");
    }

    messageTimerRef.current = setTimeout(() => {
      setMessage("");
      setError("");
    }, MESSAGE_DISPLAY_DURATION);
  }, []);
  /**
   * Fetch clock logs from API
   */

  const fetchLogs = async () => {
    if (!session?.user?.userId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = `/api/clock/logs/${session.user.userId}`;

      const res = await fetch(url);

      if (res.ok) {
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          // Sort logs by timestamp (newest first)
          const sortedLogs = result.data.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
          });

          setLogs(sortedLogs);
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch logs (${res.status})`
        );
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage(
        isOnline
          ? "Failed to load activity logs. Please try refreshing."
          : "Offline - showing cached data",
        !isOnline ? false : true
      );
    } finally {
      setLoading(false);
    }
  };
  /**
   * Schedule auto-logout after clock event
   */

  const scheduleLogout = useCallback(() => {
    // Clear any existing logout timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    logoutTimerRef.current = setTimeout(() => {
      localStorage.removeItem("session");
      localStorage.removeItem("selectedEmployee");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }, AUTO_LOGOUT_DELAY);
  }, [navigate]);
  /**
   * Handle clock in/out action
   */

  const handleClock = async (type) => {
    if (!session?.user?.userId) {
      showMessage("Session expired. Please log in again.", true);
      navigate("/");
      return;
    } // Prevent double-clicks

    if (clocking) {
      return;
    }

    setClocking(true);
    setError("");
    setMessage(""); // Get current time in Halifax timezone

    const now = new Date();
    const halifaxTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Halifax" })
    ); // Format as MySQL datetime: YYYY-MM-DD HH:MM:SS

    const year = halifaxTime.getFullYear();
    const month = String(halifaxTime.getMonth() + 1).padStart(2, "0");
    const day = String(halifaxTime.getDate()).padStart(2, "0");
    const hours = String(halifaxTime.getHours()).padStart(2, "0");
    const minutes = String(halifaxTime.getMinutes()).padStart(2, "0");
    const seconds = String(halifaxTime.getSeconds()).padStart(2, "0");

    const mysqlTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const event = {
      employeeId: session.user.userId,
      type,
      timestamp: mysqlTimestamp, // Send in MySQL format already
    };

    try {
      // 1. Queue event for offline support
      try {
        await queueEvent(event);
      } catch (queueError) {
        console.error("Queue Error:", queueError);
        showMessage("Warning: Offline backup failed", true);
      } // 2. Optimistically update UI IMMEDIATELY

      const optimisticLog = {
        id: `temp-${Date.now()}`,
        type: event.type,
        timestamp: event.timestamp, // Use the same MySQL format timestamp
        _optimistic: true,
      };

      setLogs((prevLogs) => {
        const newLogs = [optimisticLog, ...prevLogs];
        return newLogs;
      }); // 3. Try to sync with server if online

      if (isOnline) {
        try {
          const res = await fetch(`/api/clock/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          });

          if (res.ok) {
            await res.json();
            showMessage(`Successfully clocked ${type}`); // Wait a bit before fetching to ensure DB is updated

            setTimeout(async () => {
              await fetchLogs();
            }, 500);
          } else {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Server error");
          }
        } catch (syncError) {
          console.error("Sync Error:", syncError);
          showMessage(
            `Clocked ${type} - will sync when connection is restored`,
            false
          );
        }
      } else {
        // Offline mode - keeping optimistic update
        showMessage(`Clocked ${type} offline - will sync when online`, false);
      } // 4. Schedule auto-logout

      scheduleLogout();
    } catch (err) {
      console.error("Error:", err);
      // Remove optimistic update on failure
      setLogs((prevLogs) => {
        const filtered = prevLogs.filter((log) => !log._optimistic);
        return filtered;
      });

      showMessage("Failed to record clock event. Please try again.", true);
    } finally {
      setClocking(false);
    }
  }; // Calculate today's date in Halifax timezone

  const todayInHalifax = getHalifaxDateString(new Date()); // Filter logs for today only

  const todayLogs = logs.filter((log) => {
    if (!log?.timestamp) {
      return false;
    } // Parsing of log.timestamp is implicitly handled within getHalifaxDateString

    const logDateInHalifax = getHalifaxDateString(log.timestamp);
    const isToday = logDateInHalifax === todayInHalifax;

    return isToday;
  }); // Determine current clock state based on most recent event today

  const lastTodayEvent = todayLogs.length > 0 ? todayLogs[0] : null;
  const isClockedIn = lastTodayEvent?.type === "in";
  const nextAction = isClockedIn ? "out" : "in"; // Calculate total hours ONLY for completed shifts // Note: Logs must be reversed (oldest first) for calculateTotalHours

  const reversedTodayLogs = [...todayLogs].reverse();
  const totalHours = calculateTotalHours(reversedTodayLogs, false); // Get logs from other days

  const historicalLogs = logs.filter((log) => {
    if (!log?.timestamp) return false;
    const logDateInHalifax = getHalifaxDateString(log.timestamp);
    return logDateInHalifax !== todayInHalifax;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Clock Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-amber-200 mb-6">
        <div className="mb-6">
          <OfflineStatus isOnline={isOnline} />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-900 mb-2">
            Welcome, {session?.user.name}!
          </h1>
          <p className="text-red-800 text-sm">
            Clock in and out to track your time
          </p>
        </div>
        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-blue-700 text-sm">{message}</p>
          </div>
        )}
        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {/* Status Indicator */}
        <div
          className={`mb-6 rounded-xl p-4 text-center transition-all duration-300 ${
            isClockedIn
              ? "bg-green-50 border-2 border-green-200"
              : "bg-gray-50 border-2 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {isClockedIn ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-green-700 font-semibold">
                  Currently Clocked In
                </p>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <p className="text-gray-600 font-semibold">Not Clocked In</p>
              </>
            )}
          </div>
          {lastTodayEvent && (
            <p className="text-sm text-gray-600">
              {isClockedIn ? "Since" : "Last clocked out at"}
              {formatTime(lastTodayEvent.timestamp)}
            </p>
          )}
        </div>
        {/* Single Morphing Clock Button */}
        <div className="mb-8">
          <button
            onClick={() => handleClock(nextAction)}
            disabled={clocking || !session?.user?.userId}
            aria-label={`Clock ${nextAction}`}
            aria-busy={clocking}
            className={`w-full font-semibold py-8 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center gap-3 ${
              nextAction === "in"
                ? "bg-linear-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
                : "bg-linear-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
            }`}
          >
            {clocking ? (
              <>
                <RefreshCw className="w-10 h-10 animate-spin" />
                <span className="text-2xl">Processing...</span>
              </>
            ) : (
              <>
                {nextAction === "in" ? (
                  <CheckCircle className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
                <span className="text-2xl">
                  {nextAction === "in" ? "Clock In" : "Clock Out"}
                </span>
              </>
            )}
          </button>
        </div>
        {/* Today's Total Hours - Only completed shifts */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-900 text-sm font-medium mb-1">
            Today's Total Hours
            {isClockedIn && (
              <span className="text-xs ml-2 text-amber-700">
                (Current shift not included)
              </span>
            )}
          </p>
          <p className="text-3xl font-bold text-red-900">
            {formatHours(totalHours)}
          </p>
        </div>
      </div>
      {/* Activity Log Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-amber-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-900">Today's Activity</h2>
          <button
            onClick={fetchLogs}
            disabled={loading}
            aria-label="Refresh activity logs"
            className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        {loading && todayLogs.length === 0 ? (
          <div className="text-center py-8" role="status" aria-live="polite">
            <div className="w-8 h-8 border-3 border-red-900/30 border-t-red-900 rounded-full animate-spin mx-auto" />
            <span className="sr-only">Loading activity logs...</span>
          </div>
        ) : todayLogs.length === 0 ? (
          <div className="text-center py-8 text-red-800">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet today. Clock in to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className={`flex items-center justify-between p-4 bg-white/60 rounded-xl border border-amber-200 hover:bg-white/80 transition-all ${
                  log._optimistic ? "opacity-70 border-blue-300" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {log.type === "in" ? (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-red-900">
                      {log.type === "in" ? "Clocked In" : "Clocked Out"}
                    </p>
                    {log._optimistic && (
                      <p className="text-xs text-blue-600">Syncing...</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-red-900">
                    {formatTime(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Show recent history from previous days */}
        {historicalLogs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-amber-200">
            <h3 className="text-lg font-semibold text-red-900 mb-4">
              Recent History
            </h3>
            <div className="space-y-2">
              {historicalLogs.slice(0, 5).map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-amber-100"
                >
                  <div className="flex items-center gap-2">
                    {log.type === "in" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-red-900">
                      {log.type === "in" ? "In" : "Out"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-800">
                      {formatDate(log.timestamp)}
                    </p>
                    <p className="text-xs text-red-700">
                      {formatTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
