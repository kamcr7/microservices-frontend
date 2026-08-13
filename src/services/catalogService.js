import axios from 'axios';

// Si no detecta la variable de Vercel, usa la URL directa de Render
const BASE_URL = import.meta.env.VITE_CATALOG_URL || 'https://catalog-api-32it.onrender.com'; 
// (Asegúrate de reemplazar 'https://catalog-api-n8co.onrender.com' por tu URL real de Catalog API)

export const catalogService = {
  getProducts: async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
  }
};