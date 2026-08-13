import { basketApi } from './api';

export const basketService = {
  // Obtener el carrito de un usuario específico
  getBasketByUser: async (userName) => {
    const response = await basketApi.get(`/api/basket/${userName}`);
    return response.data;
  },

  // Crear o actualizar el carrito en Basket.API (guarda en basket-cache)
  updateBasket: async (basketData) => {
    const response = await basketApi.post('/api/basket', basketData);
    return response.data;
  },

  // Finalizar compra / Checkout
  checkout: async (userName) => {
    const response = await basketApi.post('/api/basket/checkout', { userName });
    return response.data;
  }
};