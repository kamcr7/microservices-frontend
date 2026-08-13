import axios from 'axios';

const RAW_URL = import.meta.env.VITE_CATALOG_URL || 'https://catalog-api-32it.onrender.com';
const BASE_URL = RAW_URL.endsWith('/products') 
  ? RAW_URL 
  : `${RAW_URL.replace(/\/$/, '')}/products`;

export const catalogService = {
  getProducts: async () => {
    try {
      const response = await axios.get(BASE_URL);
      const resData = response.data;

      // 1. Si los productos vienen en la propiedad "data" (como en tu API de Render)
      if (Array.isArray(resData?.data)) {
        return resData.data;
      }

      // 2. Por si vienen directo como arreglo o en otras propiedades estándar
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.products)) return resData.products;
      if (Array.isArray(resData?.items)) return resData.items;

      return [];
    } catch (error) {
      console.error("Error al cargar productos de Catalog.API:", error);
      return [];
    }
  }
};