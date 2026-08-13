import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';
import { checkoutService } from '../services/checkoutService';
import { OrderReceipt } from './OrderReceipt';
import { OrdersList } from './OrdersList';

// Catálogo base inicial con sus imágenes reales incorporadas
const DEFAULT_PRODUCTS = [
  { 
    id: '1', 
    name: 'Casco AGV', 
    price: 7999.99, 
    imageUrl: 'https://m.media-amazon.com/images/I/71R2c3I-3BL._AC_SL1500_.jpg' 
  },
  { 
    id: '2', 
    name: 'Iphone 17 pro max', 
    price: 25000.00, 
    imageUrl: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg' 
  },
  { 
    id: '3', 
    name: 'xbox series x', 
    price: 12000.00, 
    imageUrl: 'https://m.media-amazon.com/images/I/61-23W48NKL._SL1500_.jpg' 
  }
];

export default function BasketManager({ currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const activeUser = currentUser?.username || 'Saul';

  // --- ESTADOS ---
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState({ userName: activeUser, items: [] });
  const [createdOrder, setCreatedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [loading, setLoading] = useState(false);

  // Formulario Admin
  const [productForm, setProductForm] = useState({ name: '', price: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    loadGlobalCatalog();
    loadBasket(activeUser);
  }, [activeUser]);

  // Cargar catálogo garantizando persistencia sincronizada
  const loadGlobalCatalog = () => {
    const savedCatalog = localStorage.getItem('global_catalog_v2');
    if (savedCatalog) {
      try {
        setProducts(JSON.parse(savedCatalog));
        return;
      } catch (e) {
        console.error("Error al leer el catálogo almacenado", e);
      }
    }
    // Si no hay nada guardado aún, inicializamos con los productos base
    setProducts(DEFAULT_PRODUCTS);
    localStorage.setItem('global_catalog_v2', JSON.stringify(DEFAULT_PRODUCTS));
  };

  // Función para guardar cambios en el catálogo y compartirlos con todos los roles
  const updateGlobalCatalog = (newList) => {
    setProducts(newList);
    localStorage.setItem('global_catalog_v2', JSON.stringify(newList));
  };

  const loadBasket = async (user) => {
    try {
      const data = await basketService.getBasket(user);
      if (data && data.items) setBasket(data);
    } catch (err) {}
  };

  // --- ACCIONES DE ADMIN (AGREGAR Y EDITAR) ---
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    if (editingId) {
      // ✏️ EDITAR
      const updatedList = products.map(p => 
        (p.id || p._id) === editingId 
          ? { ...p, name: productForm.name, price: Number(productForm.price), imageUrl: productForm.imageUrl } 
          : p
      );
      updateGlobalCatalog(updatedList);
      setEditingId(null);
    } else {
      // ➕ AGREGAR
      const newProd = {
        id: 'PROD-' + Date.now().toString(),
        name: productForm.name,
        price: Number(productForm.price),
        imageUrl: productForm.imageUrl
      };
      const updatedList = [...products, newProd];
      updateGlobalCatalog(updatedList);
    }

    setProductForm({ name: '', price: '', imageUrl: '' });
  };

  const handleStartEdit = (prod) => {
    setEditingId(prod.id || prod._id);
    setProductForm({
      name: prod.name,
      price: prod.price,
      imageUrl: prod.imageUrl || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProductForm({ name: '', price: '', imageUrl: '' });
  };

  // 🗑️ ELIMINAR
  const handleDeleteProduct = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto del catálogo?")) {
      const updatedList = products.filter(p => (p.id || p._id) !== id);
      updateGlobalCatalog(updatedList);
    }
  };

  // --- ACCIONES DE CLIENTE ---
  const handleAddToCart = async (product) => {
    const currentItems = basket.items || [];
    const prodId = product.id || product._id;
    const existing = currentItems.find(i => (i.productId || i.id) === prodId);
    
    let updatedItems = [];
    if (existing) {
      updatedItems = currentItems.map(i => 
        (i.productId || i.id) === prodId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedItems = [...currentItems, { 
        productId: prodId, 
        productName: product.name, 
        price: Number(product.price || 0), 
        quantity: 1 
      }];
    }

    const newBasket = { userName: activeUser, items: updatedItems };
    setBasket(newBasket);
    try { await basketService.updateBasket(newBasket); } catch (err) {}
  };

  const handleCheckout = async () => {
    if (!basket.items || basket.items.length === 0) return;

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
      if (res && (res.id || res._id)) fullOrder.id = res.id || res._id;
    } catch (err) {
    } finally {
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      localOrders.unshift(fullOrder);
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
          onClick={() => { loadGlobalCatalog(); setActiveTab('shop'); }}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'shop' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {isAdmin ? '📦 Administrar Catálogo' : '🛒 Tienda y Carrito'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          📋 {isAdmin ? 'Historial de Órdenes Globales' : 'Mis Órdenes'}
        </button>
      </div>

      {activeTab === 'history' ? (
        <OrdersList currentUser={currentUser} onSelectOrder={(order) => {
          setCreatedOrder(order);
          setActiveTab('shop');
        }} />
      ) : createdOrder ? (
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 print:hidden">
            <strong>¡Orden Generada Exitosamente!</strong> Revisa el detalle a continuación para imprimir tu comprobante.
          </div>
          <OrderReceipt order={createdOrder} onBack={() => setCreatedOrder(null)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO IZQUIERDO: FORMULARIO ADMIN + CATÁLOGO */}
          <div className="space-y-6">
            
            {/* FORMULARIO SOLO ADMIN */}
            {isAdmin && (
              <form onSubmit={handleSubmitProduct} className={`p-4 rounded shadow border ${editingId ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-bold text-lg ${editingId ? 'text-amber-900' : 'text-blue-900'}`}>
                    {editingId ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}
                  </h3>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="text-xs text-red-600 underline font-bold">
                      Cancelar Edición
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                  <input
                    type="url"
                    placeholder="URL de Imagen (Opcional)"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <button
                    type="submit"
                    className={`w-full font-bold py-2 rounded text-white text-sm ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {editingId ? 'Actualizar Producto' : 'Guardar en Catálogo'}
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE PRODUCTOS DEL CATÁLOGO */}
            <div className="bg-white p-4 rounded shadow border">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📦 Productos del Catálogo</h3>
              
              {products.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No hay productos en el catálogo.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((p) => {
                    const prodId = p.id || p._id;
                    return (
                      <div key={prodId} className="flex justify-between items-center border p-3 rounded gap-4 hover:shadow-sm transition">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded border" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">🛍️</div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                            <p className="text-green-600 font-semibold text-sm">${Number(p.price || 0).toFixed(2)}</p>
                          </div>
                        </div>

                        {/* ACCIONES POR ROL */}
                        {isAdmin ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded hover:bg-amber-600 font-bold"
                              title="Editar producto"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prodId)}
                              className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 font-bold"
                              title="Eliminar producto"
                            >
                              🗑️
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 font-bold shadow-sm"
                          >
                            + Añadir
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* LADO DERECHO: CARRITO (CLIENTE) O MENSAJE (ADMIN) */}
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

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">Total Acumulado:</span>
                  <span className="text-xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading || !basket.items || basket.items.length === 0}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:bg-gray-300 transition shadow"
                >
                  {loading ? 'Procesando...' : '⚙️ Finalizar Compra (Checkout)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded border text-center flex flex-col justify-center items-center text-gray-500">
              <span className="text-5xl mb-3">🛠️</span>
              <p className="font-bold text-lg text-gray-700">Modo Administrador Activo</p>
              <p className="text-sm max-w-xs mt-1">
                Usa el panel de la izquierda para <b>crear</b> productos, <b>editar</b> los existentes o <b>eliminarlos</b>. Los clientes verán los cambios inmediatamente.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}