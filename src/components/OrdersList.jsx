import React, { useState, useEffect } from 'react';

export const OrdersList = ({ currentUser, onSelectOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    setLoading(true);
    let apiOrders = [];

    // 1. Intentar cargar órdenes desde la API Backend
    try {
      const res = await fetch('https://ordering-api-n1co.onrender.com/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) apiOrders = data;
      }
    } catch (err) {
      console.warn("API de órdenes offline o no disponible, usando caché local.");
    }

    // 2. Cargar órdenes guardadas en localStorage
    const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');

    // 3. Fusionar ambas listas evitando duplicados por ID
    const mergedMap = new Map();
    [...localOrders, ...apiOrders].forEach(order => {
      const id = order.id || order._id;
      if (id && !mergedMap.has(id)) {
        mergedMap.set(id, order);
      }
    });

    const combinedOrders = Array.from(mergedMap.values());
    setOrders(combinedOrders);
    setLoading(false);
  };

  // 🔒 FILTRADO SEGÚN ROL:
  // Si es Admin ve todas. Si es Cliente, filtra por su nombre de usuario.
  const displayedOrders = isAdmin
    ? orders
    : orders.filter(order => 
        (order.userName || order.customerId || '').toLowerCase() === (currentUser?.username || '').toLowerCase()
      );

  if (loading) {
    return <p className="text-center py-8 text-gray-500">Cargando historial de órdenes...</p>;
  }

  return (
    <div className="bg-white p-6 rounded shadow border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {isAdmin ? '📋 Historial Global de Órdenes (Modo Admin)' : '📋 Mis Órdenes de Compra'}
          </h2>
          <p className="text-sm text-gray-500">
            {isAdmin 
              ? 'Viendo todas las transacciones realizadas por los clientes.' 
              : `Órdenes registradas para el usuario: ${currentUser?.username}`}
          </p>
        </div>
        <button 
          onClick={loadOrders}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 border"
        >
          🔄 Actualizar
        </button>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded border border-dashed text-gray-400">
          {isAdmin 
            ? 'No hay órdenes registradas en el sistema aún.' 
            : 'Aún no has realizado ninguna compra con tu cuenta.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="py-3 px-4">ID Órden</th>
                {isAdmin && <th className="py-3 px-4">Cliente / Usuario</th>}
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {displayedOrders.map((order) => (
                <tr key={order.id || order._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-700">
                    {order.id || order._id}
                  </td>
                  
                  {isAdmin && (
                    <td className="py-3 px-4 font-bold text-blue-600">
                      👤 {order.userName || order.customerId || 'Anónimo'}
                    </td>
                  )}

                  <td className="py-3 px-4 text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Reciente'}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    ${Number(order.total || order.totalPrice || 0).toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status || 'Completed'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectOrder && onSelectOrder(order)}
                      className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 shadow"
                    >
                      🖨️ Ver / Imprimir PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersList;