import React, { useState } from 'react';
import { basketService } from '../services/basketService';

export default function BasketManager() {
  const [searchUser, setSearchUser] = useState('');
  const [basket, setBasket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null); // Estado para mostrar confirmación

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanUser = searchUser.trim();
    if (!cleanUser) return;

    try {
      setLoading(true);
      setSearched(true);
      setCreatedOrder(null); // Limpiar orden previa si busca de nuevo
      
      const response = await basketService.getBasketByUser(cleanUser);
      console.log("Datos del carrito obtenidos:", response);
      
      const cartData = response?.cart || response;
      
      if (cartData && Array.isArray(cartData.items) && cartData.items.length > 0) {
        setBasket({
          userName: cartData.userName || cleanUser,
          items: cartData.items
        });
      } else {
        setBasket(null);
      }
    } catch (error) {
      console.error("Error al buscar el carrito:", error);
      setBasket(null);
    } finally {
      setLoading(false);
    }
  };

  // Función actualizada para llamar al microservicio Ordering.API enviando los items
  const handleCheckout = async () => {
    if (!basket || !basket.userName) return;
    if (!window.confirm(`¿Proceder a generar la orden para el usuario ${basket.userName}?`)) return;

    try {
      setLoading(true);
      const idempotencyKey = crypto.randomUUID(); // Idempotency-Key requerida

      const response = await fetch('https://ordering-api-n8co.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          customerId: basket.userName,
          basketId: basket.userName,
          items: basket.items.map(item => ({
            productId: item.productId || "prod-1",
            productName: item.productName,
            unitPrice: item.price || item.unitPrice,
            quantity: item.quantity
          }))
        })
      });

      if (response.ok || response.status === 201) {
        const orderData = await response.json();
        setCreatedOrder(orderData); // Guardar datos para confirmación visual
        setBasket(null);
        setSearched(false);
        setSearchUser('');
      } else {
        const errorText = await response.text();
        alert(`Error (${response.status}): ${errorText || 'No se pudo procesar la orden.'}`);
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error de conexión con el Microservicio de Órdenes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow border mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🔍 Buscar Carrito por Usuario</h2>
      
      <form onSubmit={handleSearch} className="flex gap-4 items-center mb-6 bg-gray-50 p-4 rounded-lg border">
        <label className="text-gray-700 font-semibold whitespace-nowrap">Usuario Activo:</label>
        <input 
          type="text" 
          placeholder="Ej: Saul, Mark..." 
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="flex-1 border p-2 rounded shadow-sm focus:outline-blue-500"
          required
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Consultar / Cambiar
        </button>
      </form>

      {/* Pantalla de Confirmación de la Orden */}
      {createdOrder && (
        <div className="mb-6 bg-green-50 border border-green-300 p-5 rounded-lg text-green-900">
          <h3 className="text-xl font-bold text-green-800 mb-2">🎉 ¡Orden Generada Exitosamente!</h3>
          <p><strong>ID de Orden:</strong> {createdOrder.id}</p>
          <p><strong>Cliente:</strong> {createdOrder.customerId}</p>
          <p><strong>Estado:</strong> <span className="bg-green-200 px-2 py-0.5 rounded text-xs font-bold">{createdOrder.status || 'Pending'}</span></p>
          <p><strong>Fecha:</strong> {createdOrder.createdAt ? new Date(createdOrder.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
          <p className="text-lg font-bold mt-2">Total Pagado: ${createdOrder.total?.toFixed(2)}</p>
        </div>
      )}

      {loading ? (
        <p className="text-center py-6 text-gray-500">Procesando solicitud...</p>
      ) : basket ? (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-600 text-white px-4 py-3 font-bold flex justify-between items-center">
            <span>🛒 Carrito Activo: {basket.userName}</span>
          </div>
          <div className="p-4 space-y-3">
            {basket.items.map((item, idx) => (
              <div key={item.productId || idx} className="flex justify-between items-center border-b pb-2 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{item.productName}</p>
                  <p className="text-gray-500">Precio: ${item.price?.toFixed(2)}</p>
                </div>
                <span className="bg-gray-100 px-3 py-1 rounded font-bold border text-gray-700">
                  Cant: {item.quantity}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 font-bold text-lg">
              <span className="text-gray-700">Total Acumulado:</span>
              <span className="text-green-600">
                ${basket.items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white font-bold py-2 mt-4 rounded hover:bg-green-700 transition shadow"
            >
              🏁 Finalizar Compra (Checkout)
            </button>
          </div>
        </div>
      ) : (
        searched && !createdOrder && (
          <p className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
            El carrito de <strong className="text-gray-600">{searchUser}</strong> está vacío o no existe.
          </p>
        )
      )}
    </div>
  );
}