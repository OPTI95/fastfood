import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="logo">🍔 FastFood</Link>
          <div className="nav-links">
            <Link to="/">Магазин</Link>
            {isAdminLoggedIn ? (
              <>
                <Link to="/admin">Админка</Link>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  setIsAdminLoggedIn(false);
                  window.location.href = '/';
                }} className="logout-btn">Выход</button>
              </>
            ) : (
              <Link to="/admin-login">Админ</Link>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} />
        <Route path="/admin" element={isAdminLoggedIn ? <Admin /> : <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} />
      </Routes>
    </Router>
  );
}

export default App;
