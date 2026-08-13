import React, { useState } from 'react';
import { authService } from '../services/authService';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    const user = authService.login(username.trim());
    onLoginSuccess(user);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h2>🔑 Iniciar Sesión</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Ingresa <b>admin</b> para panel administrador o cualquier otro nombre (ej: <b>Saul</b>) como Cliente.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}