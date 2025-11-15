// src/utils/indexedDB.js

const DB_NAME = 'ClockMateDB';
const DB_VERSION = 1;
// Placeholder for the API endpoint where clock events should be sent
const SYNC_API_ENDPOINT = 'https://your-infinityfree-domain.com/api/clock/sync';
// Synchronization interval (e.g., every 30 seconds)
const SYNC_INTERVAL_MS = 30000;

/**
 * Initializes and returns a connection to the IndexedDB.
 * Handles object store creation/upgrades.
 * @returns {Promise<IDBDatabase>} The IndexedDB database instance.
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store for cached PINs (offline login)
      if (!db.objectStoreNames.contains('pins')) {
        db.createObjectStore('pins', { keyPath: 'pin' });
      }

      // Store for offline clock events
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', {
          keyPath: 'id',
          autoIncrement: true
        });
        // Index to quickly fetch only unsynced events
        eventStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
};

/**
 * Caches employee PIN and details for offline access.
 * @param {string} pin The 6-digit PIN.
 * @param {number} userId The ID of the user.
 * @param {string} name The name of the user.
 */
export const cachePin = async (pin, userId, name) => {
  const db = await initDB();
  const tx = db.transaction(['pins'], 'readwrite');
  const store = tx.objectStore('pins');

  return new Promise((resolve, reject) => {
    const request = store.put({
      pin,
      userId,
      name,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (12 * 60 * 60 * 1000) // 12 hours
    });
    request.onsuccess = resolve;
    request.onerror = reject;
  });
};

/**
 * Retrieves a cached PIN if it exists and hasn't expired.
 * @param {string} pin The PIN to check.
 * @returns {Promise<Object | null>} The cached user object or null.
 */
export const getCachedPin = async (pin) => {
  const db = await initDB();
  const tx = db.transaction(['pins'], 'readonly');
  const store = tx.objectStore('pins');

  return new Promise((resolve) => {
    const request = store.get(pin); // Use the pin as the key here
    request.onsuccess = () => {
      const cached = request.result;

      // Check for existence and expiration
      if (cached && cached.expiresAt > Date.now()) {
        resolve(cached); // Return the cached data if valid
      } else {
        resolve(null); // Return null if expired or not found
      }
    };
    request.onerror = () => resolve(null); // In case of an error, return null
  });
};

/**
 * Queues a clock event for synchronization when online.
 * @param {Object} event The clock event object (e.g., { user_id, log_type, timestamp }). 
 * @returns {Promise<void>}
 */
export const queueEvent = async (event) => {
  const db = await initDB();
  const tx = db.transaction(['events'], 'readwrite');
  const store = tx.objectStore('events');

  return new Promise((resolve, reject) => {
    const request = store.add({
      ...event,
      synced: false, // Mark as unsynced
      queuedAt: Date.now()
    });
    request.onsuccess = resolve;
    request.onerror = reject;
  });
};

/**
 * **Alias for queueEvent to fulfill original snippet request.**
 * Queues a clock event for synchronization when online.
 * @param {Object} event The clock event object.
 * @returns {Promise<void>}
 */
export const saveEvent = async (event) => {
  await queueEvent(event);
};

/**
 * Retrieves all events that have not yet been successfully synced with the server.
 * @returns {Promise<Array<Object>>} An array of unsynced clock events.
 */
export const getUnsyncedEvents = async () => {
  const db = await initDB();
  const tx = db.transaction(['events'], 'readonly');
  const store = tx.objectStore('events');
  const index = store.index('synced');

  return new Promise((resolve) => {
    // Get all records where the 'synced' index value is false
    const request = index.getAll(false);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve([]); // Return empty array if error
  });
};

/**
 * Marks a specific queued event as successfully synced.
 * @param {number} id The auto-incremented ID of the event in the DB.
 * @returns {Promise<void>}
 */
