import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList'; 
import ProductCreate from './components/ProductCreate';
import BasketManager from './components/BasketManager'; // Búsqueda de carritos
import BasketCreate from './components/BasketCreate';   // Formulario de creación

const Home = () => (
  <div className="text-center mt-20">
    <h1 className="text-5xl font-bold text-blue-600 mb-4">MicroserviceApp</h1>
    <p className="text-gray-500 text-lg">Gestión de productos y carritos de compras distribuidos</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="container mx-auto mt-8 bg-transparent p-6 min-h-[500px]">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Rutas de Productos (Catalog) */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          
          {/* Rutas de Carritos (Basket) */}
          <Route path="/baskets/create" element={<BasketCreate />} />
          <Route path="/baskets/search" element={<BasketManager />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;