import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await axios.post('/api/auth/register', { username, email, password });
        setError('✅ Аккаунт создан! Теперь войдите');
        setUsername('');
        setPassword('');
        setEmail('');
        setIsRegister(false);
      } else {
        response = await axios.post('/api/auth/login', { username, password });
        localStorage.setItem('token', response.data.token);
        onLogin();
        window.location.href = '/admin';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h2>🔐 Вход в админку</h2>
        {error && <div className={`alert ${error.includes('✅') ? 'alert-success' : 'alert-error'}`}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {isRegister && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : (isRegister ? 'Создать аккаунт' : 'Войти')}
          </button>
        </form>

        <p className="toggle-link">
          {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="link-btn">
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
