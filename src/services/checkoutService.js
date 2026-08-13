import axios from 'axios';

const ORDERING_URL = import.meta.env.VITE_ORDERING_URL || 'https://ordering-api-n8co.onrender.com';

export const checkoutService = {
  checkout: async (userName, items, totalPrice) => {
    // Es vital asegurar que userName coincida exactamente con la clave de Redis ("Saul")
    const payload = {
      userName: userName.trim(), // Limpia espacios accidentales
      customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      totalPrice: totalPrice,
      
      // Mapear la lista de productos actual
      items: items.map(item => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color || "Default"
      }))
    };

    const response = await axios.post(`${ORDERING_URL}/api/orders`, payload);
    return response.data;
  }
};