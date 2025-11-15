// src/utils/timeUtils.js

// ==================== CONFIGURATION ====================

/**
 * Default timezone for the application.
 * Change this to match your location or make it configurable per user.
 */
const DEFAULT_TIMEZONE = 'America/Halifax'; // Atlantic Time (AST/ADT)

/**
 * Set this based on your backend timezone configuration.
 * - true: Backend returns UTC timestamps (recommended)
 * - false: Backend returns local server time
 */
const BACKEND_RETURNS_UTC = true;

// ==================== TIMESTAMP NORMALIZATION ====================

/**
 * Normalizes a timestamp string to ensure proper parsing by Date constructor.
 * Handles various formats from backend (MySQL datetime, ISO 8601, etc.)
 * 
 * @param {string} timestamp - The timestamp string from backend
 * @returns {string} Properly formatted timestamp string
 * 
 * @example
 * normalizeTimestamp('2025-11-09 19:00:00') // '2025-11-09T19:00:00Z' (if BACKEND_RETURNS_UTC = true)
 * normalizeTimestamp('2025-11-09T19:00:00') // '2025-11-09T19:00:00Z' (if BACKEND_RETURNS_UTC = true)
 * normalizeTimestamp('2025-11-09T19:00:00Z') // '2025-11-09T19:00:00Z' (already formatted)
 */
export const normalizeTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'string') {
    return timestamp;
  }

  // Check if timestamp already has timezone information
  // Matches: Z, +HH:MM, -HH:MM, +HHMM, -HHMM
  const hasTimezone = /[Z]$|[+-]\d{2}:?\d{2}$/.test(timestamp.trim());

  if (hasTimezone) {
    // Already has timezone info, return as-is
    return timestamp;
  }

  // Convert space to 'T' for ISO 8601 format (MySQL datetime format)
  let normalized = timestamp.trim().replace(' ', 'T');

  // Only append 'Z' if backend is configured to return UTC timestamps
  if (BACKEND_RETURNS_UTC) {
    normalized += 'Z';
  }
  // If backend returns local time, we leave it without timezone suffix
  // JavaScript will interpret it as local time

  return normalized;
};

/**
 * Creates a Date object from a timestamp with proper normalization.
 * Returns null if the timestamp is invalid.
 * 
 * @param {string} timestamp - The timestamp to parse
 * @returns {Date|null} Date object or null if invalid
 */
export const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid timestamp:', timestamp);
    return null;
  }

  return date;
};

// ==================== FORMATTING FUNCTIONS ====================

/**
 * Formats a timestamp into a localized date and time string.
 * 
 * @param {string} timestamp - The timestamp to format (UTC or ISO string)
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {string} Formatted date and time string (e.g., "11/9/2025, 3:00 PM")
 */
