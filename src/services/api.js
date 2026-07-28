import axios from 'axios';

// Ahora le pegan a Netlify en local, y Netlify se encarga de redirigir por detrás
const CATALOG_API_URL = '/api/catalog'; 
const BASKET_API_URL = '/api/basket';

// Instancia para el Catálogo (Productos)
export const catalogApi = axios.create({
  baseURL: CATALOG_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instancia para el Carrito (Basket)
export const basketApi = axios.create({
  baseURL: BASKET_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});