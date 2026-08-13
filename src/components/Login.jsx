import React, { useState } from 'react';

// Usuarios por defecto iniciales
const DEFAULT_USERS = [
  { id: '1', username: 'Saul', email: 'saul@example.com', password: '123', role: 'customer' },
  { id: '2', username: 'admin', email: 'admin@example.com', password: '123', role: 'admin' }
];

export default function Login({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Campos de Login
  const [identifier, setIdentifier] = useState(''); // Puede ser usuario o correo
  const [password, setPassword] = useState('');

  // Campos de Registro
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Obtener lista global de usuarios almacenados
  const getUsersList = () => {
    const stored = localStorage.getItem('app_users_v1');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    localStorage.setItem('app_users_v1', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  };

  // 🔑 LÓGICA DE INICIO DE SESIÓN
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const users = getUsersList();
    const cleanId = identifier.trim().toLowerCase();

    // Buscar coincidencia por nombre de usuario O por correo
    const userFound = users.find(u => 
      (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
      u.password === password
    );

    if (userFound) {
      onLoginSuccess({
        username: userFound.username,
        email: userFound.email,
        role: userFound.role
      });
    } else {
      setErrorMsg('Usuario/Correo o contraseña incorrectos.');
    }
  };

  // 📝 LÓGICA DE REGISTRO
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsername || !regEmail || !regPassword) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    const users = getUsersList();
    const cleanUsername = regUsername.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    // Validar si ya existe el usuario o correo
    const exists = users.some(u => 
      u.username.toLowerCase() === cleanUsername.toLowerCase() || 
      u.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      setErrorMsg('El nombre de usuario o correo ya está registrado.');
      return;
    }

    // Crear nuevo usuario (Rol cliente por defecto)
    const newUser = {
      id: Date.now().toString(),
      username: cleanUsername,
      email: cleanEmail,
      password: regPassword,
      role: 'customer'
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('app_users_v1', JSON.stringify(updatedUsers));

    setSuccessMsg('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
    setIsRegisterMode(false);
    
    // Auto-llenar campos de login para comodidad
    setIdentifier(cleanEmail);
    setPassword(regPassword);

    // Limpiar campos de registro
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-6">
          <span className="text-4xl">🛒</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {isRegisterMode ? 'Crear Nueva Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="text-sm text-gray-500">
            {isRegisterMode ? 'Regístrate para comenzar a comprar' : 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        {/* MENSAJES DE ALERTA */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded mb-4 text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded mb-4 text-center">
            {successMsg}
          </div>
        )}

        {/* FORMULARIO DE LOGIN */}
        {!isRegisterMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario o Correo Electrónico
              </label>
              <input
                type="text"
                placeholder="ej: Saul o saul@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded text-sm shadow transition"
            >
              Entrar
            </button>
          </form>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                placeholder="ej: Carlos"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="carlos@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full p-2.5 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded text-sm shadow transition"
            >
              Registrar Cuenta
            </button>
          </form>
        )}

        {/* CAMBIAR ENTRE LOGIN Y REGISTRO */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
          {!isRegisterMode ? (
            <p>
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
                className="text-blue-600 font-bold hover:underline"
              >
                Crear cuenta aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
                className="text-green-600 font-bold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>

        {/* NOTA DE ACCESO RÁPIDO ADMIN */}
        <div className="mt-4 p-2 bg-gray-50 border rounded text-xs text-gray-500 text-center">
          <strong>Cuentas por defecto:</strong> <br />
          👤 Admin: <code>admin</code> / <code>123</code> <br />
          👤 Cliente: <code>Saul</code> / <code>123</code>
        </div>

      </div>
    </div>
  );
}