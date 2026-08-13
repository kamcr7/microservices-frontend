import React from 'react';

export const OrderReceipt = ({ order, onBack }) => {
  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-md print:shadow-none print:border-none print:w-full my-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orden de Compra</h2>
          <p className="text-sm text-gray-500">ID: {order.id || order._id}</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            {order.status || 'Pending'}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Datos del Cliente */}
      <div className="mb-6 bg-gray-50 p-3 rounded text-sm">
        <p><strong>Cliente / Usuario:</strong> {order.customerId || order.userName}</p>
      </div>

      {/* Tabla Desglosada de Productos */}
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="border-b text-gray-600 text-sm">
            <th className="py-2">Producto</th>
            <th className="py-2 text-center">Cant.</th>
            <th className="py-2 text-right">Precio Unit.</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y text-sm">
          {order.items && order.items.map((item, idx) => {
            const unitPrice = Number(item.unitPrice || item.price || 0);
            const lineTotal = Number(item.lineTotal || (unitPrice * item.quantity));
            return (
              <tr key={idx}>
                <td className="py-2">{item.productName || item.name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">${unitPrice.toFixed(2)}</td>
                <td className="py-2 text-right">${lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totales */}
      <div className="border-t pt-4 space-y-1 text-right text-sm">
        <p><span className="text-gray-600">Subtotal:</span> <strong>${Number(order.subtotal || (order.totalPrice * 0.84) || 0).toFixed(2)}</strong></p>
        <p><span className="text-gray-600">Impuestos (IVA 16%):</span> <strong>${Number(order.tax || (order.totalPrice * 0.16) || 0).toFixed(2)}</strong></p>
        <p className="text-lg font-bold text-gray-900 pt-2 border-t">
          Total Pagado: ${Number(order.total || order.totalPrice || 0).toFixed(2)}
        </p>
      </div>

      {/* Botón de Impresión PDF */}
      <div className="mt-6 flex justify-between print:hidden">
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Volver / Nueva Compra
          </button>
        )}
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex items-center gap-2 shadow"
        >
          🖨️ Imprimir Orden (PDF)
        </button>
      </div>
    </div>
  );
};