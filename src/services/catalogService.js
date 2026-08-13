import axios from 'axios';

// Endpoint expuesto por Carter en tu Catalog.API
const BASE_URL = import.meta.env.VITE_CATALOG_URL || 'https://catalog-api-32it.onrender.com/products';

export const catalogService = {
  getProducts: async () => {
    try {
      const response = await axios.get(BASE_URL);
      const data = response.data;

      // Retorna el array según la estructura recibida de Carter/Marten
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.products)) return data.products;
      if (Array.isArray(data?.items)) return data.items;

      return [];
    } catch (error) {
      console.error("Error al cargar productos de Catalog.API:", error);
      return [];
    }
  }
};