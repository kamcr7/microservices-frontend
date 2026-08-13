import React, { useEffect, useState } from 'react';
import { checkoutService } from '../services/checkoutService';

export const OrdersList = ({ activeUser, onSelectOrder }) => {
  const [orders, setOrders] = useState([]);
  const [filterMode, setFilterMode] = useState('user'); // 'user' o 'all'
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let data = [];
      if (filterMode === 'user' && activeUser) {
        data = await checkoutService.getOrdersByCustomer(activeUser); // GET /api/orders/customer/{id}[cite: 1]
      } else {
        data = await checkoutService.getAllOrders(); // GET /api/orders[cite: 1]
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar órdenes", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterMode, activeUser]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Historial de Órdenes de Compra</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterMode('user')}
            className={`px-3 py-1 rounded text-sm ${filterMode === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Órdenes de {activeUser}
          </button>
          <button 
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded text-sm ${filterMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todas las Órdenes
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando órdenes...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No se encontraron órdenes registradas.</p>
      ) : (
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">ID Orden</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Total</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id || o._id}>
                <td className="p-2 font-mono text-xs">{o.id || o._id}</td>
                <td className="p-2">{o.customerId || o.userName}</td>
                <td className="p-2">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                <td className="p-2 font-bold">${Number(o.total || o.totalPrice || 0).toFixed(2)}</td>
                <td className="p-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{o.status || 'Pending'}</span>
                </td>
                <td className="p-2">
                  <button 
                    onClick={() => onSelectOrder(o)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Ver / Imprimir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};