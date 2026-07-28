import { useEffect, useState } from 'react';
import { catalogService } from '../services/catalogService';
import { Link, useLocation } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');
  
  const location = useLocation();
  const showFilter = new URLSearchParams(location.search).get('filter') === 'category';

  useEffect(() => {
    fetchProducts();
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await catalogService.getProducts();
      const list = data.data || data.products || data.items || data || [];
      setProducts(Array.isArray(list) ? list : []);
      setFilteredProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setCategorySearch(val);
    if (val.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => 
        p.category && p.category.some(cat => cat.toLowerCase().includes(val.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  };

  const handleDelete = async (product) => {
    if (!product) return;

    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      try {
        setLoading(true);
        await catalogService.deleteProduct(product);
        alert("¡Producto eliminado exitosamente!");
        await fetchProducts(); // Refrescar la tabla
      } catch (error) {
        console.error("Error definitivo en eliminación:", error);
        const apiMsg = error.response?.data?.message || error.response?.data || error.message;
        alert(`No se pudo eliminar: ${typeof apiMsg === 'object' ? JSON.stringify(apiMsg) : apiMsg}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-4">
      {showFilter && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <label className="block text-blue-800 font-bold mb-2">🔍 Filtrar Catálogo por Categoría:</label>
          <input 
            type="text"
            placeholder="Ej: SmartPhone, Ropa..."
            value={categorySearch}
            onChange={handleSearchChange}
            className="w-full md:w-1/3 border p-2 rounded shadow-sm focus:outline-blue-400"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold">{showFilter ? 'Resultados por Categoría' : 'Lista General de Productos'}</h2>
          <Link to="/products/create" className="bg-white text-gray-800 px-4 py-1 rounded text-sm font-semibold hover:bg-gray-200">
            + Nuevo Producto
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100 text-gray-700">
                <th className="py-3 px-6 font-semibold border-b">Imagen</th>
                <th className="py-3 px-6 font-semibold border-b">Nombre</th>
                <th className="py-3 px-6 font-semibold border-b">Descripción</th>
                <th className="py-3 px-6 font-semibold border-b">Categorías</th>
                <th className="py-3 px-6 font-semibold border-b">Precio</th>
                <th className="py-3 px-6 font-semibold border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Cargando catálogo...</td></tr>
              ) : filteredProducts.filter(p => p && p.name && p.name.trim() !== '').length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No se encontraron productos.</td></tr>
              ) : (
                filteredProducts
                  .filter(product => product && product.name && product.name.trim() !== '') // <- BLINDAJE AQUI: Remueve filas fantasma
                  .map((product, index) => (
                    <tr key={product.id || index} className="hover:bg-gray-50 border-b">
                      <td className="py-3 px-6">
                        <img src={product.imageFile || "https://via.placeholder.com/50"} alt={product.name} className="w-12 h-12 object-cover rounded shadow-sm" />
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-800">{product.name}</td>
                      <td className="py-3 px-6 text-gray-600 truncate max-w-xs">{product.description}</td>
                      <td className="py-3 px-6">
                        <div className="flex gap-1 flex-wrap">
                          {product.category?.map(cat => (
                            <span key={cat} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border">{cat}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-6 font-semibold text-green-600">${product.price?.toFixed(2)}</td>
                      <td className="py-3 px-6 text-center">
                        <button 
                          onClick={() => handleDelete(product)} 
                          className="text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}