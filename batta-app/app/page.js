"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, X, Eye, EyeOff, LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Listen for the CustomEvent fired by BottomNavBar on home page
  useEffect(() => {
    const openLogin = () => { setError(""); setShowLogin(true); };
    window.addEventListener("batta:openLogin", openLogin);
    return () => window.removeEventListener("batta:openLogin", openLogin);
  }, []);

  // Intercept any nav click → open login modal instead
  const handleNavClick = (e) => {
    e.preventDefault();
    setError("");
    setShowLogin(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pass: password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/analytics");
      } else {
        setError(data.message || "Wrong ID or Password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ─── Background image ─── */}
      <div className="relative w-full h-[calc(100dvh-4rem)] bg-black overflow-hidden">
        <Image
          src="/images/sk-bricks.jpg"
          alt="SK Bricks"
          fill
          priority
          className="object-cover opacity-80"
        />

        {/* Subtle gradient overlay so button reads clearly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* ─── Login button ─── */}
        <button
          onClick={() => { setError(""); setShowLogin(true); }}
          className="
            absolute bottom-20 left-1/2 -translate-x-1/2 z-10
            flex items-center gap-2
            px-7 py-3 rounded-full
            bg-white/10 backdrop-blur-md
            border border-white/25
            text-white font-semibold text-sm tracking-wide
            shadow-[0_4px_24px_rgba(0,0,0,0.4)]
            hover:bg-white/20 active:scale-95
            transition-all duration-200
          "
        >
          <LogIn size={16} strokeWidth={2.2} />
          Login
        </button>
      </div>

      {/* ─── Login Modal ─── */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
        >
          <div
            className="
              w-full max-w-sm rounded-2xl overflow-hidden
              shadow-[0_24px_64px_rgba(0,0,0,0.6)]
            "
            style={{
              background: "linear-gradient(145deg, #1a1f2e 0%, #111827 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div>
                <h2 className="text-white text-xl font-bold tracking-tight">
                  Batta Factory
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Enter your credentials to continue
                </p>
              </div>
              <button
                onClick={() => setShowLogin(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 my-4 border-t border-white/[0.07]" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {/* ID field */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wide uppercase">
                  User ID
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Enter your ID"
                    autoComplete="username"
                    required
                    className="
                      w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                      bg-white/[0.06] border border-white/[0.1]
                      text-white placeholder-gray-600
                      focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.09]
                      transition-all duration-150
                    "
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="
                      w-full pl-9 pr-10 py-2.5 rounded-xl text-sm
                      bg-white/[0.06] border border-white/[0.1]
                      text-white placeholder-gray-600
                      focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.09]
                      transition-all duration-150
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 rounded-xl
                  bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
                  text-white font-semibold text-sm tracking-wide
                  shadow-[0_4px_16px_rgba(59,130,246,0.35)]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={16} strokeWidth={2.2} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Nav-intercept overlay (invisible, covers BottomNavBar area) ─── */}
      {/*
        The BottomNavBar is rendered in layout.js and sits outside this component.
        We intercept clicks via the handleNavClick prop pattern by overriding the
        nav links only on the home page using a transparent click-capture layer
        positioned over the bottom nav bar.
      */}
      <div
        className="fixed bottom-0 left-0 right-0 h-16 z-[60] cursor-pointer"
        onClick={handleNavClick}
        title="Please sign in to access this section"
      />
    </>
  );
}