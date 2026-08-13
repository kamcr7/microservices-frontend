// src/services/orderingService.js
const ORDERING_API_URL = 'https://ordering-api-n8co.onrender.com/api/orders';

export const createOrder = async (customerId, basketId) => {
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch(ORDERING_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({
      customerId: customerId,
      basketId: basketId
    })
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo procesar la orden`);
  }

  return await response.json();
};