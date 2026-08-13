import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';
import { catalogService } from '../services/catalogService';
import { checkoutService } from '../services/checkoutService';
import { OrderReceipt } from './OrderReceipt';
import { OrdersList } from './OrdersList';

export const BasketManager = () => {
  const [userName, setUserName] = useState('Saul');
  const [activeUser, setActiveUser] = useState('Saul');
  const [basket, setBasket] = useState({ userName: 'Saul', items: [] });
  const [products, setProducts] = useState([]);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' o 'history'
  const [loading, setLoading] = useState(false);

  // Cargar catálogo y carrito del usuario activo
  useEffect(() => {
    loadProducts();
    loadBasket(activeUser);
  }, [activeUser]);

  const loadProducts = async () => {
    try {
      const data = await catalogService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  const loadBasket = async (user) => {
    try {
      const data = await basketService.getBasket(user);
      setBasket(data || { userName: user, items: [] });
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setBasket({ userName: user, items: [] });
    }
  };

  const handleUserChange = () => {
    if (!userName.trim()) return;
    setActiveUser(userName.trim());
    setCreatedOrder(null);
  };

  const handleAddToCart = async (product) => {
    try {
      const currentItems = basket.items || [];
      const existing = currentItems.find(i => (i.productId || i.id) === (product.id || product._id));
      
      let updatedItems = [];
      if (existing) {
        updatedItems = currentItems.map(i => 
          (i.productId || i.id) === (product.id || product._id) 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      } else {
        updatedItems = [...currentItems, { 
          productId: product.id || product._id, 
          productName: product.name, 
          price: product.price, 
          quantity: 1 
        }];
      }

      const updated = await basketService.updateBasket({ userName: activeUser, items: updatedItems });
      setBasket(updated);
    } catch (err) {
      console.error("Error al añadir al carrito:", err);
    }
  };

  const handleCheckout = async () => {
    if (!basket.items || basket.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setLoading(true);
    try {
      const totalAmount = basket.items.reduce((acc, item) => acc + ((item.price || item.unitPrice || 0) * item.quantity), 0);
      
      // Procesa el checkout con el servicio
      const res = await checkoutService.checkout(activeUser, basket.items, totalAmount);
      
      // Construye la orden localmente si la API no devuelve la estructura completa
      const fullOrder = {
        id: res.id || res._id || 'ORD-' + Math.floor(Math.random() * 1000000),
        customerId: activeUser,
        userName: activeUser,
        createdAt: new Date().toISOString(),
        status: res.status || 'Pending',
        items: basket.items,
        subtotal: totalAmount * 0.84,
        tax: totalAmount * 0.16,
        total: totalAmount,
        totalPrice: totalAmount
      };

      setCreatedOrder(fullOrder);
      
      // Vaciar el carrito en el backend tras la compra
      await basketService.deleteBasket(activeUser);
      setBasket({ userName: activeUser, items: [] });
    } catch (err) {
      console.error("Error en Checkout:", err);
      alert("Error al procesar la orden: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!basket.items) return 0;
    return basket.items.reduce((acc, item) => acc + ((item.price || item.unitPrice || 0) * item.quantity), 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Pestañas de Navegación */}
      <div className="flex border-b mb-6 print:hidden">
        <button
          onClick={() => setActiveTab('shop')}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'shop' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          🛒 Tienda y Carrito
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📋 Historial de Órdenes
        </button>
      </div>

      {activeTab === 'history' ? (
        /* Vista de Historial de Órdenes */
        <OrdersList activeUser={activeUser} onSelectOrder={(order) => {
          setCreatedOrder(order);
          setActiveTab('shop');
        }} />
      ) : createdOrder ? (
        /* Vista de Orden Generada / Impresión PDF */
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 print:hidden">
            <strong>¡Orden Generada Exitosamente!</strong> Revisa el detalle a continuación para imprimir tu comprobante.
          </div>
          <OrderReceipt order={createdOrder} onBack={() => setCreatedOrder(null)} />
        </div>
      ) : (
        /* Vista de Compra Principal */
        <div>
          {/* Selector de Usuario */}
          <div className="bg-white p-4 rounded shadow mb-6 flex items-center gap-4 border">
            <label className="font-bold text-gray-700">Usuario Activo:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border p-2 rounded flex-1 max-w-xs"
            />
            <button
              onClick={handleUserChange}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Consultar / Cambiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Productos del Catálogo */}
            <div className="bg-white p-4 rounded shadow border">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📦 Productos del Catálogo</h3>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id || p._id} className="flex justify-between items-center border p-3 rounded">
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-green-600 font-semibold">${Number(p.price).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 font-bold"
                    >
                      + Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrito de Compras */}
            <div className="bg-white p-4 rounded shadow border flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">🛒 Carrito de {activeUser}</h3>
                {(!basket.items || basket.items.length === 0) ? (
                  <p className="text-gray-400 text-center py-8">No has agregado productos aún.</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {basket.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border p-2 rounded text-sm">
                        <div>
                          <p className="font-bold">{item.productName || item.name}</p>
                          <p className="text-gray-500">${Number(item.price || item.unitPrice || 0).toFixed(2)} c/u</p>
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded font-bold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón Checkout */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">Total Acumulado:</span>
                  <span className="text-xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading || !basket.items || basket.items.length === 0}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
                >
                  {loading ? 'Procesando...' : '⚙️ Finalizar Compra (Checkout)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BasketManager;