export const markEventSynced = async (id) => {
  const db = await initDB();
  const tx = db.transaction(['events'], 'readwrite');
  const store = tx.objectStore('events');

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const event = getRequest.result;
      if (event) {
        // Update the synced status
        event.synced = true;
        const putRequest = store.put(event);
        putRequest.onsuccess = resolve;
        putRequest.onerror = reject;
      } else {
        // Event not found, still resolve
        resolve();
      }
    };
    getRequest.onerror = reject;
  });
};

/**
 * Clears all successfully synced clock events from the 'events' store.
 * This is crucial for cleanup and preventing the database from growing indefinitely.
 * @returns {Promise<void>}
 */
export const clearSyncedEvents = async () => {
  const db = await initDB();
  const tx = db.transaction(['events'], 'readwrite');
  const store = tx.objectStore('events');
  const index = store.index('synced');

  return new Promise((resolve, reject) => {
    // Open a cursor on the 'synced' index for true (synced) records
    const request = index.openCursor(true);
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        // Delete the current record
        cursor.delete();
        // Move to the next synced record
        cursor.continue();
      } else {
        // End of records
        resolve();
      }
    };

    request.onerror = reject;
  });
};


/**
 * Clears all cached data (pins and events) from the entire database.
 * Used for administrative actions like logout or reset.
 * @returns {Promise<void>}
 */
export const clearCache = async () => {
  const db = await initDB();
  const tx = db.transaction(['pins', 'events'], 'readwrite');
  
  // Perform clear operations. We don't need to assign the returned request objects
  // since we await the completion of the entire transaction (tx.oncomplete).
  tx.objectStore('pins').clear();
  tx.objectStore('events').clear();
  
  // Wait for the transaction to complete
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
};


// --- Auto-Sync Implementation ---

/**
 * Placeholder function to send an event to the server.
 * In a real application, this would contain your fetch logic and authorization.
 */
const sendClockEventToServer = async (event) => {
  try {
    // NOTE: Replace this with your actual API call logic (e.g., fetch)
    const response = await fetch(SYNC_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include any required Authorization headers (e.g., Bearer token)
        // 'Authorization': `Bearer ${sessionToken}` 
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      // Treat non-200 responses as sync failure (event remains unsynced)
      console.error(`Sync failed for event ${event.id}:`, response.statusText);
      return false; 
    }

    // Success
    return true; 
  } catch (error) {
    // Network error (offline or connectivity issue)
    console.warn(`Network error during sync attempt:`, error.message);
    return false;
  }
};

/**
 * Main logic to check for unsynced events and attempt to push them to the server.
 */
const syncEvents = async () => {
  // 1. Check if the browser thinks we are online
  if (!navigator.onLine) {
    console.log('Sync skipped: Currently offline.');
    return;
  }
  
  // 2. Get all pending events
  const unsyncedEvents = await getUnsyncedEvents();

  if (unsyncedEvents.length === 0) {
    // Only run cleanup if there are no more unsynced events to process
    await clearSyncedEvents();
    return;
  }

  console.log(`Attempting to sync ${unsyncedEvents.length} pending event(s)...`);

  // 3. Process each event sequentially
  for (const event of unsyncedEvents) {
    // Only send the necessary data (excluding the local ID, synced status, etc.)
    const dataToSend = {
      user_id: event.user_id,
      log_type: event.log_type,
      timestamp: event.timestamp,
    };
    
    const success = await sendClockEventToServer(dataToSend);

    if (success) {
      // 4. Mark local database entry as synced upon success
      await markEventSynced(event.id);
      console.log(`Successfully synced event ID: ${event.id}`);
    } else {
      // If one sync fails (e.g., server-side error), stop and wait for the next interval
      console.warn('Sync failed for current event. Stopping sync batch.');
      break; 
    }
  }
  
  // 5. Cleanup: Clear any events that were newly marked as synced in this batch
  await clearSyncedEvents();
};


/**
 * Sets up a persistent interval to automatically check and sync offline clock events.
 * This should be called once when the application loads.
 */
export const setupAutoSync = () => {
  // Run the sync once immediately
  syncEvents();

  // Set up the periodic check
  setInterval(syncEvents, SYNC_INTERVAL_MS);

  console.log(`Automatic sync is active, running every ${SYNC_INTERVAL_MS / 1000} seconds.`);
};