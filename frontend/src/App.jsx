import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [verLogin, setVerLogin] = useState(false);
  const [verCrear, setVerCrear] = useState(false);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  const cargarProductos = () => {
    fetch('http://127.0.0.1:8000/productos/')
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error al obtener productos:', err));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email) {
      setUsuario({ email });
      setVerLogin(false);
      setEmail('');
    }
  };

  const handleCrearProducto = (e) => {
    e.preventDefault();
    const payload = {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      estado_fisico: 'nuevo',
      id_categoria: 1,
      id_usuario: 1
    };

    fetch('http://127.0.0.1:8000/productos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        cargarProductos();
        setVerCrear(false);
        setNombre('');
        setDescripcion('');
        setPrecio('');
      })
      .catch((err) => console.error('Error al crear producto:', err));
  };

  return (
    <div>
      <header className="navbar">
        <div className="brand-logo">REVEN<span>FY</span></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {usuario ? (
            <>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>{usuario.email}</span>
              <button className="btn-accent" onClick={() => setVerCrear(true)}>+ Nuevo Producto</button>
              <button className="btn-outline" onClick={() => setUsuario(null)}>Salir</button>
            </>
          ) : (
            <button className="btn-accent" onClick={() => setVerLogin(true)}>Iniciar Sesión</button>
          )}
        </div>
      </header>

      <main className="main-container">
        <h2 className="section-title">Catálogo de Productos</h2>

        {productos.length === 0 ? (
          <div className="product-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#94a3b8' }}>No hay productos registrados en la base de datos.</p>
          </div>
        ) : (
          <div className="product-grid">
            {productos.map((p) => (
              <div key={p.id_producto || p.id} className="product-card">
                <div>
                  <h3 className="card-title">{p.nombre}</h3>
                  <p className="card-desc">{p.descripcion}</p>
                </div>
                <div className="card-footer">
                  <span className="price-tag">${p.precio}</span>
                  <button className="btn-accent">Comprar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Login */}
      {verLogin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ marginBottom: '20px' }}>Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  placeholder="admin@revenfy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn-outline" onClick={() => setVerLogin(false)}>Cancelar</button>
                <button type="submit" className="btn-accent">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Producto */}
      {verCrear && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ marginBottom: '20px' }}>Agregar Producto</h2>
            <form onSubmit={handleCrearProducto}>
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input type="text" className="form-input" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input type="text" className="form-input" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Precio ($)</label>
                <input type="number" className="form-input" required value={precio} onChange={(e) => setPrecio(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn-outline" onClick={() => setVerCrear(false)}>Cancelar</button>
                <button type="submit" className="btn-accent">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;