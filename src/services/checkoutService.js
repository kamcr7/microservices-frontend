import axios from 'axios';

const ORDERING_URL = import.meta.env.VITE_ORDERING_URL || 'https://ordering-api-n8co.onrender.com';

export const checkoutService = {
  checkout: async (userName, items = [], totalPrice) => {
    // Asegurar que items sea un arreglo válido y no vacío
    const safeItems = Array.isArray(items) ? items : [];

    const payload = {
      customerId: String(userName || 'Saul').trim(),
      basketId: String(userName || 'Saul').trim(),
      items: safeItems.map(item => ({
        productId: String(item.productId || item.id || 'prod-1'),
        productName: String(item.productName || item.name || 'Producto'),
        unitPrice: Number(item.price || item.unitPrice || 0),
        quantity: Number(item.quantity || 1)
      }))
    };

    console.log("Payload enviado a Ordering.API:", JSON.stringify(payload)); // Para depuración en consola

    const response = await axios.post(`${ORDERING_URL}/api/orders`, payload);
    return response.data;
  }
};