import axios from 'axios';

const BASE_BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma6.onrender.com';

export const basketService = {
  // Obtener el carrito por nombre de usuario
  getBasket: async (userName) => {
    try {
      const response = await axios.get(`${BASE_BASKET_URL}/api/baskets/${userName}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { userName, items: [] };
      }
      throw error;
    }
  },

  // Guardar o actualizar carrito
  updateBasket: async (basketData) => {
    const response = await axios.post(`${BASE_BASKET_URL}/api/baskets`, basketData);
    return response.data;
  },

  // Eliminar carrito tras la compra
  deleteBasket: async (userName) => {
    const response = await axios.delete(`${BASE_BASKET_URL}/api/baskets/${userName}`);
    return response.data;
  }
};

export default basketService;