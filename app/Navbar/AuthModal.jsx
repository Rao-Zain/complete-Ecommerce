"use client";

import { useState } from "react";
import { FaTimes, FaSignInAlt, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";

const AuthModal = ({ activeModal, onClose }) => {
  const [mode, setMode] = useState(activeModal); // "login" | "register"
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regFieldErrors, setRegFieldErrors] = useState({});

  if (!activeModal) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        const userToken = data.data?.token || data.data?.access_token || data.token;
        const userName = data.data?.user?.name || data.data?.name || loginEmail.split("@")[0];
        const userEmail = data.data?.user?.email || data.data?.email || loginEmail;
        const userId = data.data?.user?.id ?? data.data?.id;

        if (!userToken || !userId) {
          setLoginError("Login succeeded, but credentials were not returned.");
          return;
        }

        localStorage.setItem("userId", String(userId));
        localStorage.setItem("token", userToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", userEmail);

        window.dispatchEvent(new Event("authUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
        onClose();
      } else {
        setLoginError(data.message || data.error || "Invalid credentials.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegFieldErrors({});
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegFieldErrors({ password_confirmation: "Passwords do not match" });
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          password_confirmation: regConfirmPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        const userToken = data.data?.token || data.token;
        const userName = data.data?.user?.name || data.name || regName;
        const userEmail = data.data?.user?.email || data.email || regEmail;
        const userId = data.data?.user?.id || data.id;

        localStorage.setItem("token", userToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("userId", String(userId));

        window.dispatchEvent(new Event("authUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
        onClose();
      } else {
        if (data.errors && typeof data.errors === "object") {
          const mapped = {};
          Object.keys(data.errors).forEach((k) => (mapped[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k]));
          setRegFieldErrors(mapped);
        } else {
          setRegError(data.message || "Registration failed.");
        }
      }
    } catch {
      setRegError("Network error. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-5 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition p-1">
          <FaTimes className="text-lg" />
        </button>

        {mode === "login" ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-gray-500 mt-1">Please enter your credentials to log in.</p>
            </div>
            {loginError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl text-center font-medium">{loginError}</div>}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 pr-11 focus:outline-none focus:border-blue-500"
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showLoginPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <FaSignInAlt /> <span>{loginLoading ? "Logging in..." : "Login"}</span>
              </button>
            </form>
            <div className="text-center mt-6 text-xs text-gray-500">
              Don't have an account?{" "}
              <button onClick={() => setMode("register")} className="text-[#10b981] font-semibold hover:underline">
                Create Account
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
              <p className="text-xs text-gray-500 mt-1">Fill in the details below to get started.</p>
            </div>
            {regError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl text-center font-medium">{regError}</div>}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
                {regFieldErrors.name && <p className="text-red-500 text-xs mt-1">{regFieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
                {regFieldErrors.email && <p className="text-red-500 text-xs mt-1">{regFieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 pr-11 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showRegPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {regFieldErrors.password && <p className="text-red-500 text-xs mt-1">{regFieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 pr-11 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showRegConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {regFieldErrors.password_confirmation && <p className="text-red-500 text-xs mt-1">{regFieldErrors.password_confirmation}</p>}
              </div>
              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <FaUserPlus /> <span>{regLoading ? "Creating..." : "Create Account"}</span>
              </button>
            </form>
            <div className="text-center mt-5 text-xs text-gray-500">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-[#10b981] font-semibold hover:underline">
                Login here
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;