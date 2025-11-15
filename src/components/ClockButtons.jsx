import { queueEvent, syncEvents } from '../utils/syncManager';

export default function ClockButtons() {
  const handleClock = async (type) => {
    const employeeId = localStorage.getItem('selectedEmployee');
    if (!employeeId) return alert('Please select an employee');

    const event = {
      employeeId,
      type,
      timestamp: new Date().toISOString(),
    };

    await queueEvent(event);
    if (navigator.onLine) await syncEvents();
  };

  return (
    <div className="flex gap-4">
      <button onClick={() => handleClock('in')} className="btn bg-green-500 text-white">Clock In</button>
      <button onClick={() => handleClock('out')} className="btn bg-red-500 text-white">Clock Out</button>
    </div>
  );
}