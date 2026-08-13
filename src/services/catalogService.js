import axios from 'axios';

// Forzamos la inclusión de /products sin importar qué traiga la variable de entorno
const RAW_URL = import.meta.env.VITE_CATALOG_URL || 'https://catalog-api-32it.onrender.com';
const BASE_URL = RAW_URL.endsWith('/products') 
  ? RAW_URL 
  : `${RAW_URL.replace(/\/$/, '')}/products`;

export const catalogService = {
  getProducts: async () => {
    try {
      const response = await axios.get(BASE_URL);
      const data = response.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.products)) return data.products;
      if (Array.isArray(data?.items)) return data.items;

      return [];
    } catch (error) {
      console.error("Error al cargar productos de Catalog.API:", error);
      throw error;
    }
  }
};