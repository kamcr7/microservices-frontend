import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';
import { catalogService } from '../services/catalogService';
import { checkoutService } from '../services/checkoutService';
import { OrderReceipt } from './OrderReceipt';
import { OrdersList } from './OrdersList';

export default function BasketManager({ currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const activeUser = currentUser?.username || 'Saul';

  const [products, setProducts] = useState([
    { id: '1', name: 'Casco AGV', price: 7999.99, imageUrl: '' },
    { id: '2', name: 'Iphone 17 pro max', price: 25000.00, imageUrl: '' },
    { id: '3', name: 'xbox series x', price: 12000.00, imageUrl: '' }
  ]);
  const [basket, setBasket] = useState({ userName: activeUser, items: [] });
  const [createdOrder, setCreatedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' o 'history'
  const [loading, setLoading] = useState(false);

  // Formulario para Admin
  const [newProduct, setNewProduct] = useState({ name: '', price: '', imageUrl: '' });

  useEffect(() => {
    loadProducts();
    loadBasket(activeUser);
  }, [activeUser]);

  const loadProducts = async () => {
    try {
      const data = await catalogService.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.warn("Usando productos locales por defecto");
    }
  };

  const loadBasket = async (user) => {
    try {
      const data = await basketService.getBasket(user);
      if (data && data.items) {
        setBasket(data);
      }
    } catch (err) {
      // Mantiene el estado en cliente si falla la API
    }
  };

  const handleAddToCart = async (product) => {
    const currentItems = basket.items || [];
    const prodId = product.id || product._id;
    const existing = currentItems.find(i => (i.productId || i.id) === prodId);
    
    let updatedItems = [];
    if (existing) {
      updatedItems = currentItems.map(i => 
        (i.productId || i.id) === prodId 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      );
    } else {
      updatedItems = [...currentItems, { 
        productId: prodId, 
        productName: product.name || product.productName, 
        price: Number(product.price || 0), 
        quantity: 1 
      }];
    }

    const newBasket = { userName: activeUser, items: updatedItems };
    setBasket(newBasket);

    try {
      await basketService.updateBasket(newBasket);
    } catch (err) {
      console.warn("Servidor de basket no disponible, guardado en memoria.");
    }
  };

  const handleAddProductByAdmin = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const prodToAdd = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      imageUrl: newProduct.imageUrl
    };

    setProducts([...products, prodToAdd]);
    try {
      await catalogService.createProduct(prodToAdd);
    } catch (err) {
      console.warn("No se pudo persistir en API de catálogo, guardado en UI.");
    }

    setNewProduct({ name: '', price: '', imageUrl: '' });
    alert("¡Producto agregado exitosamente al catálogo!");
  };

  const handleCheckout = async () => {
    if (!basket.items || basket.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setLoading(true);
    const totalAmount = calculateTotal();

    const fullOrder = {
      id: 'ORD-' + Math.floor(Math.random() * 1000000),
      customerId: activeUser,
      userName: activeUser,
      createdAt: new Date().toISOString(),
      status: 'Completed',
      items: [...basket.items],
      subtotal: totalAmount * 0.84,
      tax: totalAmount * 0.16,
      total: totalAmount,
      totalPrice: totalAmount
    };

    try {
      const res = await checkoutService.checkout(activeUser, basket.items, totalAmount);
      if (res && (res.id || res._id)) {
        fullOrder.id = res.id || res._id;
      }
    } catch (err) {
      console.warn("Fallo en API checkout backend, continuando con persistencia local.");
    } finally {
      // 💾 PERSISTENCIA EN LOCALSTORAGE: Guardar la nueva orden localmente
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      localOrders.unshift(fullOrder); // Agregar al inicio de la lista
      localStorage.setItem('local_orders', JSON.stringify(localOrders));

      setCreatedOrder(fullOrder);
      setBasket({ userName: activeUser, items: [] });
      try { await basketService.deleteBasket(activeUser); } catch (e) {}
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
          {isAdmin ? '📦 Agregar / Gestionar Catálogo' : '🛒 Tienda y Carrito'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📋 {isAdmin ? 'Historial de Órdenes Globales' : 'Mis Órdenes'}
        </button>
      </div>

      {activeTab === 'history' ? (
        /* Historial de Órdenes */
        <OrdersList currentUser={currentUser} onSelectOrder={(order) => {
          setCreatedOrder(order);
          setActiveTab('shop');
        }} />
      ) : createdOrder ? (
        /* Recibo de Compra e Impresión PDF */
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 print:hidden">
            <strong>¡Orden Generada Exitosamente!</strong> Revisa el detalle a continuación para imprimir tu comprobante.
          </div>
          <OrderReceipt order={createdOrder} onBack={() => setCreatedOrder(null)} />
        </div>
      ) : (
        /* Vista Principal */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO IZQUIERDO: Catálogo / Formulario Admin */}
          <div className="space-y-6">
            {isAdmin && (
              <form onSubmit={handleAddProductByAdmin} className="bg-blue-50 p-4 rounded shadow border border-blue-200">
                <h3 className="font-bold text-lg mb-3 text-blue-900">➕ Agregar Nuevo Producto (Admin)</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="url"
                    placeholder="URL de Imagen (Opcional)"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">
                    Guardar en Catálogo
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white p-4 rounded shadow border">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📦 Productos del Catálogo</h3>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id || p._id} className="flex justify-between items-center border p-3 rounded gap-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">🛍️</div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-green-600 font-semibold">${Number(p.price).toFixed(2)}</p>
                      </div>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 font-bold"
                      >
                        + Añadir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Carrito de Compras (Solo Clientes) */}
          {!isAdmin ? (
            <div className="bg-white p-4 rounded shadow border flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">🛒 Mi Carrito ({activeUser})</h3>
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

              {/* Botón Finalizar Compra */}
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
          ) : (
            <div className="bg-gray-50 p-6 rounded border text-center flex flex-col justify-center items-center text-gray-500">
              <span className="text-4xl mb-2">👤</span>
              <p className="font-bold">Modo Administrador Activo</p>
              <p className="text-sm">Utiliza el panel izquierdo para añadir productos al catálogo general.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}