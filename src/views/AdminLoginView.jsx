import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginView() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // 1. New state for the 8-digit PIN input
  const [pin, setPin] = useState('');

  // 2. Updated login handler for PIN authentication
  const handleAdminLogin = async () => {
    if (pin.length !== 8 || !pin) {
      setError('The PIN must be exactly 8 digits.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // **Placeholder for your actual backend API call**
      // Replace with your endpoint and method (e.g., fetch or axios POST)
      // const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`/api/auth/pin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const result = await response.json();

      if (response.ok) {
        
        const { role, name } = result.data; 
        
        // Save session data and redirect
        localStorage.setItem('session', JSON.stringify({ role: role, name: name}));
        window.location.reload();
        navigate('/admin', { replace: true });
      } else {
        // Handle API error messages
        const errorMessage = result.data.message || 'Invalid PIN. Please try again.';
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('A connection error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // 3. Removed the useEffect logic for handling URL params (OAuth response)

  // --- UI/UX Changes for PIN Input ---
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-yellow-200 to-amber-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated background blur effect (Kept for style) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Admin Login Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200 p-8">
          {/* Logo/Icon (Kept for style) */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-linear-to-br from-red-900 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-900 mb-2">Admin Portal</h1>
            <p className="text-red-800 text-sm">Secure administrative access</p>
          </div>

          {/* Info Box - Updated for PIN */}
          <div className="mb-6 bg-amber-100 border border-amber-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v5.5a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zM11 16v-3m2 3v-3" />
              </svg>
              <div>
                <p className="text-amber-900 text-sm font-medium mb-1">Administrator Login</p>
                <p className="text-amber-800 text-xs">Enter your **8-digit administrator PIN** to access the dashboard.</p>
              </div>
            </div>
          </div>

          {/* Error Message (Kept for error display) */}
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl p-3 animate-shake">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* PIN Input Field */}
          <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
            <div className="mb-6">
              <label htmlFor="pin" className="block text-sm font-medium text-red-900 mb-2">8-Digit PIN</label>
              <input
                id="pin"
                type="password" // Use password type to hide the input
                maxLength={8}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').substring(0, 8))} // Only allow digits and max 8
                required
                className="w-full text-center font-mono text-xl text-red-900 bg-gray-50 border border-red-300 rounded-xl py-4 px-3 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="********"
                disabled={isLoading}
                autoComplete="new-password" // More specific way to disable autofill for password inputs
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || pin.length !== 8}
              className="w-full bg-linear-to-r from-red-900 to-red-800 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-md group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Action Button (Kept) */}
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-red-900 font-semibold py-4 rounded-2xl hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Employee Login</span>
          </button>

          {/* Additional Info (Kept) */}
          <div className="mt-6 text-center">
            <p className="text-red-800 text-xs">
              Only authorized administrators can access this portal
            </p>
          </div>
        </div>

        {/* Footer (Kept) */}
        <div className="text-center mt-6">
          <p className="text-red-900/60 text-xs">PIN authentication required</p>
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