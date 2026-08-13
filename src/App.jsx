import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import BasketManager from './components/BasketManager';
import { authService } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Al cargar, verificamos si ya hay una sesión guardada
  useEffect(() => {
    const loggedInUser = authService.getCurrentUser();
    if (loggedInUser) setCurrentUser(loggedInUser);
  }, []);

  // Si no hay usuario, mostramos la pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} />;
  }

  // Si hay usuario, mostramos la App Principal
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Barra de Navegación Superior */}
      <nav style={{ padding: '15px 30px', backgroundColor: '#1a1a2e', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0 }}>🛒 MicroserviceApp</h2>
        <div>
          <span>
  👤 {currentUser?.username || currentUser?.name || currentUser?.email || 'Usuario'} 
  {currentUser?.role === 'admin' ? ' (Admin)' : ' (Cliente)'}
</span>
          <button 
            onClick={() => { authService.logout(); setCurrentUser(null); }}
            style={{ padding: '8px 16px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenedor Principal */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {/* Le pasamos el usuario logueado al administrador del carrito/tienda */}
        <BasketManager currentUser={currentUser} />
      </div>
    </div>
  );
}