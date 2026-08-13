import React, { useState, useEffect } from 'react';
import { basketService } from '../services/basketService';
// Importa tus otros servicios como orderAPI, catalogAPI, etc.

export default function BasketManager({ currentUser }) {
  const isAdmin = currentUser.role === 'admin';
  const [activeTab, setActiveTab] = useState('tienda');
  
  // Estados
  const [products, setProducts] = useState([
    { id: '1', name: 'Casco AGV', price: 7999.99 },
    { id: '2', name: 'Iphone 17 pro max', price: 25000.00 }
  ]); // Debería venir de tu API de catálogo
  const [basket, setBasket] = useState({ userName: currentUser.username, items: [] });
  const [allOrders, setAllOrders] = useState([]); // Tus órdenes cargadas del backend

  // Formularios
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  // ---------------- LÓGICA DE USUARIO (CLIENTE) ----------------
  const handleAddToCart = async (product) => {
    // (Pega aquí la lógica tolerante a fallos que armamos antes)
    const currentItems = basket.items || [];
    const prodId = product.id || product._id;
    const existing = currentItems.find(i => (i.productId || i.id) === prodId);
    
    let updatedItems = [];
    if (existing) {
      updatedItems = currentItems.map(i => 
        (i.productId || i.id) === prodId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedItems = [...currentItems, { productId: prodId, productName: product.name, price: Number(product.price), quantity: 1 }];
    }

    const newBasket = { userName: currentUser.username, items: updatedItems };
    setBasket(newBasket);
    try { await basketService.updateBasket(newBasket); } catch (err) { console.warn("Backend offline, en memoria."); }
  };

  // ---------------- LÓGICA DE ADMIN ----------------
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    const prodToAdd = { id: Date.now().toString(), name: newProduct.name, price: Number(newProduct.price) };
    setProducts([...products, prodToAdd]);
    // Aquí harías tu POST a la API del catálogo: catalogAPI.addProduct(prodToAdd)
    
    setNewProduct({ name: '', price: '' });
    alert("Producto agregado al catálogo exitosamente");
  };

  // ---------------- FILTRADO DE ÓRDENES ----------------
  // Si es admin ve todas. Si es cliente, filtramos por su username.
  const displayedOrders = isAdmin 
    ? allOrders 
    : allOrders.filter(o => o.userName?.toLowerCase() === currentUser.username.toLowerCase());


  return (
    <div>
      {/* Pestañas (Tabs) */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('tienda')} style={{ fontWeight: activeTab === 'tienda' ? 'bold' : 'normal', border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', color: activeTab === 'tienda' ? '#007bff' : '#666' }}>
          {isAdmin ? '📦 Administrar Catálogo' : '🛒 Tienda y Carrito'}
        </button>
        <button onClick={() => setActiveTab('ordenes')} style={{ fontWeight: activeTab === 'ordenes' ? 'bold' : 'normal', border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', color: activeTab === 'ordenes' ? '#007bff' : '#666' }}>
          📋 {isAdmin ? 'Todas las Órdenes' : 'Mis Órdenes'}
        </button>
      </div>

      {/* --- VISTA: TIENDA / ADMINISTRAR --- */}
      {activeTab === 'tienda' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* Lado Izquierdo: Catálogo de Productos */}
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>Catálogo {isAdmin ? '(Edición)' : ''}</h3>
            
            {/* Si es Admin, mostramos formulario para agregar producto */}
            {isAdmin && (
              <form onSubmit={handleAddProduct} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h4>➕ Agregar Nuevo Producto</h4>
                <input type="text" placeholder="Nombre" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ marginRight: '10px', padding: '5px' }} />
                <input type="number" placeholder="Precio" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ marginRight: '10px', padding: '5px' }} />
                <button type="submit" style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar</button>
              </form>
            )}

            {/* Lista de productos */}
            {products.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                <span>{p.name} - ${p.price}</span>
                {/* Botón Añadir SOLO para usuarios */}
                {!isAdmin && <button onClick={() => handleAddToCart(p)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>+ Añadir</button>}
              </div>
            ))}
          </div>

          {/* Lado Derecho: Carrito de Compras (SOLO visible para Clientes) */}
          {!isAdmin && (
            <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h3>Mi Carrito ({currentUser.username})</h3>
              {basket.items?.length === 0 ? (
                <p>No has agregado productos aún.</p>
              ) : (
                <>
                  {basket.items.map(item => (
                    <div key={item.productId}>
                      {item.quantity}x {item.productName} - ${item.price}
                    </div>
                  ))}
                  {/* Aquí iría tu botón de Checkout y tu componente de Impresión PDF */}
                  <hr/>
                  <button style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', fontWeight: 'bold' }}>Finalizar Compra</button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- VISTA: HISTORIAL DE ÓRDENES --- */}
      {activeTab === 'ordenes' && (
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <h3>{isAdmin ? 'Órdenes Globales del Sistema' : 'Mi Historial de Compras'}</h3>
          {displayedOrders.length === 0 ? (
            <p>{isAdmin ? 'No hay órdenes registradas de ningún usuario.' : 'Aún no has realizado ninguna compra.'}</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>ID Orden</th>
                  {isAdmin && <th>Cliente</th> /* Solo el admin necesita ver de quién es */}
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map(order => (
                  <tr key={order.id || order._id}>
                    <td>{order.id || order._id}</td>
                    {isAdmin && <td>{order.userName}</td>}
                    <td>${order.totalPrice}</td>
                    <td><button>Imprimir PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}