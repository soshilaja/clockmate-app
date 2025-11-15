// // src/App.jsx
// import React, { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
// import LoginView from "./views/LoginView";
// import SignupView from "./views/SignupView";
// import AdminLoginView from "./views/AdminLoginView";
// import DashboardView from "./views/DashboardView";
// import AdminDashboardView from "./views/AdminDashboardView";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { setupAutoSync, syncEvents } from "./utils/syncManager";

// function AppContent() {
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [session, setSession] = useState(() => {
//     try {
//       const saved = localStorage.getItem("session");
//       return saved ? JSON.parse(saved) : null;
//     } catch {
//       localStorage.removeItem("session");
//       return null;
//     }
//   });

//   // Listen for manual logout or session updates from other tabs/components
//   useEffect(() => {
//     const syncSession = () => {
//       const saved = localStorage.getItem("session");
//       setSession(saved ? JSON.parse(saved) : null);
//     };
//     window.addEventListener("storage", syncSession);
//     return () => window.removeEventListener("storage", syncSession);
//   }, []);

//   useEffect(() => {
//     const handleOnline = () => {
//       setIsOnline(true);
//       syncEvents();
//     };
//     const handleOffline = () => setIsOnline(false);
//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);
//     setupAutoSync();
//     return () => {
//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-amber-100">
//       <Header isOnline={isOnline} session={session} />

//       <main className="container mx-auto px-4 py-8 max-w-6xl">
//         <Routes>
//           <Route path="/" element={<LoginView />} />
//           <Route path="/signup" element={<SignupView />} />
//           <Route path="/admin-login" element={<AdminLoginView />} />

//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute requiredRole="employee">
//                 <DashboardView session={session} isOnline={isOnline} />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute requiredRole="admin">
//                 <AdminDashboardView session={session} isOnline={isOnline} />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AppContent />
//     </BrowserRouter>
//   );
// }



// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import LoginView from "./views/LoginView";
import SignupView from "./views/SignupView";
import AdminLoginView from "./views/AdminLoginView";
import DashboardView from "./views/DashboardView";
import AdminDashboardView from "./views/AdminDashboardView";
import ProtectedRoute from "./components/ProtectedRoute";
import { setupAutoSync, syncEvents } from "./utils/syncManager";

function AppContent() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("session");
      return null;
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncEvents();
    };

    const handleOffline = () => setIsOnline(false);

    // Listen for storage changes (including from Header logout)
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("session");
        setSession(saved ? JSON.parse(saved) : null);
      } catch {
        setSession(null);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", handleStorageChange);

    setupAutoSync();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogin = (session) => {
    // localStorage.setItem("session", JSON.stringify(newSession));
    setSession(session);
    // Trigger storage event for consistency
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-amber-100">
      <Header session={session} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              session ? (
                <Navigate to={session?.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <LoginView onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              session ? (
                <Navigate to={session?.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <SignupView onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/admin-login"
            element={
              session ? (
                <Navigate to={session?.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <AdminLoginView onLogin={handleLogin} />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="employee">
                <DashboardView session={session} isOnline={isOnline} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardView session={session} isOnline={isOnline} />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}