export const formatDateTime = (timestamp, timeZone = DEFAULT_TIMEZONE) => {
  if (!timestamp) return '';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid Date';

  return date.toLocaleString('en-US', {
    timeZone,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a timestamp into a date string.
 * 
 * @param {string} timestamp - The timestamp to format
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {string} Formatted date string (e.g., "11/9/2025")
 */
export const formatDate = (timestamp, timeZone = DEFAULT_TIMEZONE) => {
  if (!timestamp) return '';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid Date';

  return date.toLocaleString('en-US', {
    timeZone,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a timestamp into a time string without seconds.
 * 
 * @param {string} timestamp - The timestamp to format
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {string} Formatted time string (e.g., "3:00 PM")
 */
export const formatTime = (timestamp, timeZone = DEFAULT_TIMEZONE) => {
  if (!timestamp) return '';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid Time';

  return date.toLocaleString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a timestamp into a time string with seconds.
 * 
 * @param {string} timestamp - The timestamp to format
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {string} Formatted time string with seconds (e.g., "3:00:45 PM")
 */
export const formatTimeWithSeconds = (timestamp, timeZone = DEFAULT_TIMEZONE) => {
  if (!timestamp) return '';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid Time';

  return date.toLocaleString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Formats a timestamp into a long date format.
 * 
 * @param {string} timestamp - The timestamp to format
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {string} Formatted date string (e.g., "November 9, 2025")
 */
export const formatDateLong = (timestamp, timeZone = DEFAULT_TIMEZONE) => {
  if (!timestamp) return '';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid Date';

  return date.toLocaleString('en-US', {
    timeZone,
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a timestamp into a relative time string (e.g., "2 hours ago").
 * 
 * @param {string} timestamp - The timestamp to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid Date';

  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(timestamp);
  }
};

// ==================== TIME CALCULATIONS ====================

/**
 * Calculates the total hours worked from an array of clock in/out entries.
 * Expects entries in chronological order: [oldest_in, oldest_out, newer_in, newer_out, ...]
 * 
 * IMPORTANT: This function expects entries sorted from OLDEST to NEWEST.
 * If your API returns newest first, reverse the array before calling this function.
 * 
 * @param {Array<Object>} entries - Array of clock event objects with 'type' and 'timestamp' properties
 * @param {boolean} [includeOpenShift=false] - Whether to include currently open shift (no clock out yet)
 * @returns {number} Total hours worked as a decimal number
 * 
 * @example
 * const entries = [
 *   { type: 'in', timestamp: '2025-11-09 09:00:00' },
 *   { type: 'out', timestamp: '2025-11-09 17:00:00' },
 *   { type: 'in', timestamp: '2025-11-09 18:00:00' },
 *   // No out yet - currently working
 * ];
 * calculateTotalHours(entries) // 8 hours (only counts completed shifts)
 * calculateTotalHours(entries, true) // 8+ hours (includes ongoing shift)
 */
export const calculateTotalHours = (entries, includeOpenShift = false) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return 0;
  }

  let total = 0;
  let i = 0;

  while (i < entries.length) {
    const currentEntry = entries[i];

    // Skip if not a clock-in entry
    if (!currentEntry?.type || currentEntry.type !== 'in') {
      i++;
      continue;
    }

    const inEntry = currentEntry;
    const outEntry = entries[i + 1];

    // Check if we have a matching clock-out
    if (outEntry?.type === 'out' && outEntry?.timestamp) {
      const inTime = parseTimestamp(inEntry.timestamp);
      const outTime = parseTimestamp(outEntry.timestamp);

      if (inTime && outTime) {
        const diffMs = outTime - inTime;

        // Validate that clock-out is after clock-in
        if (diffMs > 0) {
          total += diffMs / (1000 * 60 * 60);
        } else {
          console.warn('Clock out time is before clock in time:', { inEntry, outEntry });
        }
      }

      i += 2; // Move to next pair
    } else {
      // No matching clock-out (open shift)
      if (includeOpenShift) {
        const inTime = parseTimestamp(inEntry.timestamp);
        const now = new Date();

        if (inTime) {
          const diffMs = now - inTime;
          if (diffMs > 0) {
            total += diffMs / (1000 * 60 * 60);
          }
        }
      }

      i++; // Move to next entry
    }
  }

  return total;
};

/**
 * Formats hours as a readable string.
 * 
 * @param {number} hours - Hours as decimal number
 * @param {boolean} [showMinutes=true] - Whether to show minutes
 * @returns {string} Formatted hours string (e.g., "8.5h" or "8h 30m")
 */
export const formatHours = (hours, showMinutes = true) => {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return '0h';
  }

  if (!showMinutes) {
    return `${hours.toFixed(1)}h`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
};

/**
 * Calculates duration between two timestamps in hours.
 * 
 * @param {string} startTimestamp - Start timestamp
 * @param {string} endTimestamp - End timestamp
 * @returns {number} Duration in hours (decimal)
 */
export const calculateDuration = (startTimestamp, endTimestamp) => {
  const startTime = parseTimestamp(startTimestamp);
  const endTime = parseTimestamp(endTimestamp);

  if (!startTime || !endTime) {
    return 0;
  }

  const diffMs = endTime - startTime;
  
  if (diffMs < 0) {
    console.warn('End time is before start time');
    return 0;
  }

  return diffMs / (1000 * 60 * 60);
};

/**
 * Gets the current timestamp in the application's timezone.
 * 
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {string} ISO 8601 formatted timestamp
 */
export const getCurrentTimestamp = (timeZone = DEFAULT_TIMEZONE) => {
  return new Date().toLocaleString('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6');
};

// ==================== GROUPING AND FILTERING ====================

/**
 * Groups an array of time log entries by their local date.
 * 
 * @param {Array<Object>} logs - Array of log objects with 'timestamp' property
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {Object<string, Array<Object>>} Object with date strings as keys and arrays of logs as values
 * 
 * @example
 * const logs = [
 *   { type: 'in', timestamp: '2025-11-09 09:00:00' },
 *   { type: 'out', timestamp: '2025-11-09 17:00:00' },
 *   { type: 'in', timestamp: '2025-11-10 09:00:00' }
 * ];
 * groupLogsByDate(logs)
 * // {
 * //   '11/9/2025': [{ type: 'in', ... }, { type: 'out', ... }],
 * //   '11/10/2025': [{ type: 'in', ... }]
 * // }
 */
export const groupLogsByDate = (logs, timeZone = DEFAULT_TIMEZONE) => {
  if (!Array.isArray(logs)) {
    return {};
  }

  const grouped = {};

  logs.forEach(log => {
    if (!log?.timestamp) return;

    const dateKey = formatDate(log.timestamp, timeZone);

    if (dateKey && dateKey !== 'Invalid Date') {
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    }
  });

  return grouped;
};

/**
 * Filters logs to only include entries from today.
 * 
 * @param {Array<Object>} logs - Array of log objects with 'timestamp' property
 * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA timezone identifier
 * @returns {Array<Object>} Filtered array of today's logs
 */
export const getTodayLogs = (logs, timeZone = DEFAULT_TIMEZONE) => {
  if (!Array.isArray(logs)) {
    return [];
  }

  const today = formatDate(new Date().toISOString(), timeZone);

  return logs.filter(log => {
    if (!log?.timestamp) return false;
    return formatDate(log.timestamp, timeZone) === today;
  });
};

/**
 * Filters logs to only include entries from a specific date range.
 * 
 * @param {Array<Object>} logs - Array of log objects with 'timestamp' property
 * @param {string} startDate - Start date (ISO format or any parseable format)
 * @param {string} endDate - End date (ISO format or any parseable format)
 * @returns {Array<Object>} Filtered array of logs within date range
 */
export const getLogsInRange = (logs, startDate, endDate) => {
  if (!Array.isArray(logs)) {
    return [];
  }

  const start = parseTimestamp(startDate);
  const end = parseTimestamp(endDate);

  if (!start || !end) {
    console.error('Invalid date range');
    return logs;
  }

  return logs.filter(log => {
    if (!log?.timestamp) return false;
    const logDate = parseTimestamp(log.timestamp);
    return logDate && logDate >= start && logDate <= end;
  });
};

/**
 * Checks if an employee is currently clocked in.
 * 
 * @param {Array<Object>} logs - Array of clock events sorted by timestamp (newest first)
 * @returns {boolean} True if currently clocked in
 */
export const isCurrentlyWorking = (logs) => {
  if (!Array.isArray(logs) || logs.length === 0) {
    return false;
  }

  // Check the most recent entry
  const latestEntry = logs[0];
  return latestEntry?.type === 'in';
};

/**
 * Gets the current shift start time if employee is clocked in.
 * 
 * @param {Array<Object>} logs - Array of clock events sorted by timestamp (newest first)
 * @returns {string|null} Timestamp of clock-in or null if not working
 */
export const getCurrentShiftStart = (logs) => {
  if (!isCurrentlyWorking(logs)) {
    return null;
  }

  return logs[0]?.timestamp || null;
};

// ==================== VALIDATION ====================

/**
 * Validates if a timestamp string is in a valid format.
 * 
 * @param {string} timestamp - Timestamp to validate
 * @returns {boolean} True if valid
 */
export const isValidTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'string') {
    return false;
  }

  const date = parseTimestamp(timestamp);
  return date !== null;
};

/**
 * Validates if a clock event sequence is valid (alternating in/out).
 * 
 * @param {Array<Object>} entries - Array of clock events with 'type' property
 * @returns {Object} Validation result with isValid and errors array
 */
export const validateClockSequence = (entries) => {
  if (!Array.isArray(entries)) {
    return { isValid: false, errors: ['Entries must be an array'] };
  }

  const errors = [];
  let expectedType = 'in';

  entries.forEach((entry, index) => {
    if (!entry?.type) {
      errors.push(`Entry at index ${index} missing type`);
      return;
    }

    if (entry.type !== expectedType) {
      errors.push(`Entry at index ${index}: expected '${expectedType}' but got '${entry.type}'`);
    }

    // Toggle expected type
    expectedType = expectedType === 'in' ? 'out' : 'in';
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==================== EXPORTS ====================

export default {
  // Configuration
  DEFAULT_TIMEZONE,
  BACKEND_RETURNS_UTC,
  
  // Normalization
  normalizeTimestamp,
  parseTimestamp,
  
  // Formatting
  formatDateTime,
  formatDate,
  formatTime,
  formatTimeWithSeconds,
  formatDateLong,
  formatRelativeTime,
  
  // Calculations
  calculateTotalHours,
  formatHours,
  calculateDuration,
  getCurrentTimestamp,
  
  // Grouping
  groupLogsByDate,
  getTodayLogs,
  getLogsInRange,
  isCurrentlyWorking,
  getCurrentShiftStart,
  
  // Validation
  isValidTimestamp,
  validateClockSequence
};