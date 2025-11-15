import { useState } from "react";

export default function SignupView() {
  const [form, setForm] = useState({ name: "", email: "", pin: "" });
  const [errors, setErrors] = useState({ name: "", email: "", pin: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePin = (pin) => {
    if (!pin) {
      return "PIN is required";
    }
    if (!/^\d+$/.test(pin)) {
      return "PIN must contain only numbers";
    }
    if (pin.length !== 6) {
      return "PIN must be exactly 6 digits";
    }
    return "";
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error for this field when user starts typing
    setErrors({ ...errors, [field]: "" });
    setMessage("");
    setIsSuccess(false);
  };

  const validateForm = () => {
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const pinError = validatePin(form.pin);

    setErrors({
      name: nameError,
      email: emailError,
      pin: pinError,
    });

    return !nameError && !emailError && !pinError;
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    const { name, email, pin } = form;

    setIsLoading(true);
    setMessage("");

    try {
      // const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, pin }),
      });
      
      
      if (!res.ok) {
        const errorText = await res.text(); // fallback for non-JSON errors
        throw new Error(`Signup failed: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();

      setIsSuccess(true);
      setMessage(data.message || "Account created successfully!");
      
      // Clear form after successful signup
      setTimeout(() => {
        setForm({ name: "", email: "", pin: "" });
      }, 2000);
      
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-yellow-200 to-amber-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated background blur effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Signup Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200 p-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-red-900 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-900 mb-2">Create Account</h1>
            <p className="text-red-800 text-sm">Join our team today</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-red-900 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl text-red-900 placeholder-red-800/40 focus:outline-none focus:bg-white/80 transition-all duration-300 ${
                  errors.name ? 'border-red-500 focus:border-red-600' : 'border-amber-300 focus:border-red-800'
                }`}
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-xs">{errors.name}</p>
                </div>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-red-900 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl text-red-900 placeholder-red-800/40 focus:outline-none focus:bg-white/80 transition-all duration-300 ${
                  errors.email ? 'border-red-500 focus:border-red-600' : 'border-amber-300 focus:border-red-800'
                }`}
              />
              {errors.email && (
                <div className="flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-xs">{errors.email}</p>
                </div>
              )}
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-red-900 text-sm font-medium mb-2">
                6-Digit PIN
              </label>
              <input
                type="password"
                placeholder="******"
                maxLength={6}
                value={form.pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleInputChange("pin", value);
                }}
                
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl text-red-900 text-center text-xl tracking-widest placeholder-red-800/40 focus:outline-none focus:bg-white/80 transition-all duration-300 ${
                  errors.pin ? 'border-red-500 focus:border-red-600' : 'border-amber-300 focus:border-red-800'
                }`}
                autoComplete="new-password" // More specific way to disable autofill for password inputs
                autoCorrect="off"
                autoCapitalize="off"
              />
              
              {/* PIN Progress indicators */}
              <div className="flex justify-center gap-2 mt-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < form.pin.length
                        ? 'bg-red-800 scale-125'
                        : 'bg-amber-300'
                    }`}
                  />
                ))}
              </div>

              {errors.pin && (
                <div className="flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-xs">{errors.pin}</p>
                </div>
              )}
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mt-6 flex items-center gap-2 border rounded-xl p-3 ${
              isSuccess 
                ? 'bg-green-500/20 border-green-500/30' 
                : 'bg-red-500/20 border-red-500/30 animate-shake'
            }`}>
              <svg className={`w-5 h-5 shrink-0 ${isSuccess ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSuccess ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-600'}`}>{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-6 bg-linear-to-r from-red-900 to-red-800 text-white font-semibold py-4 rounded-2xl hover:shadow-lg hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-red-800 text-xs">
              Already have an account? <a href="/login" className="font-semibold underline hover:text-red-900">Sign in</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-red-900/60 text-xs">Secure employee registration</p>
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