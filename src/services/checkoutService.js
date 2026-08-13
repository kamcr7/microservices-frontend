import axios from 'axios';

const BASE_ORDERING_URL = import.meta.env.VITE_ORDERING_URL || 'https://ordering-api-n8co.onrender.com';

export const checkoutService = {
  // Crear la orden de compra (POST /api/orders)
  checkout: async (userName, items, totalAmount) => {
    const formattedItems = items.map((item) => {
      const priceVal = Number(item.price || item.unitPrice || 0);
      return {
        productId: String(item.productId || item.id || item._id),
        productName: String(item.productName || item.name || "Producto"),
        unitPrice: priceVal,
        quantity: Number(item.quantity || 1),
        lineTotal: priceVal * Number(item.quantity || 1)
      };
    });

    const subtotalVal = totalAmount * 0.84;
    const taxVal = totalAmount * 0.16;

    const payload = {
      customerId: userName,
      userName: userName,
      basketId: userName,
      subtotal: subtotalVal,
      tax: taxVal,
      total: Number(totalAmount || 0),
      totalPrice: Number(totalAmount || 0),
      items: formattedItems
    };

    // Header de Idempotencia para cumplir con el Requisito 4.1
    const idempotencyKey = `KEY-${userName}-${Date.now()}`;

    const response = await axios.post(`${BASE_ORDERING_URL}/api/orders`, payload, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });

    return response.data;
  },

  // Obtener todas las órdenes (GET /api/orders)
  getAllOrders: async () => {
    const response = await axios.get(`${BASE_ORDERING_URL}/api/orders`);
    return response.data;
  },

  // Obtener órdenes de un cliente (GET /api/orders/customer/{customerId})
  getOrdersByCustomer: async (customerId) => {
    const response = await axios.get(`${BASE_ORDERING_URL}/api/orders/customer/${customerId}`);
    return response.data;
  }
};