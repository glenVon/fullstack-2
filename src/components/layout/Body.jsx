import React, { useState } from 'react';
import '../../index.css';

const productos = [
  { id: 1, nombre: "New Mutants Combate el Futuro 3 de 3", precio: 5990, imagen: "./assets/covers/new mutants combate el futuro 3 de 3.jpg", enlace: "/compra.html" },
  { id: 2, nombre: "Patrulla X Especie en Peligro 13", precio: 8990, imagen: "/assets/covers/patrulla x especie en peligro 13.jpg", enlace: "/compra.html" },
  { id: 3, nombre: "Superior Ironman", precio: 15990, imagen: "/assets/covers/10043731/cap1/0.jpg", enlace: "/compra.html" },
  { id: 4, nombre: "New Mutant 9", precio: 5990, imagen: "/assets/covers/new mutant 9.jpg", enlace: "/compra.html" },
  { id: 5, nombre: "X-Men Black 1 - Mystique", precio: 5990, imagen: "/assets/covers/x-men black 1 Mistique.jpg", enlace: "/compra.html" },
  { id: 6, nombre: "Black Panther 9", precio: 5990, imagen: "/assets/covers/black panther 9.jpg", enlace: "/compra.html" },
  { id: 7, nombre: "Astonishing X-Men 8", precio: 12990, imagen: "/assets/covers/astonishing x-men 8.jpg", enlace: "/compra.html" },
  { id: 8, nombre: "Dark Avengers 8 Utopia", precio: 5990, imagen: "/assets/covers/dark avengers 8 utopia.jpg", enlace: "/compra.html" },
  { id: 9, nombre: "Dark Wolverine 75", precio: 5890, imagen: "/assets/covers/dark wolverine 75.jpg", enlace: "/compra.html" },
  { id: 10, nombre: "Astonishing X-Men Cajas Fantasmas 1 de 2", precio: 5990, imagen: "/assets/covers/astonishing x-men cajas fantasmas 1 de 2.jpg", enlace: "/compra.html" },
  { id: 11, nombre: "Deadpool Team-Up 884", precio: 15990, imagen: "/assets/covers/deadpool team-up 884.jpg", enlace: "/compra.html" },
  { id: 12, nombre: "Wolverines 003", precio: 5990, imagen: "/assets/covers/wolverines 003.jpg", enlace: "/compra.html" },
  { id: 13, nombre: "X-Force 17", precio: 5990, imagen: "/assets/covers/x-force 17.jpg", enlace: "/compra.html" },
  { id: 14, nombre: "Secret Warriors 7", precio: 6990, imagen: "/assets/covers/secret god of fear god of war warriors 7.jpg", enlace: "/compra.html" },
  { id: 15, nombre: "Dark Reign: The Invincible Iron Man 12", precio: 5990, imagen: "/assets/covers/dark reign the invincible iron man 12.jpg", enlace: "/compra.html" },
  { id: 16, nombre: "The Incredible Hercules 126", precio: 5990, imagen: "/assets/covers/the incredible hercules 126.jpg", enlace: "/compra.html" },
  { id: 17, nombre: "Punisher 9", precio: 5990, imagen: "/assets/covers/punisher 9.jpg", enlace: "/compra.html" },
  { id: 18, nombre: "Astonishing X-Men 51", precio: 7990, imagen: "/assets/covers/astonihing x-men 51.jpg", enlace: "/compra.html" },
  { id: 19, nombre: "age-on-cuneree", precio: 5990, imagen: "/assets/covers/age-on-cuneree.jpg", enlace: "/compra.html" },
  { id: 20, nombre: "astonish x-men 13", precio: 5990, imagen: "/assets/covers/astonish x-men 13.jpg", enlace: "/compra.html" },
  { id: 21, nombre: "astonish x-men 66", precio: 5000, imagen: "/assets/covers/astonish x-men 66.jpg", enlace: "/compra.html" },
  { id: 22, nombre: "astonish x-men 32", precio: 5990, imagen: "/assets/covers/astonish x-men 32.jpg", enlace: "/compra.html" },
  { id: 23, nombre: "astonish x-men xenogenesis 3 de 5", precio: 5990, imagen: "/assets/covers/astonish x-men xenogenesis 3 de 5.jpg", enlace: "/compra.html" },
  { id: 24, nombre: "cable 31", precio: 5990, imagen: "/assets/covers/cable 31.jpg", enlace: "/compra.html" },
  { id: 25, nombre: "clasic x-men 1", precio: 5990, imagen: "/assets/covers/clasic x-men 1.jpg", enlace: "/compra.html" },
  { id: 26, nombre: "clasic x-men 2", precio: 5990, imagen: "/assets/covers/clasic x-men 2.jpg", enlace: "/compra.html" },
  { id: 27, nombre: "d-marvel-u", precio: 5890, imagen: "/assets/covers/d-marvel-u.jpg", enlace: "/compra.html" },
  { id: 28, nombre: "dark reign avengers la iniciativa 20", precio: 5990, imagen: "/assets/covers/dark reign avengers la iniciativa 20.jpg", enlace: "/compra.html" },
  { id: 29, nombre: "dark reign the list hulk 1", precio: 5990, imagen: "/assets/covers/dark reign the list hulk 1.jpg", enlace: "/compra.html" },
  { id: 30, nombre: "dark-wolverine-ten-f-al", precio: 5990, imagen: "/assets/covers/dark-wolverine-ten-f-al.jpg", enlace: "/compra.html" }
];

// Cargar todas las imágenes de covers en tiempo de compilación con Vite
const _imagenesCovers = import.meta.glob('../../images/covers/**/*.{jpg,jpeg,png}', { eager: true, as: 'url' });

