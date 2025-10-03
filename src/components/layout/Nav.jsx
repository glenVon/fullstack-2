import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../../index.css' // Asegúrate de tener este archivo CSS

export const Nav = ({ onSearch, user, onLogin, onLogout }) => {
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [term, setTerm] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const emitSearch = (t) => {
    if (typeof onSearch === 'function') onSearch(t);
    if (typeof window !== 'undefined') {
      window.__onSearch = window.__onSearch || null;
      if (typeof window.__onSearch === 'function') window.__onSearch(t);
    }
  }

  // Helpers para localStorage de usuarios
  const getStoredUsers = () => {
    try {
      const s = localStorage.getItem('users')
      return s ? JSON.parse(s) : []
    } catch {
      return []
    }
  }
  const saveStoredUsers = (arr) => localStorage.setItem('users', JSON.stringify(arr))

  // linkStyle eliminado: ahora usamos clases CSS en index.css

  return (
    <header style={{ borderBottom: '1px solid #faf7f7ff', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <nav className="top-nav-links">
        {/* Inicio: muestra Body en la ruta raíz */}
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Inicio</NavLink>
        {/* Orden: Biblioteca, Busqueda, Carrito, (Admin) */}
        <NavLink to="/biblioteca" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Biblioteca</NavLink>
        <NavLink to="/busqueda" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Busqueda</NavLink>
        <NavLink to="/carrito" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Carrito</NavLink>
        {user?.isAdmin && (
          <>
            <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
            <NavLink to="/editar" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Editar</NavLink>
            <NavLink to="/crear" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Crear</NavLink>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <form onSubmit={(e) => { e.preventDefault(); emitSearch(term); }}>
          <input
            type="text"
            placeholder="Que busca mi estimado.."
            className="buscar"
            value={term}
            onChange={(e) => { setTerm(e.target.value); emitSearch(e.target.value); }}
            style={{ padding: '6px 8px' }}
          />
        </form>

        <div>
          <button onClick={() => setShowRegisterPopup(true)} style={{ marginRight: 8 }}>Registrarse</button>
          {!user ? (
            <button onClick={() => setShowLoginPopup(true)}>Iniciar sesión</button>
          ) : (
            <>
              <span style={{ marginRight: 8 }}>Hola, {user.name}</span>
              <button onClick={() => { if (typeof onLogout === 'function') onLogout(); }}>Cerrar sesión</button>
            </>
          )}
        </div>
      </div>

      {showRegisterPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Registro</h2>
            <RegistroForm onClose={() => setShowRegisterPopup(false)} onRegister={(newUser) => {
              const users = getStoredUsers();
              // validación simple: email único
              if (users.find(u => u.email === newUser.email)) {
                alert('Ya existe un usuario con ese email');
                return false;
              }
              users.push(newUser);
              saveStoredUsers(users);
              alert('Registro exitoso');
              return true;
            }} />
            <button onClick={() => setShowRegisterPopup(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {showLoginPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Iniciar sesión</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Primero verificar users en localStorage
              const users = getStoredUsers();
              const found = users.find(u => u.email === loginEmail && u.password === loginPassword);
              if (found) {
                if (typeof onLogin === 'function') onLogin({ email: found.email, name: found.name, isAdmin: !!found.isAdmin });
                setShowLoginPopup(false);
                return;
              }

              // Credenciales hardcodeadas de admin (fallback)
              if (loginEmail === 'admin@admin.com' && loginPassword === 'admin') {
                if (typeof onLogin === 'function') onLogin({ email: loginEmail, name: 'Administrador', isAdmin: true });
                setShowLoginPopup(false);
                return;
              }

              alert('Credenciales inválidas');
            }}>
              <label>Email</label>
              <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <label>Contraseña</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <button type="submit">Entrar</button>
              <button type="button" onClick={() => setShowLoginPopup(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

// Componente interno para formulario de registro con validaciones básicas
function RegistroForm({ onClose, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const validarEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Nombre requerido');
    if (!validarEmail(email)) return alert('Email inválido');
    if (password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');

    const newUser = { name, email, password, isAdmin: !!isAdmin };
    const ok = onRegister(newUser);
    if (ok) onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Contraseña</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label>
        <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} /> Dar rol admin
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="submit">Registrar</button>
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
      </div>
    </form>
  )
}
