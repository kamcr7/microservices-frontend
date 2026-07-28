import axios from 'axios';

// URIs de producción en Render
const CATALOG_API_URL = 'https://catalog-api-32it.onrender.com'; // <-- Pon la URL de tu API de Catalog
const BASKET_API_URL = 'https://basket-api-cma3.onrender.com';     // <-- Tu API de Basket ya confirmada

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