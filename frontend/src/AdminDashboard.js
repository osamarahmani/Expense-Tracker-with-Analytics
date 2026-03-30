import { useState, useEffect } from "react";
import API from "./api";

export default function AdminDashboard({ token, userName, onLogout }) {
  const [tab,        setTab]       = useState("users");
  const [users,      setUsers]     = useState([]);
  const [selUser,    setSelUser]   = useState(null);
  const [report,     setReport]    = useState(null);
  const [repLoading, setRepLoading]= useState(false);
  const [form,       setForm]      = useState({ name: "", email: "", password: "" });
  const [msg,        setMsg]       = useState({ text: "", ok: true });
  const [creating,   setCreating]  = useState(false);
  const [deletingId, setDeletingId]= useState(null);

  const H = { Authorization: token };

  const loadUsers = async () => {
    try {
      const r = await API.get("/admin/users", { headers: H });
      setUsers(r.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setMsg({ text: "Please fill in all three fields.", ok: false }); return;
    }
    if (form.password.length < 4) {
      setMsg({ text: "Password must be at least 4 characters.", ok: false }); return;
    }
    setCreating(true);
    try {
      await API.post("/admin/users", form, { headers: H });
      setMsg({ text: `✅ User "${form.name}" created successfully!`, ok: true });
      setForm({ name: "", email: "", password: "" });
      loadUsers();
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "❌ Failed to create user.", ok: false });
    } finally {
      setCreating(false);
      setTimeout(() => setMsg({ text: "", ok: true }), 4000);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"? All their data will be removed.`)) return;
    setDeletingId(user.id);
    try {
      await API.delete(`/admin/users/${user.id}`, { headers: H });
      loadUsers();
      if (selUser?.id === user.id) { setSelUser(null); setReport(null); }
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete user.");
    } finally { setDeletingId(null); }
  };

  const viewReport = async (user) => {
    setSelUser(user); setReport(null); setRepLoading(true); setTab("report");
    try {
      const r = await API.get(`/admin/reports/${user.id}`, { headers: H });
      setReport(r.data);
    } catch (e) {
      setReport({ error: e.response?.data?.message || "Could not load report." });
    } finally { setRepLoading(false); }
  };

  const navItems = [
    { id: "users",  icon: "👥", label: "All Users"   },
    { id: "create", icon: "+",  label: "Create User"  },
    { id: "report", icon: "◎",  label: "User Report"  },
  ];

  return (
    <div className="shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sb-brand">
          <span className="sb-mark">₹</span>
          <span className="sb-name">FinTrack</span>
        </div>
        <div className="sb-user">
          <div className="sb-avatar sb-admin-av">{userName?.[0]?.toUpperCase()}</div>
          <div>
            <div className="sb-uname">{userName}</div>
            <div className="sb-urole sb-admin-role">Administrator</div>
          </div>
        </div>
        <nav className="sb-nav">
          {navItems.map(n => (
            <button key={n.id} className={`sb-link ${tab === n.id ? "sb-active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="sb-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <button className="sb-logout" onClick={onLogout}>⏻ Logout</button>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* ═══ ALL USERS ═══ */}
        {tab === "users" && (
          <div className="page fade">
            <div className="ph">
              <div><h2 className="pt">All Users</h2><p className="ps">{users.length} registered member{users.length !== 1 ? "s" : ""}</p></div>
              <button className="btn-primary" style={{width:"auto",padding:"0.6rem 1.2rem"}} onClick={() => setTab("create")}>
                + Create User
              </button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.length === 0 && <tr><td colSpan={5} className="no-rows">No users yet.</td></tr>}
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="tid">{u.id}</td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                          <div className="tav">{u.name[0].toUpperCase()}</div>{u.name}
                        </div>
                      </td>
                      <td style={{color:"#7a8ba8"}}>{u.email}</td>
                      <td><span className={`badge ${u.role === "ADMIN" ? "b-y" : "b-b"}`}>{u.role}</span></td>
                      <td>
                        {u.role !== "ADMIN" && (
                          <div style={{display:"flex",gap:"0.5rem"}}>
                            <button className="view-btn" onClick={() => viewReport(u)}>
                              View Report
                            </button>
                            <button
                              className="del-user-btn"
                              onClick={() => handleDeleteUser(u)}
                              disabled={deletingId === u.id}
                            >
                              {deletingId === u.id ? "…" : "🗑 Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ CREATE USER ═══ */}
        {tab === "create" && (
          <div className="page fade">
            <div className="ph"><div><h2 className="pt">Create User</h2><p className="ps">Add a new member to the system</p></div></div>
            <div className="form-card">
              <div className="fg">
                <label className="fl">Full Name</label>
                <input className="fi" placeholder="Vishnu Prakash" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="fg">
                <label className="fl">Email Address</label>
                <input className="fi" type="email" placeholder="user@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="fg">
                <label className="fl">Password</label>
                <input className="fi" type="password" placeholder="Min. 4 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              {msg.text && <div className={`msg ${msg.ok ? "msg-ok" : "msg-err"}`}>{msg.text}</div>}
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create User"}
              </button>
            </div>
          </div>
        )}

        {/* ═══ USER REPORT ═══ */}
        {tab === "report" && (
          <div className="page fade">
            <div className="ph">
              <div>
                <h2 className="pt">{selUser ? `${selUser.name}'s Report` : "User Report"}</h2>
                <p className="ps">{selUser?.email || "Select a user from the Users tab"}</p>
              </div>
              {selUser && <button className="btn-outline" onClick={() => { setSelUser(null); setTab("users"); }}>← Back</button>}
            </div>

            {!selUser && (
              <div className="empty-state">
                <p>No user selected.</p>
                <button className="btn-primary" style={{marginTop:"1rem",width:"auto",padding:"0.6rem 1.2rem"}} onClick={() => setTab("users")}>
                  Go to Users →
                </button>
              </div>
            )}

            {selUser && repLoading && <div className="empty-state"><p>Loading report…</p></div>}

            {selUser && report && !repLoading && !report.error && (
              <>
                <div className="stats">
                  <div className="sc sc-r"><div className="sl">Total Expenses</div><div className="sv">₹{(report.totalExpense||0).toLocaleString()}</div></div>
                  <div className="sc sc-g"><div className="sl">Total Income</div><div className="sv">₹{(report.totalIncome||0).toLocaleString()}</div></div>
                  <div className="sc sc-y"><div className="sl">Transactions</div><div className="sv">{report.transactionCount}</div></div>
                </div>
                <div className="tbl-wrap" style={{marginTop:"1.5rem"}}>
                  <table className="tbl">
                    <thead>
                      <tr><th>Date</th><th>Description</th><th>Amount</th><th>Type</th><th>Category</th></tr>
                    </thead>
                    <tbody>
                      {report.transactions.length === 0 && <tr><td colSpan={5} className="no-rows">No transactions for this user.</td></tr>}
                      {report.transactions.map(t => (
                        <tr key={t.id}>
                          <td className="tdate">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                          <td style={{color:"var(--text)"}}>{t.description || "—"}</td>
                          <td className={t.type === "income" ? "amt-g" : "amt-r"}>₹{t.amount.toLocaleString()}</td>
                          <td><span className={`badge ${t.type === "income" ? "b-g" : "b-r"}`}>{t.type}</span></td>
                          <td>{t.category?.name || t.categoryId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {selUser && report?.error && (
              <div className="empty-state"><p style={{color:"#ff4d6a"}}>{report.error}</p></div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