// Normalizamos a un mapa por nombre de archivo en minúsculas para buscar fácilmente
const imagenMap = {};
for (const ruta in _imagenesCovers) {
  const partes = ruta.split('/');
  const nombre = partes[partes.length - 1].toLowerCase();
  imagenMap[nombre] = _imagenesCovers[ruta];
}

// Normalizar cadenas: quitar acentos y pasar a minúsculas
function normalize(str = '') {
  return str
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function filterProductos(lista, term) {
  if (!term) return lista;
  const t = normalize(term);
  return lista.filter(p => normalize(p.nombre).includes(t));
}

// Función para resolver la URL real de la imagen
function getImagenUrl(rutaOriginal, productoNombre) {
  if (!rutaOriginal) return '';

  // extraer solo el nombre del archivo
  const partes = rutaOriginal.split('/');
  const nombreArchivo = partes[partes.length - 1].toLowerCase();

  // Intentos de búsqueda:
  // 1) nombre tal cual en minúsculas
  if (imagenMap[nombreArchivo]) return imagenMap[nombreArchivo];

  // 2) reemplazar espacios por '%20' o por guiones bajos
  const reemplazos = [nombreArchivo.replace(/ /g, '%20'), nombreArchivo.replace(/ /g, '_'), nombreArchivo.replace(/ /g, '-')];
  for (const r of reemplazos) {
    if (imagenMap[r]) return imagenMap[r];
  }

  // 3) buscar por coincidencia parcial (contiene) - toma la primera coincidencia
  const keys = Object.keys(imagenMap);
  const parcial = keys.find(k => k.includes(nombreArchivo.replace(/\.[^.]+$/, '')));
  if (parcial) return imagenMap[parcial];

  // 4) Intento adicional: si se nos pasa el nombre del producto, buscar coincidencias
  if (productoNombre) {
    const target = normalize(productoNombre).replace(/\s+/g, ' ');
    for (const k of keys) {
      const baseNoExt = k.replace(/\.[^.]+$/, '');
      const normKey = normalize(baseNoExt).replace(/\s+/g, ' ');
      if (normKey.includes(target) || target.includes(normKey)) {
        return imagenMap[k];
      }
    }
  }

  // 5) como fallback, devolver la ruta original
  return rutaOriginal;
}

export const Body = ({ searchTerm = '' }) => {
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarPagoExito, setMostrarPagoExito] = useState(false);
  const [modoPago, setModoPago] = useState(false);

  const agregarAlCarrito = (id) => {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    setCarrito(prevCarrito => {
      const existente = prevCarrito.find(item => item.id === id);
      if (existente) {
        return prevCarrito.map(item =>
          item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        return [...prevCarrito, { ...producto, cantidad: 1 }];
      }
    });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const pagar = () => {
    setModoPago(false);
    setMostrarCarrito(false);
    setMostrarPagoExito(true);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setMostrarPagoExito(false);
  };

  const Producto = ({ producto }) => (
    <div className="producto">
      <div className="producto-overlay">
        <span className="precio">${producto.precio.toLocaleString('es-CL')}</span>
        <span 
          className="carrito-icono" 
          onClick={() => agregarAlCarrito(producto.id)}
          style={{ cursor: 'pointer' }}
        >
          🛒
        </span>
      </div>
      <a href={producto.enlace}>
        <img 
          className="producto-imagen"
          src={getImagenUrl(producto.imagen, producto.nombre)}
          alt={producto.nombre}
        />
      </a>
    </div>
  );

  const CarritoPopup = () => {
    if (!mostrarCarrito) return null;

    return (
      <div className="popup-overlay active">
        <div className="popup-content">
          <h2>Carrito de Compras</h2>
          {carrito.length === 0 ? (
            <p>Tu carrito está vacío</p>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
                {carrito.map(item => (
                  <li key={item.id} style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{item.nombre}</strong>
                      <br />
                      <small>Cantidad: {item.cantidad}</small>
                    </div>
                    <div>${(item.precio * item.cantidad).toLocaleString('es-CL')}</div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <strong>Total: ${calcularTotal().toLocaleString('es-CL')}</strong>
              </div>
            </>
          )}
          
          {!modoPago ? (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {carrito.length > 0 && (
                <button 
                  onClick={() => setModoPago(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Proceder al Pago
                </button>
              )}
              <button 
                onClick={() => setMostrarCarrito(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {carrito.length > 0 ? 'Seguir Comprando' : 'Cerrar'}
              </button>
              {carrito.length > 0 && (
                <button 
                  onClick={vaciarCarrito}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Vaciar Carrito
                </button>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <h3>Selecciona forma de pago</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => pagar()} style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Tarjeta de Débito
                </button>
                <button onClick={() => pagar()} style={{ padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Tarjeta de Crédito
                </button>
                <button onClick={() => pagar()} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  PayPal
                </button>
                <button 
                  onClick={() => setModoPago(false)}
                  style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PagoExitoPopup = () => {
    if (!mostrarPagoExito) return null;

    return (
      <div className="popup-overlay active">
        <div className="popup-content">
          <h2>¡Pago Exitoso! 🎉</h2>
          <p>Que disfrutes tus comics :D</p>
          <p>Te llegará al correo la boleta de compra</p>
          <button 
            onClick={vaciarCarrito}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Botón para ver carrito */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => setMostrarCarrito(true)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🛒 Ver Carrito ({carrito.reduce((total, item) => total + item.cantidad, 0)})
        </button>
      </div>

      {/* Grid de productos */}
      <div className="contenedor">
        {filterProductos(productos, searchTerm).map(producto => (
          <Producto key={producto.id} producto={producto} />
        ))}
      </div>

      {/* Popups */}
      <CarritoPopup />
      <PagoExitoPopup />
    </div>
  );
};