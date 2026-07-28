import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [openCatalog, setOpenCatalog] = useState(false);
  const [openBasket, setOpenBasket] = useState(false);

  return (
    <nav className="bg-gray-800 text-white shadow-md relative z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:text-blue-400 transition">
          🛒 <span>MicroserviceApp</span>
        </Link>

        <div className="flex gap-6">
          {/* DESPLEGABLE: PRODUCTOS */}
          <div className="relative">
            <button 
              onClick={() => { setOpenCatalog(!openCatalog); setOpenBasket(false); }}
              className="hover:text-blue-400 font-medium flex items-center gap-1 focus:outline-none py-2"
            >
              Productos <span>▼</span>
            </button>
            {openCatalog && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-2 border">
                <Link to="/products" onClick={() => setOpenCatalog(false)} className="block px-4 py-2 hover:bg-gray-100">
                  📋 Lista General
                </Link>
                <Link to="/products?filter=category" onClick={() => setOpenCatalog(false)} className="block px-4 py-2 hover:bg-gray-100 font-semibold text-blue-600">
                  🔍 Buscar por Categoría
                </Link>
                <Link to="/products/create" onClick={() => setOpenCatalog(false)} className="block px-4 py-2 hover:bg-gray-100">
                  ➕ Agregar Producto
                </Link>
              </div>
            )}
          </div>

          {/* DESPLEGABLE: CARRITOS */}
          <div className="relative">
            <button 
              onClick={() => { setOpenBasket(!openBasket); setOpenCatalog(false); }}
              className="hover:text-blue-400 font-medium flex items-center gap-1 focus:outline-none py-2"
            >
              Carritos <span>▼</span>
            </button>
            {openBasket && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-2 border">
                <Link to="/baskets/create" onClick={() => setOpenBasket(false)} className="block px-4 py-2 hover:bg-gray-100 text-green-600 font-semibold">
                  🛒 Crear Carrito
                </Link>
                <Link to="/baskets/search" onClick={() => setOpenBasket(false)} className="block px-4 py-2 hover:bg-gray-100">
                  👤 Buscar por Usuario
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}