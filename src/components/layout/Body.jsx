import React, { useState } from 'react';
import '../../index.css' // Asegúrate de tener este archivo CSS


const productos = [
  { id: 1, nombre: "New Mutants Combate el Futuro 3 de 3", precio: 5990, imagen: "./assets/covers/new mutants combate el futuro 3 de 3.jpg", enlace: "/compra.html" },
  { id: 2, nombre: "Patrulla X Especie en Peligro 13", precio: 8990, imagen: "/assets/covers/patrulla x especie en peligro 13.jpg", enlace: "/compra.html" },
  { id: 3, nombre: "Superior Ironman", precio: 15990, imagen: "/assets/covers/10043731/cap1/0.jpg", enlace: "/compra.html" },
  { id: 4, nombre: "New Mutant 9", precio: 5990, imagen: "/assets/covers/new mutant 9.jpg", enlace: "/compra.html" },
  { id: 5, nombre: "Astonishing X-Men 51", precio: 7990, imagen: "/assets/covers/astonihing x-men 51.jpg", enlace: "/compra.html" },
  { id: 6, nombre: "Black Panther 9", precio: 5990, imagen: "/assets/covers/black panther 9.jpg", enlace: "/compra.html" },
  { id: 7, nombre: "Astonishing X-Men 8", precio: 12990, imagen: "/assets/covers/astonishing x-men 8.jpg", enlace: "/compra.html" },
  { id: 8, nombre: "Dark Avengers 8 Utopia", precio: 5990, imagen: "/assets/covers/dark avengers 8 utopia.jpg", enlace: "/compra.html" },
  { id: 9, nombre: "Dark Wolverine 75", precio: 5990, imagen: "/assets/covers/dark wolverine 75.jpg", enlace: "/compra.html" },
  { id: 10, nombre: "Astonishing X-Men Cajas Fantasmas 1 de 2", precio: 5990, imagen: "/assets/covers/astonishing x-men cajas fantasmas 1 de 2.jpg", enlace: "/compra.html" },
  { id: 11, nombre: "Deadpool Team-Up 884", precio: 5990, imagen: "/assets/covers/deadpool team-up 884.jpg", enlace: "/compra.html" },
  { id: 12, nombre: "Wolverines 003", precio: 5990, imagen: "/assets/covers/wolverines 003.jpg", enlace: "/compra.html" },
  { id: 13, nombre: "X-Force 17", precio: 5990, imagen: "/assets/covers/x-force 17.jpg", enlace: "/compra.html" },
  { id: 14, nombre: "Secret Warriors 7", precio: 5990, imagen: "/assets/covers/secret god of fear god of war warriors 7.jpg", enlace: "/compra.html" },
  { id: 15, nombre: "Dark Reign: The Invincible Iron Man 12", precio: 5990, imagen: "/assets/covers/dark reign the invincible iron man 12.jpg", enlace: "/compra.html" },
  { id: 16, nombre: "The Incredible Hercules 126", precio: 5990, imagen: "/assets/covers/the incredible hercules 126.jpg", enlace: "/compra.html" },
  { id: 17, nombre: "Punisher 9", precio: 5990, imagen: "/assets/covers/punisher 9.jpg", enlace: "/compra.html" },
  { id: 18, nombre: "X-Men Black 1 - Mystique", precio: 5990, imagen: "/assets/covers/x-men black 1 Mistique.jpg", enlace: "/compra.html" }
];

// Cargar todas las imágenes de covers en tiempo de compilación con Vite
// Esto genera un objeto donde la key es la ruta relativa y el valor es la URL procesada por Vite
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
          className={`a${producto.id}`}
          src={getImagenUrl(producto.imagen)}
          alt={producto.nombre}
        />
      </a>
    </div>
  );

  // Función para resolver la URL real de la imagen usando el mapa generado por import.meta.glob
  function getImagenUrl(rutaOriginal) {
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

    // 4) como fallback, devolver la ruta original (puede funcionar si usas /public)
    return rutaOriginal;
  }

  const CarritoPopup = () => {
    if (!mostrarCarrito) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>Carrito</h2>
          <ul>
            {carrito.map(item => (
              <li key={item.id}>
                {item.nombre} x{item.cantidad} - ${(item.precio * item.cantidad).toLocaleString('es-CL')}
              </li>
            ))}
          </ul>
          <p>Total: ${calcularTotal().toLocaleString('es-CL')}</p>
          
          {!modoPago ? (
            <>
              <button onClick={() => setModoPago(true)}>Pagar</button>
              <button onClick={() => setMostrarCarrito(false)}>Seguir Comprando</button>
            </>
          ) : (
            <>
              <h3>Selecciona forma de pago</h3>
              <button onClick={() => pagar('debito')}>Débito</button>
              <button onClick={() => pagar('credito')}>Crédito</button>
              <button onClick={() => pagar('paypal')}>PayPal</button>
              <button onClick={() => setModoPago(false)}>Cancelar</button>
            </>
          )}
        </div>
      </div>
    );
  };

  const PagoExitoPopup = () => {
    if (!mostrarPagoExito) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>¡Pago exitoso!</h2>
          <p>Que disfrutes tus comics :D te llegará al correo la boleta</p>
          <button onClick={vaciarCarrito}>Cerrar</button>
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
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ver Carrito ({carrito.reduce((total, item) => total + item.cantidad, 0)})
        </button>
      </div>

      <div className="contenedor">
        {filterProductos(productos, searchTerm).map(producto => (
          <Producto key={producto.id} producto={producto} />
        ))}
      </div>

      

      <CarritoPopup />
      <PagoExitoPopup />
    </div>
  );
};