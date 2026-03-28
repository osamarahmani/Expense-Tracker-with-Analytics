import { useState } from "react";
import API from "./api";

function Login({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const res   = await API.post("/auth/login", { email, password });
      const token = res.data.token;
      const role  = res.data.user.role;
      const name  = res.data.user.name;
      onLogin(token, role, name);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="blob blob1" /><div className="blob blob2" /><div className="blob blob3" />
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">₹</div>
          <h1 className="brand-title">FinTrack</h1>
          <p className="brand-sub">Finance Management System</p>
        </div>
        <div className="lf-group">
          <label className="lf-label">Email</label>
          <input className="lf-input" type="email" placeholder="admin@gmail.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div className="lf-group">
          <label className="lf-label">Password</label>
          <input className="lf-input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {error && <div className="lf-error">{error}</div>}
        <button className="lf-btn" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Sign In →"}
        </button>
        <p className="lf-note">Your account is created by the administrator.</p>
      </div>
    </div>
  );
}

export default Login;
