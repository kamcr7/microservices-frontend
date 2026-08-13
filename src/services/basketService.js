import axios from 'axios';

const BASE_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';

export const basketService = {
  // Obtener carrito por usuario
  getBasket: async (userName) => {
    const endpoints = [
      `/api/baskets/${userName}`,
      `/api/basket/${userName}`,
      `/api/v1/basket/${userName}`
    ];

    for (const ep of endpoints) {
      try {
        const response = await axios.get(`${BASE_BASKET_URL}${ep}`);
        if (response.data) return response.data;
      } catch (err) {
        // Continuar intentando con el siguiente endpoint si es 404
      }
    }
    return { userName, items: [] };
  },

  // Guardar o Actualizar Carrito (Checkout / Añadir)
  updateBasket: async (basketData) => {
    // Normalizar la estructura payload para que el backend la reconozca
    const payload = {
      userName: basketData.userName || basketData.username || 'Saul',
      username: basketData.userName || basketData.username || 'Saul',
      buyerId: basketData.userName || basketData.username || 'Saul',
      items: (basketData.items || []).map(item => ({
        productId: item.productId || item.id || '',
        productName: item.productName || item.name || '',
        price: Number(item.price || item.unitPrice || 0),
        quantity: Number(item.quantity || 1)
      }))
    };

    const endpoints = [
      '/api/baskets',
      '/api/basket',
      '/api/v1/basket'
    ];

    let lastError = null;
    for (const ep of endpoints) {
      try {
        const response = await axios.post(`${BASE_BASKET_URL}${ep}`, payload);
        return response.data;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("No se pudo conectar con el microservicio de Basket");
  },

  // Eliminar carrito tras checkout
  deleteBasket: async (userName) => {
    const endpoints = [
      `/api/baskets/${userName}`,
      `/api/basket/${userName}`,
      `/api/v1/basket/${userName}`
    ];

    for (const ep of endpoints) {
      try {
        const res = await axios.delete(`${BASE_BASKET_URL}${ep}`);
        return res.data;
      } catch (err) {
        // Ignorar 404
      }
    }
    return null;
  }
};

export default basketService;