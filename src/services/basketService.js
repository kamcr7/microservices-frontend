import axios from 'axios';

const BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';

export const basketService = {
  getBasketByUser: async (userName) => {
    const res = await axios.get(`${BASKET_URL}/basket/${userName}`);
    return res.data;
  },

  updateBasket: async (basketData) => {
    // Si ya viene formateado con { cart: ... } lo usa, si no, lo envuelve automáticamente
    const payload = basketData.cart ? basketData : { cart: basketData };
    const res = await axios.post(`${BASKET_URL}/basket`, payload);
    return res.data;
  }
};