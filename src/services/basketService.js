import axios from 'axios';

const BASKET_URL = import.meta.env.VITE_BASKET_URL || 'https://basket-api-cma3.onrender.com';

export const basketService = {
  getBasketByUser: async (userName) => {
    const res = await axios.get(`${BASKET_URL}/basket/${userName}`);
    return res.data;
  },

  updateBasket: async (basketPayload) => {
    // Es vital que se haga la petición POST/PUT a Basket.API para persistir en Redis
    const res = await axios.post(`${BASKET_URL}/basket`, basketPayload);
    return res.data;
  }
};