import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { catalogService } from '../services/catalogService';

export default function ProductCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '', // Lo manejaremos como texto separado por comas
    imageFile: '',
    price: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Formateamos los datos antes de enviarlos
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        // Convertimos el texto de categorías separado por comas en un arreglo real
        category: formData.category.split(',').map(cat => cat.trim()).filter(cat => cat !== '')
      };

      await catalogService.createProduct(payload);
      // Si tiene éxito, regresamos a la tabla de productos
      navigate('/products');
    } catch (error) {
      console.error("Error al crear el producto:", error);
      alert("Hubo un error al crear el producto. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow border border-gray-200">
        
        {/* Cabecera */}
        <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold">Crear Nuevo Producto</h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre del Producto</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ej. iPhone 15"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows="3"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Descripción detallada del producto..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Categorías</label>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Ej. SmartPhone, Apple"
              />
              <span className="text-xs text-gray-400 mt-1 block">Separa las categorías por comas</span>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Precio ($)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Ej. 999.99"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">URL de la Imagen</label>
            <input 
              type="text" 
              name="imageFile" 
              value={formData.imageFile} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ej. http://misitio.com/imagen.jpg"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Link 
              to="/products" 
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-4 py-2 text-white rounded font-medium transition-colors ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}