import { useEffect, useState } from 'react';
import { formatLocalTime, calculateTotalHours } from '../utils/timeUtils';

export default function DailyLog() {
  const [logs, setLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const employeeId = localStorage.getItem('selectedEmployee');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!employeeId) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sheet/${employeeId}`);
        const data = await res.json();
        setLogs(data);
        setTotalHours(calculateTotalHours(data));
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };
    fetchLogs();
  }, [employeeId]);

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold">Today's Log</h2>
      <ul className="text-sm mt-2 space-y-1">
        {logs.map((entry, idx) => (
          <li key={idx}>
            {entry.type === 'in' ? '🟢 Clock In' : '🔴 Clock Out'} — {formatLocalTime(entry.timestamp)}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-bold">Total Hours: {totalHours.toFixed(2)}</p>
    </div>
  );
}