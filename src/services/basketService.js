import axios from 'axios';

const RAW_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';
const BASE_BASKET_URL = RAW_BASKET_URL.replace(/\/$/, '');

export const basketService = {
  // Mantener el nombre que consume tu componente React
  getBasketByUser: async (userName) => {
    try {
      const response = await axios.get(`${BASE_BASKET_URL}/basket/${userName}`);
      const data = response.data;

      // Retorna el objeto del carrito o la estructura por defecto si no existe
      return data?.basket || data || { userName, items: [] };
    } catch (error) {
      console.error(`Error al obtener el carrito de ${userName}:`, error);
      return { userName, items: [] };
    }
  },

  // Alias por si lo utilizas en otro lugar con otro nombre
  getBasket: async (userName) => {
    return basketService.getBasketByUser(userName);
  }
};