import { useState } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import "./App.css";

function App() {
  const [token,    setToken]    = useState(localStorage.getItem("ft_token") || null);
  const [role,     setRole]     = useState(localStorage.getItem("ft_role")  || null);
  const [userName, setUserName] = useState(localStorage.getItem("ft_name")  || null);

  const handleLogin = (token, role, name) => {
    setToken(token); setRole(role); setUserName(name);
    localStorage.setItem("ft_token", token);
    localStorage.setItem("ft_role",  role);
    localStorage.setItem("ft_name",  name);
  };

  const handleLogout = () => {
    setToken(null); setRole(null); setUserName(null);
    localStorage.removeItem("ft_token");
    localStorage.removeItem("ft_role");
    localStorage.removeItem("ft_name");
  };

  if (!token)           return <Login onLogin={handleLogin} />;
  if (role === "ADMIN") return <AdminDashboard token={token} userName={userName} onLogout={handleLogout} />;
  return                       <UserDashboard  token={token} userName={userName} onLogout={handleLogout} />;
}

export default App;
