// // src/utils/syncManager.js
// import { saveEvent, getUnsyncedEvents, clearSyncedEvents } from './indexedDB';

// // Define the synchronization interval (30 seconds)
// const SYNC_INTERVAL_MS = 30000;

// export const queueEvent = async (event) => {
//   await saveEvent(event);
// };

// export const syncEvents = async () => {
//   if (!navigator.onLine) {
//     console.log('Sync skipped: Offline.');
//     return;
//   }

//   const events = await getUnsyncedEvents();
//   if (events.length === 0) return;

//   // Prepare data for the server: remove IndexedDB-specific metadata (like 'id', 'synced', 'queuedAt')
//   const dataToSend = events.map(event => ({
//     user_id: event.user_id,
//     log_type: event.log_type,
//     timestamp: event.timestamp,
//   }));
    
//   console.log(`Attempting to sync ${dataToSend.length} pending event(s)...`);

//   try {
//     const res = await fetch(`${import.meta.env.VITE_API_URL}/sync`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ events: dataToSend }),
//     });
    
//     if (res.ok) {
//       // FIX: The clearSyncedEvents function clears all entries marked 'synced: true'. 
//       // It does not accept an argument. Upon successful batch sync, we assume the 
//       // server accepted the events, and the simplest cleanup is to clear the synced ones.
//       await clearSyncedEvents(); 
//       console.log('✅ Synced events:', dataToSend.length);
//     } else {
//       console.error('❌ Sync failed:', res.status, await res.text());
//     }
//   } catch (err) {
//     console.error('❌ Sync error (network or server connectivity):', err);
//   }
// };

// /**
//  * Initializes automatic synchronization by running it immediately and setting up a timer.
//  * Also keeps the listener for when the browser comes back online.
//  */
// export const setupAutoSync = () => {
//   // 1. Run sync once immediately at startup
//   syncEvents();

//   // 2. Set up the periodic check
//   setInterval(syncEvents, SYNC_INTERVAL_MS);

//   // 3. Keep the online event listener to trigger sync immediately upon regaining connection
//   window.addEventListener('online', syncEvents);

//   console.log(`Automatic sync is active, running every ${SYNC_INTERVAL_MS / 1000} seconds.`);
// };

// // NOTE: The previous standalone window.addEventListener('online', syncEvents); 
// // is now included inside setupAutoSync, making the module cleaner.



// src/utils/syncManager.js
import { getUnsyncedEvents, markEventSynced } from './indexedDB';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/clockmate/api/index.php';

// Helper to construct API endpoint
const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  endpoint = endpoint.replace(/^\//, '');
  
  // If API_URL ends with index.php, append route as query or path
  if (API_URL.endsWith('index.php')) {
    return `${API_URL}/${endpoint}`;
  }
  
  return `${API_URL}/${endpoint}`;
};

// Sync all offline events to server
export const syncEvents = async () => {
  if (!navigator.onLine) {
    console.log('Offline - sync skipped');
    return false;
  }

  try {
    const events = await getUnsyncedEvents();
    
    if (events.length === 0) {
      console.log('No events to sync');
      return true;
    }

    console.log(`Syncing ${events.length} events...`);
    
    for (const event of events) {
      try {
        const res = await fetch(getApiUrl('clock/event'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: event.employeeId,
            type: event.type,
            timestamp: event.timestamp
          })
        });
        
        if (res.ok) {
          await markEventSynced(event.id);
          console.log(`Event ${event.id} synced successfully`);
        } else {
          console.error(`Failed to sync event ${event.id}:`, res.status);
        }
      } catch (err) {
        console.error(`Error syncing event ${event.id}:`, err);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Sync error:', err);
    return false;
  }
};

// Setup auto-sync on reconnection
export const setupAutoSync = () => {
  window.addEventListener('online', () => {
    console.log('Connection restored - syncing...');
    syncEvents();
  });
};