// export default function OfflineStatus() {
//   const online = navigator.onLine;
//   return (
//     <div className={`text-sm ${online ? 'text-green-500' : 'text-red-500'}`}>
//       {online ? 'Online' : 'Offline'} - Sync {online ? 'enabled' : 'queued'}
//     </div>
//   );
// }



import { useEffect, useState } from 'react';

export default function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <div className={`text-sm ${online ? 'text-green-500' : 'text-red-500'}`}>
      {online ? '🟢 Online - Sync enabled' : '🔴 Offline - Events queued'}
    </div>
  );
}