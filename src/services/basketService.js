import api from './api'; // O axios según tu configuración

export const basketService = {
  getBasket: async (userName) => {
    const response = await api.get(`/api/baskets/${userName}`);
    return response.data;
  },
  updateBasket: async (basketData) => {
    const response = await api.post('/api/baskets', basketData);
    return response.data;
  },
  deleteBasket: async (userName) => {
    const response = await api.delete(`/api/baskets/${userName}`);
    return response.data;
  }
};