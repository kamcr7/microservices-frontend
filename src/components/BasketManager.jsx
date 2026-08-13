import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';
import { catalogService } from '../services/catalogService';

export default function BasketManager() {
  const [searchUser, setSearchUser] = useState('Saul');
  const [basket, setBasket] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    loadCatalog();
    fetchBasket(searchUser);
  }, []);

  const loadCatalog = async () => {
    try {
      setCatalogLoading(true);
      const data = await catalogService.getProducts();
      console.log("Catálogo cargado:", data);
      const productsList = Array.isArray(data) ? data : (data?.data || []);
      setCatalog(productsList);
    } catch (err) {
      console.error("Error al obtener catálogo:", err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchBasket = async (userName) => {
    const cleanUser = userName.trim();
    if (!cleanUser) return;
    setLoading(true);
    setCreatedOrder(null);
    try {
      const response = await basketService.getBasketByUser(cleanUser);
      const cartData = response?.cart || response;
      if (cartData && Array.isArray(cartData.items)) {
        setBasket({
          userName: cartData.userName || cleanUser,
          items: cartData.items
        });
      } else {
        setBasket({ userName: cleanUser, items: [] });
      }
    } catch (error) {
      console.error("Error al buscar el carrito:", error);
      setBasket({ userName: cleanUser, items: [] });
    } finally {
      setLoading(false);
    }
  };

  const updateBasketInServer = async (updatedBasket) => {
    try {
      await basketService.updateBasket(updatedBasket);
      setBasket(updatedBasket);
    } catch (err) {
      console.error("Error al actualizar el carrito:", err);
      alert("Error al actualizar el carrito en el servidor");
    }
  };

  const handleAddFromCatalog = (product) => {
    if (!basket) return;

    const prodId = product.id || product._id || product.productId || `prod-${Date.now()}`;
    const prodName = product.name || product.productName;
    const prodPrice = product.price || 0;

    const existingIndex = basket.items.findIndex(
      (i) => (i.productId || i.id || i._id) === prodId
    );

    let updatedItems = [...basket.items];

    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
    } else {
      updatedItems.push({
        productId: prodId,
        productName: prodName,
        price: prodPrice,
        quantity: 1
      });
    }

    updateBasketInServer({ ...basket, items: updatedItems });
  };

  const handleQuantityChange = (productId, delta) => {
    if (!basket) return;
    const updatedItems = basket.items
      .map((item) => {
        const id = item.productId || item.id || item._id;
        if (id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    updateBasketInServer({ ...basket, items: updatedItems });
  };

  const handleRemoveItem = (productId) => {
    if (!basket) return;
    const updatedItems = basket.items.filter(
      (item) => (item.productId || item.id || item._id) !== productId
    );
    updateBasketInServer({ ...basket, items: updatedItems });
  };

  const handleCheckout = async () => {
    if (!basket || !basket.items || basket.items.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    if (!window.confirm(`¿Proceder a generar la orden para ${basket.userName}?`)) return;

    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const payload = {
        customerId: basket.userName,
        basketId: basket.userName,
        items: basket.items.map((i) => ({
          productId: i.productId || i.id || i._id || "prod-1",
          productName: i.productName,
          unitPrice: i.price || i.unitPrice || 0,
          quantity: i.quantity
        }))
      };

      const response = await fetch('https://ordering-api-n8co.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 201) {
        const orderData = await response.json();
        setCreatedOrder(orderData);
        const emptyBasket = { ...basket, items: [] };
        setBasket(emptyBasket);
        await updateBasketInServer(emptyBasket);
      } else {
        const errText = await response.text();
        alert(`Error en el servidor (${response.status}): ${errText || 'No se pudo procesar la orden.'}`);
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error de conexión con el Microservicio de Órdenes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!basket || !basket.items) return 0;
    return basket.items.reduce((acc, i) => acc + (i.price || i.unitPrice || 0) * i.quantity, 0);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg border mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">🔍 Buscar / Editar Carrito</h2>

      {/* Buscador de usuario */}
      <div className="flex gap-3 mb-6 bg-gray-50 p-4 rounded-lg border">
        <label className="text-gray-700 font-semibold flex items-center">Usuario Activo:</label>
        <input
          type="text"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          placeholder="Ej: Saul, Mark..."
          className="flex-1 border p-2 rounded shadow-sm focus:outline-blue-500"
        />
        <button
          onClick={() => fetchBasket(searchUser)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
        >
          Consultar / Cambiar
        </button>
      </div>

      {/* Confirmación de Orden */}
      {createdOrder && (
        <div className="mb-6 bg-green-50 border border-green-400 p-5 rounded-lg text-green-900">
          <h3 className="text-xl font-bold text-green-800 mb-2">🎉 ¡Orden Generada Exitosamente!</h3>
          <p><strong>ID de Orden:</strong> {createdOrder.id}</p>
          <p><strong>Cliente:</strong> {createdOrder.customerId}</p>
          <p><strong>Estado:</strong> <span className="bg-green-200 px-2 py-0.5 rounded text-xs font-bold">{createdOrder.status || 'Pending'}</span></p>
          <p className="text-lg font-bold mt-2">Total Pagado: ${createdOrder.total ? createdOrder.total.toFixed(2) : '0.00'}</p>
        </div>
      )}

      {loading ? (
        <p className="text-center py-8 text-gray-500">Cargando datos del carrito...</p>
      ) : basket ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna Izquierda: Productos del Catálogo */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              📦 Productos del Catálogo
            </h3>
            {catalogLoading ? (
              <p className="text-sm text-gray-500">Cargando catálogo...</p>
            ) : catalog.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No hay productos disponibles en el catálogo.</p>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {catalog.map((prod) => (
                  <div
                    key={prod.id || prod._id || prod.productId}
                    className="flex justify-between items-center p-3 bg-white border rounded shadow-sm hover:border-blue-300 transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{prod.name || prod.productName}</p>
                      <p className="text-green-600 font-bold text-sm">${prod.price}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFromCatalog(prod)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-semibold transition"
                    >
                      + Añadir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Carrito Activo */}
          <div className="border rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-blue-700 border-b pb-2 mb-3">
                🛒 Carrito de {basket.userName}
              </h3>

              {basket.items.length === 0 ? (
                <p className="text-gray-400 italic text-center py-8">
                  No has agregado productos aún.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {basket.items.map((item) => {
                    const itemId = item.productId || item.id || item._id;
                    return (
                      <div
                        key={itemId}
                        className="flex justify-between items-center bg-white p-3 rounded border shadow-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                          <p className="text-gray-500 text-xs">
                            ${(item.price || item.unitPrice)?.toFixed(2)} c/u
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(itemId, -1)}
                              className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(itemId, 1)}
                              className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(itemId)}
                            className="text-red-500 hover:text-red-700 font-bold px-1 text-lg"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total y Checkout */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4 text-lg font-bold">
                <span>Total Acumulado:</span>
                <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={basket.items.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg shadow transition"
              >
                🏁 Finalizar Compra (Checkout)
              </button>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}