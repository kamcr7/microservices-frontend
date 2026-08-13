const USERS = [
  { id: '1', username: 'Saul', role: 'user', name: 'Saúl (Cliente)' },
  { id: '2', username: 'admin', role: 'admin', name: 'Administrador' }
];

export const authService = {
  login: (username) => {
    const found = USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    const user = found || { id: Date.now().toString(), username, role: 'user', name: username };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};