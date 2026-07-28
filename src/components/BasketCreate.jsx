import React, { useState, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import { basketService } from '../services/basketService';
import { useNavigate } from 'react-router-dom';

export default function BasketCreate() {
  const [userName, setUserName] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingCatalog, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const data = await catalogService.getProducts();
        const list = data.data || data.products || data.items || data || [];
        setCatalogProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Error cargando productos en carrito:", e);
        setErrorMessage("No se pudo conectar con el catálogo.");
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleAddItem = (product) => {
    const exists = selectedItems.find(item => item.productName === product.name);
    if (exists) return;

    setSelectedItems([...selectedItems, {
      productId: product.id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      productName: product.name,
      price: product.price,
      quantity: 1,
      color: "N/A"
    }]);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, parseInt(value) || 1);
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert("Por favor, ingresa el nombre del usuario.");
    if (selectedItems.length === 0) return alert("Debes añadir al menos un producto al carrito.");

    try {
      setSubmitting(true);
      
      const formattedItems = selectedItems.map(item => ({
        productId: item.productId,
        productName: String(item.productName),
        price: Number(item.price),
        quantity: Number(item.quantity),
        color: "N/A"
      }));

      // Intentamos primero con la estructura plana original (la que lee correctamente el Buscador)
      const flatPayload = {
        userName: userName.trim(),
        items: formattedItems
      };

      try {
        await basketService.updateBasket(flatPayload);
      } catch (firstError) {
        // Si el backend chilla por un NullReferenceException, usamos el plan B envuelto
        console.warn("Fallo estructura plana, intentando con envoltura 'cart'...");
        await basketService.updateBasket({ cart: flatPayload });
      }
      
      alert(`¡Carrito para ${userName} procesado con éxito!`);
      navigate('/baskets/search');
    } catch (error) {
      console.error("Error definitivo al guardar carrito:", error);
      const apiError = error.response?.data?.detail || error.response?.data?.message || error.response?.data || error.message;
      alert(`Error al guardar el carrito: ${typeof apiError === 'object' ? JSON.stringify(apiError) : apiError}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow border">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🛒 Crear Nuevo Carrito</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Nombre del Usuario:</label>
          <input 
            type="text" 
            placeholder="Ej: Saul, Mark..." 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full md:w-1/2 border p-2 rounded shadow-sm focus:outline-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-lg bg-gray-50">
            <h3 className="font-bold text-gray-700 mb-3">📦 Productos del Catálogo</h3>
            {loadingCatalog ? (
              <p className="text-gray-500">Cargando catálogo...</p>
            ) : errorMessage ? (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            ) : catalogProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay productos en el catálogo.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {catalogProducts.map(p => (
                  <div key={p.id || p.name} className="flex justify-between items-center p-2 bg-white rounded shadow-sm text-sm border">
                    <div>
                      <span className="font-medium text-gray-800">{p.name}</span> - <span className="text-green-600 font-semibold">${p.price?.toFixed(2)}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleAddItem(p)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                    >
                      ➕ Añadir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border p-4 rounded-lg bg-white">
            <h3 className="font-bold text-gray-700 mb-3">📝 Resumen del Carrito</h3>
            {selectedItems.length === 0 ? (
              <p className="text-gray-400 text-sm">No has agregado productos aún.</p>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2 text-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.productName}</p>
                      <p className="text-gray-500">${item.price?.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-14 border text-center rounded p-1"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-right pt-2 font-bold text-lg text-blue-600">
                  Total: ${selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition shadow"
        >
          {submitting ? "Guardando en Render..." : "💾 Guardar Carrito Completo"}
        </button>
      </form>
    </div>
  );
}