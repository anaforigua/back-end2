import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Store, Users, 
  ArrowRight, Package, MessageSquare, Heart, 
  User, LogOut, Search, Bell, PlusCircle, X, CheckCircle, Sparkles, ShieldCheck
} from 'lucide-react';

export default function App() {
  const [rolSeleccionado, setRolSeleccionado] = useState('AMBOS');
  const [flujoCompletado, setFlujoCompletado] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [creandoProducto, setCreandoProducto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: '',
    descripcion: '',
    precio: '',
    cantidad: 1,
    imagenes_producto: '',
    condicion_producto: 'Usado - Como nuevo',
    estado_producto: 'Disponible',
    id_categoria: 1,
    id_pais_de_origen: 1
  });

  useEffect(() => {
    if (flujoCompletado) {
      cargarDatos();
    }
  }, [flujoCompletado]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resPedidos, resProductos] = await Promise.all([
        fetch('http://127.0.0.1:8000/pedidos/').catch(() => null),
        fetch('http://127.0.0.1:8000/productos/').catch(() => null)
      ]);

      if (resPedidos && resPedidos.ok) {
        const dataPedidos = await resPedidos.json();
        setPedidos(dataPedidos);
      }
      if (resProductos && resProductos.ok) {
        const dataProductos = await resProductos.json();
        setProductos(dataProductos);
      }
    } catch (err) {
      console.error("Error al cargar datos del backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    setCreandoProducto(true);

    const payload = {
      ...nuevoProducto,
      precio: parseFloat(nuevoProducto.precio),
      cantidad: parseInt(nuevoProducto.cantidad),
      id_categoria: parseInt(nuevoProducto.id_categoria),
      id_pais_de_origen: parseInt(nuevoProducto.id_pais_de_origen)
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/productos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMensajeExito('¡Producto publicado exitosamente!');
        cargarDatos();
        setTimeout(() => {
          setMensajeExito('');
          setModalAbierto(false);
          setNuevoProducto({
            nombre_producto: '',
            descripcion: '',
            precio: '',
            cantidad: 1,
            imagenes_producto: '',
            condicion_producto: 'Usado - Como nuevo',
            estado_producto: 'Disponible',
            id_categoria: 1,
            id_pais_de_origen: 1
          });
        }, 1200);
      } else {
        alert('Error al publicar el producto.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor.');
    } finally {
      setCreandoProducto(false);
    }
  };

  // --- FLUJO DE SELECCIÓN DE ROLES (MOCKUP ALTA FIDELIDAD) ---
  if (!flujoCompletado) {
    return (
      <div className="min-h-screen bg-[#101626] text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
        {/* Luces decorativas de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#6A3FA6]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#263173]/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Branding */}
        <div className="text-center max-w-xl mb-12 z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#1E2D59]/60 border border-[#263173] backdrop-blur-md mb-6 shadow-xl">
            <div className="bg-gradient-to-tr from-[#6A3FA6] to-[#263173] p-2 rounded-xl text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Revenfy</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Bienvenido a la Plataforma.<br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              ¿Cómo quieres comenzar?
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto">
            Selecciona tu perfil principal para personalizar tu experiencia. Puedes cambiar o añadir roles en cualquier momento.
          </p>
        </div>

        {/* Tarjetas de Selección */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
          {/* Card COMPRADOR */}
          <div 
            onClick={() => setRolSeleccionado('COMPRADOR')}
            className={`bg-[#1A2440]/80 backdrop-blur-xl rounded-3xl p-7 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between items-center text-center relative group shadow-2xl ${
              rolSeleccionado === 'COMPRADOR' 
                ? 'border-[#6A3FA6] bg-[#1E2D59] scale-105 shadow-[#6A3FA6]/20 ring-4 ring-[#6A3FA6]/20' 
                : 'border-slate-800/80 hover:border-[#6A3FA6]/50 hover:bg-[#1A2440]'
            }`}
          >
            <div className="p-4 bg-[#6A3FA6]/10 border border-[#6A3FA6]/30 text-[#6A3FA6] rounded-2xl mb-5 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">COMPRADOR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explora productos de segunda mano, realiza compras seguras y gestiona tus pedidos fácilmente.
              </p>
            </div>
            <button className={`mt-6 w-full py-3 px-4 rounded-xl font-bold text-xs transition-all ${
              rolSeleccionado === 'COMPRADOR'
                ? 'bg-[#6A3FA6] text-white shadow-lg shadow-[#6A3FA6]/30'
                : 'bg-[#1E2D59]/60 text-slate-300 group-hover:bg-[#6A3FA6] group-hover:text-white'
            }`}>
              Quiero Comprar
            </button>
          </div>

          {/* Card AMBOS (RECOMENDADO) */}
          <div 
            onClick={() => setRolSeleccionado('AMBOS')}
            className={`bg-[#1A2440]/80 backdrop-blur-xl rounded-3xl p-7 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between items-center text-center relative group shadow-2xl ${
              rolSeleccionado === 'AMBOS' 
                ? 'border-[#6A3FA6] bg-[#1E2D59] scale-105 shadow-[#6A3FA6]/30 ring-4 ring-[#6A3FA6]/20' 
                : 'border-[#263173] hover:border-[#6A3FA6]/60 hover:bg-[#1A2440]'
            }`}
          >
            <span className="absolute -top-3.5 bg-gradient-to-r from-[#6A3FA6] to-[#263173] text-white text-[10px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg border border-purple-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300" /> Más recomendado
            </span>
            <div className="p-4 bg-[#263173]/40 border border-[#263173] text-indigo-300 rounded-2xl mb-5 mt-1 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">AMBOS (Comprador y Vendedor)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acceso completo a todas las funciones. Compra e inventaria artículos de segunda mano sin restricciones.
              </p>
            </div>
            <button className={`mt-6 w-full py-3 px-4 rounded-xl font-bold text-xs transition-all ${
              rolSeleccionado === 'AMBOS'
                ? 'bg-gradient-to-r from-[#6A3FA6] to-[#263173] text-white shadow-lg shadow-[#6A3FA6]/30'
                : 'bg-[#1E2D59] text-indigo-200 group-hover:bg-[#6A3FA6] group-hover:text-white'
            }`}>
              Quiero Comprar y Vender
            </button>
          </div>

          {/* Card VENDEDOR */}
          <div 
            onClick={() => setRolSeleccionado('VENDEDOR')}
            className={`bg-[#1A2440]/80 backdrop-blur-xl rounded-3xl p-7 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between items-center text-center relative group shadow-2xl ${
              rolSeleccionado === 'VENDEDOR' 
                ? 'border-[#6A3FA6] bg-[#1E2D59] scale-105 shadow-[#6A3FA6]/20 ring-4 ring-[#6A3FA6]/20' 
                : 'border-slate-800/80 hover:border-[#6A3FA6]/50 hover:bg-[#1A2440]'
            }`}
          >
            <div className="p-4 bg-[#263173]/30 border border-[#263173]/50 text-indigo-400 rounded-2xl mb-5 group-hover:scale-110 transition-transform">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">VENDEDOR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publica artículos de segunda mano, gestiona tu stock y vende a miles de clientes activos.
              </p>
            </div>
            <button className={`mt-6 w-full py-3 px-4 rounded-xl font-bold text-xs transition-all ${
              rolSeleccionado === 'VENDEDOR'
                ? 'bg-[#6A3FA6] text-white shadow-lg shadow-[#6A3FA6]/30'
                : 'bg-[#1E2D59]/60 text-slate-300 group-hover:bg-[#6A3FA6] group-hover:text-white'
            }`}>
              Quiero Vender
            </button>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <button
          disabled={!rolSeleccionado}
          onClick={() => setFlujoCompletado(true)}
          className={`mt-12 px-10 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-3 z-10 shadow-xl ${
            rolSeleccionado
              ? 'bg-gradient-to-r from-[#6A3FA6] to-[#263173] text-white hover:opacity-90 shadow-[#6A3FA6]/20 cursor-pointer scale-100 hover:scale-105'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          Continuar al Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // --- DASHBOARD PRINCIPAL (CON PALETA PERSONALIZADA) ---
  return (
    <div className="flex h-screen bg-[#101626] font-sans text-slate-200 relative overflow-hidden">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#1E2D59]/90 border-r border-[#263173]/50 text-white flex flex-col justify-between p-5 backdrop-blur-md shadow-2xl">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <div className="bg-gradient-to-tr from-[#6A3FA6] to-[#263173] p-2.5 rounded-2xl text-white shadow-lg shadow-[#6A3FA6]/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-wider text-white">Revenfy</span>
          </div>

          {/* User Profile Card */}
          <div className="p-3 bg-[#1A2440]/80 rounded-2xl flex items-center gap-3 border border-[#263173]/60 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6A3FA6] to-[#263173] flex items-center justify-center font-bold text-white text-sm shadow-md">
              AF
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Ana Forigua</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] bg-[#6A3FA6]/30 text-purple-300 px-2 py-0.5 rounded-full font-extrabold border border-[#6A3FA6]/50">
                  {rolSeleccionado}
                </span>
                <button 
                  onClick={() => setFlujoCompletado(false)} 
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1.5">
            <a href="#inicio" className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#6A3FA6] text-white font-bold text-xs shadow-lg shadow-[#6A3FA6]/20 transition-all">
              <Store className="w-4 h-4" /> Inicio
            </a>
            {(rolSeleccionado === 'VENDEDOR' || rolSeleccionado === 'AMBOS') && (
              <a href="#mis-productos" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:bg-[#1A2440] hover:text-white transition-all text-xs font-semibold">
                <Package className="w-4 h-4" /> Mis Productos
              </a>
            )}
            <a href="#mis-pedidos" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:bg-[#1A2440] hover:text-white transition-all text-xs font-semibold">
              <ShoppingBag className="w-4 h-4" /> Mis Pedidos
            </a>
            <a href="#mensajes" className="flex items-center justify-between px-3.5 py-3 rounded-xl text-slate-400 hover:bg-[#1A2440] hover:text-white transition-all text-xs font-semibold">
              <span className="flex items-center gap-3"><MessageSquare className="w-4 h-4" /> Mensajes</span>
              <span className="bg-[#6A3FA6] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">3</span>
            </a>
            <a href="#favoritos" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:bg-[#1A2440] hover:text-white transition-all text-xs font-semibold">
              <Heart className="w-4 h-4" /> Favoritos
            </a>
            <a href="#perfil" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:bg-[#1A2440] hover:text-white transition-all text-xs font-semibold">
              <User className="w-4 h-4" /> Perfil
            </a>
          </nav>
        </div>

        <button 
          onClick={() => setFlujoCompletado(false)}
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all w-full font-semibold text-xs"
        >
          <LogOut className="w-4 h-4" /> Salir / Cambiar Rol
        </button>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar Navigation */}
        <header className="bg-[#1E2D59]/60 border-b border-[#263173]/40 px-8 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar productos, pedidos..." 
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#1A2440] border border-[#263173] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6A3FA6]"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-[#1A2440] hover:text-white rounded-xl relative transition-all border border-[#263173]/50">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-[#6A3FA6] rounded-full absolute top-2 right-2 ring-2 ring-[#101626]"></span>
            </button>
            {(rolSeleccionado === 'VENDEDOR' || rolSeleccionado === 'AMBOS') && (
              <button 
                onClick={() => setModalAbierto(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#6A3FA6] to-[#263173] text-white px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-[#6A3FA6]/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Publicar Producto
              </button>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Resumen</h1>
            <p className="text-xs text-slate-400 mt-0.5">Vista configurada para el rol: <strong className="text-purple-300">{rolSeleccionado}</strong></p>
          </div>

          {/* Tarjetas KPI Metric */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#1A2440]/70 p-5 rounded-2xl border border-[#263173]/60 flex items-center gap-4 backdrop-blur-sm shadow-xl">
              <div className="p-3 bg-[#6A3FA6]/20 border border-[#6A3FA6]/40 text-purple-300 rounded-xl"><Package className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-black text-white">{productos.length}</p>
                <p className="text-[11px] text-slate-400 font-medium">Productos publicados</p>
              </div>
            </div>

            <div className="bg-[#1A2440]/70 p-5 rounded-2xl border border-[#263173]/60 flex items-center gap-4 backdrop-blur-sm shadow-xl">
              <div className="p-3 bg-[#263173]/40 border border-[#263173] text-indigo-300 rounded-xl"><ShoppingBag className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-black text-white">{pedidos.length}</p>
                <p className="text-[11px] text-slate-400 font-medium">Pedidos activos</p>
              </div>
            </div>

            <div className="bg-[#1A2440]/70 p-5 rounded-2xl border border-[#263173]/60 flex items-center gap-4 backdrop-blur-sm shadow-xl">
              <div className="p-3 bg-[#6A3FA6]/20 border border-[#6A3FA6]/40 text-pink-300 rounded-xl"><MessageSquare className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-black text-white">3</p>
                <p className="text-[11px] text-slate-400 font-medium">Mensajes nuevos</p>
              </div>
            </div>

            <div className="bg-[#1A2440]/70 p-5 rounded-2xl border border-[#263173]/60 flex items-center gap-4 backdrop-blur-sm shadow-xl">
              <div className="p-3 bg-[#263173]/40 border border-[#263173] text-rose-300 rounded-xl"><Heart className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-black text-white">8</p>
                <p className="text-[11px] text-slate-400 font-medium">Favoritos</p>
              </div>
            </div>
          </div>

          {/* Tabla de datos de PostgreSQL */}
          <div className="bg-[#1A2440]/70 rounded-2xl border border-[#263173]/60 p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Pedidos Registrados (PostgreSQL Live)
              </h2>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400">Cargando registros desde la base de datos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1E2D59]/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-[#263173]/60">
                    <tr>
                      <th className="py-3 px-4">ID Pedido</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Tipo de Pago</th>
                      <th className="py-3 px-4">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263173]/40">
                    {pedidos.map((ped) => (
                      <tr key={ped.id_pedido || ped.id_pedidos} className="hover:bg-[#1E2D59]/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">#{ped.id_pedido || ped.id_pedidos}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            {ped.estado_pedido}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{ped.tipo_de_pago}</td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {ped.detalles?.length || 0} ítems registrados
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Crear Producto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-[#101626]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A2440] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative border border-[#263173]">
            <button 
              onClick={() => setModalAbierto(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-[#1E2D59]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Publicar Nuevo Producto</h2>
            <p className="text-xs text-slate-400 mb-6">Ingresa los datos para sincronizarlos con la base de datos.</p>

            {mensajeExito && (
              <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" /> {mensajeExito}
              </div>
            )}

            <form onSubmit={handleCrearProducto} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del producto *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Chaqueta Jean Vintage" 
                  value={nuevoProducto.nombre_producto}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre_producto: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1E2D59]/60 border border-[#263173] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6A3FA6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="45000" 
                    value={nuevoProducto.precio}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-[#1E2D59]/60 border border-[#263173] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6A3FA6]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cantidad *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={nuevoProducto.cantidad}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, cantidad: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-[#1E2D59]/60 border border-[#263173] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#6A3FA6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción</label>
                <textarea 
                  rows="2"
                  placeholder="Detalles sobre uso, conservación..." 
                  value={nuevoProducto.descripcion}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1E2D59]/60 border border-[#263173] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6A3FA6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ID Categoría</label>
                  <input 
                    type="number" 
                    value={nuevoProducto.id_categoria}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, id_categoria: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-[#1E2D59]/60 border border-[#263173] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#6A3FA6]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ID País de Origen</label>
                  <input 
                    type="number" 
                    value={nuevoProducto.id_pais_de_origen}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, id_pais_de_origen: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-[#1E2D59]/60 border border-[#263173] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#6A3FA6]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 font-bold text-slate-300 bg-[#1E2D59] hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={creandoProducto}
                  className="px-5 py-2.5 font-bold text-white bg-gradient-to-r from-[#6A3FA6] to-[#263173] hover:opacity-90 rounded-xl shadow-lg shadow-[#6A3FA6]/30 transition-all cursor-pointer"
                >
                  {creandoProducto ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}