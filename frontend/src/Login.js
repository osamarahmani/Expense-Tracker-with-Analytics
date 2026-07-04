import { useState } from "react";
import API from "./api";

function Login({ onLogin }) {
  const [mode,     setMode]     = useState("login");   // "login" | "register"
  const [role,     setRole]     = useState("USER");    // "USER" | "ADMIN"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const reset = () => {
    setEmail(""); setPassword(""); setName("");
    setError(""); setSuccess("");
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    try {
      const res  = await API.post("/auth/login", { email, password });
      const token = res.data.token;
      const u     = res.data.user;
      onLogin(token, u.role, u.name);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
    setLoading(true); setError("");
    try {
      await API.post("/auth/register", { name, email, password });
      setSuccess("✅ Account created! You can now sign in.");
      setMode("login");
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  const onKey = (e) => {
    if (e.key === "Enter") mode === "login" ? handleLogin() : handleRegister();
  };

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="ll-logo">
          <span className="ll-mark">₹</span>
          <span className="ll-brand">FinTrack</span>
        </div>

        <div className="ll-body">
          {mode === "login" ? (
            <>
              <p className="ll-tag">MANAGE YOUR MONEY</p>
              <h2 className="ll-headline">
                Track every rupee,<br />
                <span className="ll-accent">grow your wealth.</span>
              </h2>
              <p className="ll-desc">
                Your personal finance dashboard — income, expenses, reports and more, all in one place.
              </p>
              <ul className="ll-features">
                <li>✦ Track income & expenses</li>
                <li>✦ Category-wise reports & charts</li>
                <li>✦ Monitor money you've lent</li>
              </ul>
            </>
          ) : (
            <>
              <p className="ll-tag">JOIN FINTRACK</p>
              <h2 className="ll-headline">
                Start your financial<br />
                <span className="ll-accent">journey today.</span>
              </h2>
              <p className="ll-desc">
                Create a free account and take control of your finances with powerful tools and insights.
              </p>
              <ul className="ll-features">
                <li>✦ Free to join, always</li>
                <li>✦ Instant access to all features</li>
                <li>✦ Secure & private</li>
              </ul>
            </>
          )}
        </div>

        <p className="ll-footer">© 2026 FinTrack. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="lr-card">

          {/* ── LOGIN MODE ── */}
          {mode === "login" && (
            <>
              <h2 className="lr-title">Welcome back</h2>
              <p className="lr-sub">Sign in to continue your journey</p>

              {/* Role Toggle */}
              <div className="role-toggle">
                <button className={`role-btn ${role === "USER" ? "role-active" : ""}`} onClick={() => setRole("USER")}>
                  User
                </button>
                <button className={`role-btn ${role === "ADMIN" ? "role-active" : ""}`} onClick={() => setRole("ADMIN")}>
                  Admin
                </button>
              </div>

              <div className="lf-group">
                <label className="lf-label">Email Address</label>
                <input className="lf-input" type="email" placeholder="name@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} />
              </div>

              <div className="lf-group">
                <label className="lf-label">Password</label>
                <input className="lf-input" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} />
              </div>

              {error   && <div className="lf-error">{error}</div>}
              {success && <div className="lf-success">{success}</div>}

              <button className="lf-btn" onClick={handleLogin} disabled={loading}>
                {loading ? <span className="btn-spinner" /> : `Sign in as ${role === "ADMIN" ? "Admin" : "User"} →`}
              </button>

              {role === "USER" && (
                <p className="lr-switch">
                  New here?{" "}
                  <button className="lr-link" onClick={() => { setMode("register"); reset(); }}>
                    Create an account
                  </button>
                </p>
              )}

              {role === "ADMIN" && (
                <p className="lr-note">Admin accounts are created by the system administrator.</p>
              )}
            </>
          )}

          {/* ── REGISTER MODE ── */}
          {mode === "register" && (
            <>
              <h2 className="lr-title">Create your account</h2>
              <p className="lr-sub">Free to join. Start tracking in minutes.</p>

              <div className="lf-group">
                <label className="lf-label">Full Name</label>
                <input className="lf-input" placeholder="Vishnu Prakash"
                  value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} />
              </div>

              <div className="lf-group">
                <label className="lf-label">Email Address</label>
                <input className="lf-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} />
              </div>

              <div className="lf-group">
                <label className="lf-label">Password</label>
                <input className="lf-input" type="password" placeholder="Min. 4 characters"
                  value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} />
              </div>

              {error   && <div className="lf-error">{error}</div>}
              {success && <div className="lf-success">{success}</div>}

              <button className="lf-btn" onClick={handleRegister} disabled={loading}>
                {loading ? <span className="btn-spinner" /> : "Create account →"}
              </button>

              <p className="lr-switch">
                Already have an account?{" "}
                <button className="lr-link" onClick={() => { setMode("login"); reset(); }}>
                  Sign in
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;
