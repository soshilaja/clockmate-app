import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cachePin } from "../utils/indexedDB";
// import { syncEvents } from "../utils/syncManager";

export default function LoginView({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!pin || pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error: ${res.status} - ${errorText}`);
      }

      const result = await res.json();
      // console.log("API Response:", result.data);

      if (!result.data || !result.data.userId) {
        throw new Error("Login failed: Invalid response data.");
      }

      // ✅ Cache PIN for offline use
      await cachePin(pin, result.data.userId, result.data.name);

      // ✅ Save a proper session object in localStorage
      const session = {
        user: {
          userId: result.data.userId,
          name: result.data.name,
          role: result.data.role || "employee",
        },
      };
      localStorage.setItem("session", JSON.stringify(session));

      // Keep existing onLogin callback (for backward compatibility)
      if (onLogin) {
        onLogin(result.data.userId, result.data.name);
      }

      // ✅ Redirect after login
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ⬇️ The rest of your UI stays 100% unchanged ⬇️
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-yellow-200 to-amber-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated background blur effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Login Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200 p-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-red-900 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-red-800 text-sm">Enter your PIN to continue</p>
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = value.replace(/\D/g, "");
                  setPin(numericValue);
                  setError("");
                }}
                placeholder="******"
                className="w-full px-6 py-4 bg-white/60 backdrop-blur-sm border-2 border-amber-300 rounded-2xl text-red-900 text-center text-2xl tracking-widest placeholder-red-800/40 focus:outline-none focus:border-red-800 focus:bg-white/80 transition-all duration-300"
                autoFocus
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < pin.length ? "bg-red-800 scale-125" : "bg-amber-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 bg-white border border-red-500 rounded-xl p-3 animate-shake">
              <svg
                className="w-5 h-5 text-red-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading || pin.length !== 6}
            className="w-full bg-linear-to-r from-red-900 to-red-800 text-white font-semibold py-4 rounded-2xl hover:shadow-lg hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-red-800 text-xs">
              Need help? Contact your administrator
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-red-900/60 text-xs">
            Secure employee access portal
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
