import { useState, useEffect } from "react";
import API from "./api";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = ["#f5a623","#00d68f","#4d9fff","#ff4d6a","#9b6dff","#06b6d4","#f97316","#ec4899"];

export default function UserDashboard({ token, userName, onLogout }) {
  const [tab,          setTab]         = useState("dashboard");
  const [transactions, setTransactions]= useState([]);
  const [allCategories,setAllCategories]=useState([]);
  const [catReport,    setCatReport]   = useState([]);
  const [monthReport,  setMonthReport] = useState([]);
  const [totalExpense, setTotalExpense]= useState(0);
  const [totalIncome,  setTotalIncome] = useState(0);
  const [lentRecords,  setLentRecords] = useState([]);

  // Add transaction form
  const [form, setForm] = useState({ amount: "", type: "expense", categoryId: "", description: "", date: today() });
  const [msg,  setMsg]  = useState({ text: "", ok: true });
  const [addLoading, setAddLoading] = useState(false);

  // Add lent form
  const [lentForm, setLentForm] = useState({ person: "", amount: "", date: today(), note: "" });
  const [lentMsg,  setLentMsg]  = useState({ text: "", ok: true });
  const [lentLoading, setLentLoading] = useState(false);

  const H = { Authorization: token };

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  const loadAll = async () => {
    try {
      const [txR, catR, catRepR, monthR, totExpR, totIncR, lentR] = await Promise.allSettled([
        API.get("/transactions",     { headers: H }),
        API.get("/categories",       { headers: H }),
        API.get("/reports/category", { headers: H }),
        API.get("/reports/monthly",  { headers: H }),
        API.get("/reports/total",    { headers: H }),
        API.get("/reports/income",   { headers: H }),
        API.get("/lent",             { headers: H }),
      ]);
      if (txR.status     === "fulfilled") setTransactions(txR.value.data);
      if (catR.status    === "fulfilled") setAllCategories(catR.value.data);
      if (catRepR.status === "fulfilled") setCatReport(catRepR.value.data);
      if (monthR.status  === "fulfilled") setMonthReport(monthR.value.data);
      if (totExpR.status === "fulfilled") setTotalExpense(totExpR.value.data._sum?.amount || 0);
      if (totIncR.status === "fulfilled") setTotalIncome(totIncR.value.data._sum?.amount  || 0);
      if (lentR.status   === "fulfilled") setLentRecords(lentR.value.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAll(); }, []);

  // Filter categories by current transaction type
  const filteredCategories = allCategories.filter(c => c.type === form.type);
  const catName = (id) => {
    const c = allCategories.find(c => c.id === id || c.id === parseInt(id));
    return c ? c.name : `Category ${id}`;
  };

  // When type changes, reset categoryId
  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, categoryId: "" }));
  };

  const handleAdd = async () => {
    if (!form.amount || !form.categoryId || !form.description) {
      setMsg({ text: "Please fill in Amount, Description and Category.", ok: false }); return;
    }
    setAddLoading(true);
    try {
      await API.post("/transactions",
        { amount: parseFloat(form.amount), type: form.type, categoryId: parseInt(form.categoryId), description: form.description, date: form.date },
        { headers: H }
      );
      setMsg({ text: "✅ Transaction added successfully!", ok: true });
      setForm({ amount: "", type: "expense", categoryId: "", description: "", date: today() });
      loadAll();
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "❌ Failed to add.", ok: false });
    } finally {
      setAddLoading(false);
      setTimeout(() => setMsg({ text: "", ok: true }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`, { headers: H });
      loadAll();
    } catch { alert("Could not delete."); }
  };

  const handleExport = () => {
    fetch("http://localhost:5000/api/reports/export", { headers: H })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "transactions.csv"; a.click();
        URL.revokeObjectURL(url);
      });
  };

  // Lent handlers
  const handleAddLent = async () => {
    if (!lentForm.person || !lentForm.amount) {
      setLentMsg({ text: "Person name and amount are required.", ok: false }); return;
    }
    setLentLoading(true);
    try {
      await API.post("/lent", lentForm, { headers: H });
      setLentMsg({ text: "✅ Lent record added!", ok: true });
      setLentForm({ person: "", amount: "", date: today(), note: "" });
      loadAll();
    } catch (e) {
      setLentMsg({ text: e.response?.data?.message || "❌ Failed to add.", ok: false });
    } finally {
      setLentLoading(false);
      setTimeout(() => setLentMsg({ text: "", ok: true }), 3000);
    }
  };

  const handleMarkReturned = async (id) => {
    try {
      await API.patch(`/lent/${id}/returned`, {}, { headers: H });
      loadAll();
    } catch { alert("Could not update."); }
  };

  const handleDeleteLent = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await API.delete(`/lent/${id}`, { headers: H });
      loadAll();
    } catch { alert("Could not delete."); }
  };

  const balance = (totalIncome || 0) - (totalExpense || 0);
  const pendingLent = lentRecords.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0);

  const pieData = {
    labels:   catReport.map(c => catName(c.categoryId)),
    datasets: [{ data: catReport.map(c => c._sum.amount), backgroundColor: COLORS, borderWidth: 0 }],
  };
  const barData = {
    labels:   monthReport.map(m => new Date(m.month).toLocaleString("default", { month: "short", year: "2-digit" })),
    datasets: [{ label: "₹ Spent", data: monthReport.map(m => Number(m.total)), backgroundColor: "#f5a623", borderRadius: 6 }],
  };
  const chartOpts = {
    plugins: { legend: { labels: { color: "#94a3b8", font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "#1a2540" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "#1a2540" } },
    },
  };

  const navItems = [
    { id: "dashboard",    icon: "⊞", label: "Dashboard"       },
    { id: "transactions", icon: "↕", label: "Transactions"     },
    { id: "add",          icon: "+", label: "Add Transaction"  },
    { id: "lent",         icon: "🤝", label: "Lent Money"      },
    { id: "reports",      icon: "◎", label: "Reports"          },
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
          <div className="sb-avatar">{userName?.[0]?.toUpperCase()}</div>
          <div>
            <div className="sb-uname">{userName}</div>
            <div className="sb-urole">Member</div>
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

        {/* ═══ DASHBOARD ═══ */}
        {tab === "dashboard" && (
          <div className="page fade">
            <div className="ph">
              <div><h2 className="pt">Overview</h2><p className="ps">Hello, {userName} 👋</p></div>
            </div>
            <div className="stats">
              <div className="sc sc-g"><div className="sl">Total Income</div><div className="sv">₹{(totalIncome||0).toLocaleString()}</div></div>
              <div className="sc sc-r"><div className="sl">Total Expenses</div><div className="sv">₹{(totalExpense||0).toLocaleString()}</div></div>
              <div className={`sc ${balance >= 0 ? "sc-b" : "sc-r"}`}><div className="sl">Net Balance</div><div className="sv">₹{balance.toLocaleString()}</div></div>
              <div className="sc sc-y"><div className="sl">Lent (Pending)</div><div className="sv">₹{pendingLent.toLocaleString()}</div></div>
            </div>
            <div className="charts">
              <div className="cc">
                <h3 className="ct">Category Breakdown</h3>
                {catReport.length > 0
                  ? <div className="pie-wrap"><Pie data={pieData} options={{ plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } } }} /></div>
                  : <div className="no-data">Add transactions to see chart</div>}
              </div>
              <div className="cc">
                <h3 className="ct">Monthly Expenses</h3>
                {monthReport.length > 0
                  ? <Bar data={barData} options={chartOpts} />
                  : <div className="no-data">Add transactions to see chart</div>}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TRANSACTIONS ═══ */}
        {tab === "transactions" && (
          <div className="page fade">
            <div className="ph">
              <div><h2 className="pt">Transactions</h2><p className="ps">{transactions.length} records</p></div>
              <button className="btn-outline" onClick={handleExport}>⬇ Export CSV</button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>#</th><th>Date</th><th>Description</th><th>Amount</th><th>Type</th><th>Category</th><th></th></tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && <tr><td colSpan={7} className="no-rows">No transactions yet — add one!</td></tr>}
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td className="tid">{t.id}</td>
                      <td className="tdate">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                      <td style={{color:"var(--text)",maxWidth:"180px"}}>{t.description || "—"}</td>
                      <td className={t.type === "income" ? "amt-g" : "amt-r"}>
                        {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString()}
                      </td>
                      <td><span className={`badge ${t.type === "income" ? "b-g" : "b-r"}`}>{t.type}</span></td>
                      <td>{t.category?.name || catName(t.categoryId)}</td>
                      <td>
                        <button className="del-btn" onClick={() => handleDelete(t.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ ADD TRANSACTION ═══ */}
        {tab === "add" && (
          <div className="page fade">
            <div className="ph"><div><h2 className="pt">Add Transaction</h2><p className="ps">Record income or expense</p></div></div>
            <div className="form-card">
              {/* Type Toggle */}
              <div className="type-row">
                <button className={`type-btn ${form.type === "expense" ? "t-red" : ""}`} onClick={() => handleTypeChange("expense")}>💸 Expense</button>
                <button className={`type-btn ${form.type === "income"  ? "t-grn" : ""}`} onClick={() => handleTypeChange("income") }>💰 Income</button>
              </div>

              {/* Description */}
              <div className="fg">
                <label className="fl">Description</label>
                <input className="fi" placeholder="e.g. Lunch at restaurant" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              {/* Amount */}
              <div className="fg">
                <label className="fl">Amount (₹)</label>
                <input className="fi" type="number" placeholder="0.00" value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})} />
              </div>

              {/* Date */}
              <div className="fg">
                <label className="fl">Date</label>
                <input className="fi" type="date" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>

              {/* Category - filtered by type */}
              <div className="fg">
                <label className="fl">Category</label>
                <select className="fi" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                  <option value="">Select a category</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {msg.text && <div className={`msg ${msg.ok ? "msg-ok" : "msg-err"}`}>{msg.text}</div>}

              <button className="btn-primary" onClick={handleAdd} disabled={addLoading}>
                {addLoading ? "Adding…" : "Add Transaction"}
              </button>
            </div>
          </div>
        )}

        {/* ═══ LENT MONEY ═══ */}
        {tab === "lent" && (
          <div className="page fade">
            <div className="ph">
              <div><h2 className="pt">Lent Money</h2><p className="ps">Track money you've lent to others</p></div>
            </div>

            {/* Add Lent Form */}
            <div className="form-card" style={{marginBottom:"1.5rem"}}>
              <h3 className="ct" style={{marginBottom:"0.5rem"}}>Add New Record</h3>

              <div className="two-col">
                <div className="fg">
                  <label className="fl">Person Name</label>
                  <input className="fi" placeholder="e.g. Rahul" value={lentForm.person}
                    onChange={e => setLentForm({...lentForm, person: e.target.value})} />
                </div>
                <div className="fg">
                  <label className="fl">Amount (₹)</label>
                  <input className="fi" type="number" placeholder="0.00" value={lentForm.amount}
                    onChange={e => setLentForm({...lentForm, amount: e.target.value})} />
                </div>
              </div>

              <div className="fg">
                <label className="fl">Date</label>
                <input className="fi" type="date" value={lentForm.date}
                  onChange={e => setLentForm({...lentForm, date: e.target.value})} />
              </div>

              <div className="fg">
                <label className="fl">Note (Optional)</label>
                <input className="fi" placeholder="e.g. For medical emergency" value={lentForm.note}
                  onChange={e => setLentForm({...lentForm, note: e.target.value})} />
              </div>

              {lentMsg.text && <div className={`msg ${lentMsg.ok ? "msg-ok" : "msg-err"}`}>{lentMsg.text}</div>}

              <button className="btn-primary" onClick={handleAddLent} disabled={lentLoading}>
                {lentLoading ? "Adding…" : "Add Lent Record"}
              </button>
            </div>

            {/* Summary */}
            <div className="stats" style={{marginBottom:"1.5rem"}}>
              <div className="sc sc-y">
                <div className="sl">Total Lent</div>
                <div className="sv">₹{lentRecords.reduce((s,r) => s+r.amount, 0).toLocaleString()}</div>
              </div>
              <div className="sc sc-r">
                <div className="sl">Pending</div>
                <div className="sv">₹{lentRecords.filter(r=>r.status==="pending").reduce((s,r)=>s+r.amount,0).toLocaleString()}</div>
              </div>
              <div className="sc sc-g">
                <div className="sl">Returned</div>
                <div className="sv">₹{lentRecords.filter(r=>r.status==="returned").reduce((s,r)=>s+r.amount,0).toLocaleString()}</div>
              </div>
            </div>

            {/* Lent Table */}
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Person</th><th>Amount</th><th>Date</th><th>Note</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {lentRecords.length === 0 && <tr><td colSpan={6} className="no-rows">No lent records yet.</td></tr>}
                  {lentRecords.map(r => (
                    <tr key={r.id}>
                      <td style={{fontWeight:600}}>{r.person}</td>
                      <td className="amt-y">₹{r.amount.toLocaleString()}</td>
                      <td className="tdate">{new Date(r.date).toLocaleDateString("en-IN")}</td>
                      <td style={{color:"var(--muted2)",fontSize:"0.82rem"}}>{r.note || "—"}</td>
                      <td>
                        <span className={`badge ${r.status === "returned" ? "b-g" : "b-y"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{display:"flex",gap:"0.5rem"}}>
                        {r.status === "pending" && (
                          <button className="view-btn" onClick={() => handleMarkReturned(r.id)}>✓ Returned</button>
                        )}
                        <button className="del-btn" onClick={() => handleDeleteLent(r.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ REPORTS ═══ */}
        {tab === "reports" && (
          <div className="page fade">
            <div className="ph">
              <div><h2 className="pt">Reports & Analytics</h2><p className="ps">Your financial insights</p></div>
              <button className="btn-outline" onClick={handleExport}>⬇ Export CSV</button>
            </div>
            <div className="charts">
              <div className="cc">
                <h3 className="ct">Spending by Category</h3>
                {catReport.length > 0
                  ? <div className="pie-wrap"><Pie data={pieData} options={{ plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } } }} /></div>
                  : <div className="no-data">No expense data yet</div>}
              </div>
              <div className="cc">
                <h3 className="ct">Monthly Trend</h3>
                {monthReport.length > 0
                  ? <Bar data={barData} options={chartOpts} />
                  : <div className="no-data">No monthly data yet</div>}
              </div>
            </div>
            <div className="tbl-wrap" style={{marginTop:"1.5rem"}}>
              <h3 className="ct" style={{padding:"1rem 1.5rem 0.5rem"}}>Category Details</h3>
              <table className="tbl">
                <thead><tr><th>Category</th><th>Total Spent</th></tr></thead>
                <tbody>
                  {catReport.length === 0 && <tr><td colSpan={2} className="no-rows">No data</td></tr>}
                  {catReport.map(c => (
                    <tr key={c.categoryId}>
                      <td>{catName(c.categoryId)}</td>
                      <td className="amt-r">₹{c._sum.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
