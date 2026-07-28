import { basketApi } from './api';

export const basketService = {
  // Obtener el carrito de un usuario específico
  getBasketByUser: async (userName) => {
    const response = await basketApi.get(`/basket/${userName}`);
    return response.data;
  },

  // Crear o actualizar el carrito
  updateBasket: async (basketData) => {
    const response = await basketApi.post('/basket', basketData);
    return response.data;
  },

  // Finalizar compra / Checkout
  checkout: async (userName) => {
    const response = await basketApi.post('/basket/checkout', { userName });
    return response.data;
  }
};