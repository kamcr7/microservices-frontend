import axios from 'axios';

const BASE_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';

export const basketService = {
  // Obtener carrito
  getBasket: async (userName) => {
    try {
      // Intenta la ruta estándar
      const response = await axios.get(`${BASE_BASKET_URL}/api/baskets/${userName}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          // Intento secundario en singular por si tu API usa /api/basket
          const resSingular = await axios.get(`${BASE_BASKET_URL}/api/basket/${userName}`);
          return resSingular.data;
        } catch (e) {
          return { userName, items: [] };
        }
      }
      return { userName, items: [] };
    }
  },

  // Guardar / Añadir al carrito
  updateBasket: async (basketData) => {
    try {
      // 1. Intento POST a /api/baskets
      const response = await axios.post(`${BASE_BASKET_URL}/api/baskets`, basketData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          // 2. Intento POST a /api/basket (sin 's')
          const res2 = await axios.post(`${BASE_BASKET_URL}/api/basket`, basketData);
          return res2.data;
        } catch (e2) {
          // 3. Intento POST enviando el usuario en la URL
          const res3 = await axios.post(`${BASE_BASKET_URL}/api/baskets/${basketData.userName}`, basketData);
          return res3.data;
        }
      }
      throw error;
    }
  },

  // Eliminar carrito
  deleteBasket: async (userName) => {
    try {
      const response = await axios.delete(`${BASE_BASKET_URL}/api/baskets/${userName}`);
      return response.data;
    } catch (error) {
      try {
        const res2 = await axios.delete(`${BASE_BASKET_URL}/api/basket/${userName}`);
        return res2.data;
      } catch (e2) {
        return null;
      }
    }
  }
};

export default basketService;