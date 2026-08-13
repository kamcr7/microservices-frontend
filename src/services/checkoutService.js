import axios from 'axios';

const ORDERING_URL = import.meta.env.VITE_ORDERING_URL || 'https://ordering-api-n8co.onrender.com';

export const checkoutService = {
  checkout: async (userName, items, totalPrice) => {
    const payload = {
      basketCheckoutDto: {
        userName: userName.trim(),
        customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        totalPrice: totalPrice,
        // Datos de envío por defecto
        firstName: "Saul",
        lastName: "Dev",
        emailAddress: "saul@example.com",
        addressLine: "Av. Principal 123",
        country: "Mexico",
        state: "CDMX",
        zipCode: "01000",
        // Datos de pago por defecto
        cardName: "Saul Dev",
        cardNumber: "1111222233334444",
        expiration: "12/28",
        cvv: "123",
        paymentMethod: 1
      }
    };

    const response = await axios.post(`${ORDERING_URL}/api/orders`, payload);
    return response.data;
  }
};