import axios from 'axios';

const RAW_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com'; // Coloca aquí tu URL de Render de Basket
const BASE_BASKET_URL = RAW_BASKET_URL.replace(/\/$/, '');

export const basketService = {
  getBasket: async (userName) => {
    try {
      // Petición a /basket/{userName}
      const response = await axios.get(`${BASE_BASKET_URL}/basket/${userName}`);
      const data = response.data;

      // Retornar el objeto del carrito o la lista de items mapeada
      return data?.basket || data || { userName, items: [] };
    } catch (error) {
      console.error(`Error al obtener el carrito de ${userName}:`, error);
      return { userName, items: [] };
    }
  }
};