import axios from 'axios';

// Asegurarse de apuntar al backend del CARRITO y no al del catálogo
const RAW_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';
const BASE_BASKET_URL = RAW_BASKET_URL.replace(/\/$/, '');

export const basketService = {
  getBasketByUser: async (userName) => {
    try {
      // Petición hacia basket-api-cma3.onrender.com/basket/Saul
      const response = await axios.get(`${BASE_BASKET_URL}/basket/${userName}`);
      const data = response.data;

      // Adaptar según la estructura de respuesta que devuelve Basket.API
      return data?.basket || data || { userName, items: [] };
    } catch (error) {
      console.error(`Error al obtener el carrito de ${userName}:`, error);
      return { userName, items: [] };
    }
  },

  getBasket: async (userName) => {
    return basketService.getBasketByUser(userName);
  }
};