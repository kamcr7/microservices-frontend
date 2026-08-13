import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';
import { createOrder } from '../services/orderingService';

export default function BasketManager() {
  const [searchUser, setSearchUser] = useState('Saul');
  const [basket, setBasket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const fetchBasket = async (userName) => {
    if (!userName) return;
    setLoading(true);
    setOrderResult(null);
    try {
      const data = await basketService.getBasketByUser(userName);
      setBasket(data);
    } catch (error) {
      console.error("Error al obtener carrito:", error);
      setBasket(null);
    } finally {
      setLoading(false);
    }
  };

  // Carga automática del carrito al entrar a la página
  useEffect(() => {
    fetchBasket(searchUser);
  }, []);

  const handleQuantityChange = async (productId, delta) => {
    if (!basket) return;
    
    let updatedItems = basket.items.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    const updatedBasket = { ...basket, items: updatedItems };
    setBasket(updatedBasket);

    try {
      await basketService.updateBasket({
        userName: basket.userName,
        items: updatedItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity
        }))
      });
    } catch (err) {
      alert("Error al actualizar el carrito");
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!basket) return;
    const updatedItems = basket.items.filter(item => item.productId !== productId);
    const updatedBasket = { ...basket, items: updatedItems };
    setBasket(updatedBasket);

    try {
      await basketService.updateBasket({
        userName: basket.userName,
        items: updatedItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity
        }))
      });
    } catch (err) {
      alert("Error al eliminar producto del carrito");
    }
  };

  const handleCheckout = async () => {
    if (!basket || !basket.items || basket.items.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setLoading(true);
    try {
      let result;
      try {
        result = await createOrder(basket.userName, basket.userName);
      } catch (e) {
        result = await basketService.checkout(basket.userName);
      }
      
      setOrderResult(result);
      setBasket({ ...basket, items: [] });
    } catch (error) {
      alert(`Error al procesar la orden: ${error.message || "Inténtalo de nuevo."}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!basket || !basket.items) return 0;
    return basket.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg border mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">🔍 Buscar / Editar Carrito</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          placeholder="Nombre de usuario..."
          className="border p-2 rounded flex-1 text-gray-700"
        />
        <button
          onClick={() => fetchBasket(searchUser)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          Consultar
        </button>
      </div>

      {loading && <p className="text-center text-gray-500 my-4">Cargando...</p>}

      {orderResult && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg">🎉 ¡Orden Creada con Éxito!</h3>
          <p><strong>Detalles:</strong> Orden procesada correctamente para {searchUser}.</p>
        </div>
      )}

      {basket && basket.items && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">🛒 Carrito de {basket.userName}</h3>
          
          {basket.items.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">El carrito está vacío.</p>
          ) : (
            <div className="space-y-3">
              {basket.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                    <p className="text-sm text-gray-500">Precio unitario: ${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-l text-gray-700 font-bold"
                      >
                        -
                      </button>

                      <span className="px-3 font-semibold text-gray-800">{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-r text-gray-700 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                      title="Eliminar producto"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t mt-4 font-bold text-lg">
                <span>Total Acumulado:</span>
                <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow"
              >
                🏁 Finalizar Compra (Checkout)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}