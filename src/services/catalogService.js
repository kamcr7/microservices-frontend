import { catalogApi } from './api';

export const catalogService = {
  getProducts: async () => {
    const response = await catalogApi.get('/products');
    return response.data;
  },

  getProductById: async (id) => {
    const response = await catalogApi.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category) => {
    const response = await catalogApi.get(`/products/category/${category}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await catalogApi.post('/products', productData);
    return response.data;
  },

  updateProduct: async (productData) => {
    const response = await catalogApi.put('/products', productData);
    return response.data;
  },

  // RUTA EXACTA DEFINIDA EN EL BACKEND
  deleteProduct: async (product) => {
    // Si el nombre no existe o está vacío, le asignamos un espacio en blanco
    // para que la URL /products/by-name/%20 se arme y viaje al backend
    const name = product.name && product.name.trim() ? product.name.trim() : " ";
    const nameParam = encodeURIComponent(name);
    
    console.log(`[LIMPIEZA] Eliminando fantasma en: DELETE /products/by-name/${nameParam}`);
    const response = await catalogApi.delete(`/products/by-name/${nameParam}`);
    return response.data;
  }
};