// services/checkoutService.js
import axios from 'axios';

const CHECKOUT_API_URL = 'https://ordering-api-nico.onrender.com/api/orders';

export const checkoutService = {
  checkout: async (userName, items, totalAmount) => {
    // Transformar/Mapear los items asegurando compatibilidad de campos (price y unitPrice)
    const formattedItems = items.map((item) => {
      const priceVal = Number(item.price || item.unitPrice || 0);
      return {
        productId: String(item.productId || item.id || item._id),
        productName: String(item.productName || item.name || "Producto"),
        price: priceVal,
        unitPrice: priceVal,
        quantity: Number(item.quantity || 1)
      };
    });

    const payload = {
      customerId: userName,
      userName: userName,
      basketId: userName,
      totalPrice: Number(totalAmount || 0),
      total: Number(totalAmount || 0),
      items: formattedItems
    };

    console.log("Payload enviado a Ordering.API:", JSON.stringify(payload));

    const response = await axios.post(CHECKOUT_API_URL, payload);
    return response.data;
  }
};