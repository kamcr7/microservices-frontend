import axios from 'axios';

const BASE_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';

export const basketService = {
  getBasket: async (userName) => {
    try {
      const response = await axios.get(`${BASE_BASKET_URL}/api/baskets/${userName}`);
      return response.data || { userName, items: [] };
    } catch (error) {
      return { userName, items: [] };
    }
  },

  updateBasket: async (basketData) => {
    try {
      const response = await axios.post(`${BASE_BASKET_URL}/api/baskets`, basketData);
      return response.data;
    } catch (error) {
      // Si falla la API de Render, retornamos el basketData tal cual para no romper el flujo
      return basketData;
    }
  },

  deleteBasket: async (userName) => {
    try {
      await axios.delete(`${BASE_BASKET_URL}/api/baskets/${userName}`);
    } catch (error) {
      // Ignorar error al vaciar
    }
  }
};

export default basketService;