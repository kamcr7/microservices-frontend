import axios from 'axios';

const ORDERING_URL = import.meta.env.VITE_ORDERING_URL || 'https://ordering-api-n8co.onrender.com';

export const checkoutService = {
  checkout: async (userName, items, totalPrice) => {
    const payload = {
      customerId: userName.trim(), // Usa el nombre de usuario o un ID de cliente válido
      basketId: userName.trim(),
      items: items.map(item => ({
        productId: String(item.productId || item.id || "prod-1"),
        productName: String(item.productName || item.name || "Producto"),
        unitPrice: Number(item.price || item.unitPrice || 0), // ⚠️ Debe ser 'unitPrice' para C#
        quantity: Number(item.quantity || 1)
      }))
    };

    const response = await axios.post(`${ORDERING_URL}/api/orders`, payload);
    return response.data;
  }
};