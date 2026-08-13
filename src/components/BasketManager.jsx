import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';

export default function BasketManager() {
  const [searchUser, setSearchUser] = useState('Saul');
  const [basket, setBasket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  
  // Estados para el nuevo formulario de agregar producto
  const [newProduct, setNewProduct] = useState({ productId: '', productName: '', price: '', quantity: 1 });

  const fetchBasket = async (userName) => {
    const cleanUser = userName.trim();
    if (!cleanUser) return;
    setLoading(true);
    setCreatedOrder(null);
    try {
      const response = await basketService.getBasketByUser(cleanUser);
      const cartData = response?.cart || response;
      setBasket({
        userName: cartData.userName || cleanUser,
        items: cartData.items || []
      });
    } catch (error) {
      console.error("Error al buscar:", error);
      setBasket({ userName: cleanUser, items: [] }); // Inicializa vacío si no existe
    } finally {
      setLoading(false);
    }
  };

  const updateBasketInServer = async (currentBasket) => {
    try {
      await basketService.updateBasket(currentBasket);
      setBasket(currentBasket);
    } catch (err) {
      alert("Error guardando carrito en servidor: " + err.message);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.productId || !newProduct.productName || !newProduct.price) {
      alert("Por favor llena los datos del producto");
      return;
    }
    
    const productToAdd = {
      productId: newProduct.productId,
      productName: newProduct.productName,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity)
    };

    const currentItems = basket ? basket.items : [];
    const updatedItems = [...currentItems, productToAdd];
    
    updateBasketInServer({ userName: basket.userName, items: updatedItems });
    setNewProduct({ productId: '', productName: '', price: '', quantity: 1 });
  };

  const handleQuantityChange = (productId, delta) => {
    const updatedItems = basket.items.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    updateBasketInServer({ userName: basket.userName, items: updatedItems });
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = basket.items.filter(item => item.productId !== productId);
    updateBasketInServer({ userName: basket.userName, items: updatedItems });
  };

  const handleCheckout = async () => {
    if (!basket || basket.items.length === 0) return alert("Carrito vacío");
    
    setLoading(true);
    try {
      const payload = {
        customerId: basket.userName,
        basketId: basket.userName,
        items: basket.items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          unitPrice: i.price,
          quantity: i.quantity
        }))
      };

      console.log("Enviando orden:", payload); // Debug para ver qué se envía

      const response = await fetch('https://ordering-api-n8co.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Error en el servidor de órdenes");
      }

      const orderData = await response.json();
      setCreatedOrder(orderData);
      setBasket({ ...basket, items: [] }); // Limpiar carrito
      await updateBasketInServer({ userName: basket.userName, items: [] });
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Error en Checkout: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl border mt-6">
      <h2 className="text-2xl font-bold mb-4">🛒 Gestión de Carrito</h2>
      
      {/* Buscador */}
      <div className="flex gap-2 mb-6">
        <input className="border p-2 rounded flex-1" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
        <button onClick={() => fetchBasket(searchUser)} className="bg-blue-600 text-white px-4 py-2 rounded">Consultar</button>
      </div>

      {basket && (
        <>
          {/* Formulario Agregar Producto */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 border">
            <h3 className="font-bold mb-2">➕ Agregar Producto Manualmente</h3>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="ID" className="border p-1" value={newProduct.productId} onChange={e => setNewProduct({...newProduct, productId: e.target.value})} />
              <input placeholder="Nombre" className="border p-1" value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} />
              <input placeholder="Precio" type="number" className="border p-1" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <button onClick={handleAddProduct} className="bg-green-600 text-white font-bold rounded">Agregar</button>
            </div>
          </div>

          {/* Lista de Items */}
          <div className="space-y-2">
            {basket.items.map(item => (
              <div key={item.productId} className="flex justify-between items-center p-2 border-b">
                <span>{item.productName} (${item.price}) x {item.quantity}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleQuantityChange(item.productId, 1)} className="px-2 bg-gray-200">+</button>
                  <button onClick={() => handleQuantityChange(item.productId, -1)} className="px-2 bg-gray-200">-</button>
                  <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500">✕</button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleCheckout} className="w-full mt-6 bg-blue-700 text-white py-3 rounded font-bold">
            {loading ? "Procesando..." : "Finalizar Compra"}
          </button>
        </>
      )}

      {createdOrder && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">✅ Orden creada: {createdOrder.id}</div>
      )}
    </div>
  );
}