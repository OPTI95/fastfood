import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function NavBar({ isAdminLoggedIn, onLogout }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">Coal.</Link>
        <div className="nav-links">
          {isAdminPage ? (
            // На страницах админки показываем управление
            <>
              <Link to="/">← Магазин</Link>
              {isAdminLoggedIn && (
                <button className="logout-btn" onClick={onLogout}>Выйти</button>
              )}
            </>
          ) : (
            // На клиентском сайте — никаких ссылок на админку
            null
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('token'));

  // Cart persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('coal_cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('coal_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAdminLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <Router>
      <NavBar isAdminLoggedIn={isAdminLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Shop cart={cart} setCart={setCart} />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} />
        <Route path="/admin" element={isAdminLoggedIn ? <Admin /> : <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} />
      </Routes>
    </Router>
  );
}

export default App;
