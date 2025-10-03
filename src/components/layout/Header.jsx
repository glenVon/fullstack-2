import React, { useState } from 'react'
import '../../index.css' // Ajusté la ruta del CSS
import logo from '/src/images/a (14).png'
/*
  El logo ya está importado correctamente con:
  Para usarlo, reemplaza src="a(14).png" por src={logo} en el <img>:
*/
export const Header = () => {
  const [showRegisterPopup, setShowRegisterPopup] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loginData, setLoginData] = useState({
    loginEmail: '',
    loginPassword: ''
  })

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    // Aquí va tu lógica de validación y envío del formulario
    console.log('Datos de registro:', formData)
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    // Aquí va tu lógica de validación del login
    console.log('Datos de login:', loginData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="header">
      <nav className="navbar">
        <img 
          className="ima" 
          src={logo} 
          width="80px" 
          height="80px" 
          alt="logo" 
        />
        
        <h1 className="titulo">MULTIVERSO COMICS</h1>

        {/* Popup de Registro */}
        {showRegisterPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <form id="miFormulario" onSubmit={handleRegisterSubmit}>
                <h2>Formulario de Registro</h2>
                
                <label htmlFor="nombre">Nombre:</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
                <span id="errorNombre" className="error"></span>

                <label htmlFor="rut">RUT:</label>
                <input 
                  type="text" 
                  id="rut" 
                  name="rut" 
                  value={formData.rut}
                  onChange={handleInputChange}
                />
                <span id="errorRut" className="error"></span>

                <label htmlFor="email">Email:</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <span id="errorEmail" className="error"></span>

                <label htmlFor="password">Contraseña:</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <span id="errorPassword" className="error"></span>

                <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <span id="errorConfirmPassword" className="error"></span>

                <button type="submit" className="btn">Registrarse</button>
              </form>
              <button 
                className="cerrarPopup"
                onClick={() => setShowRegisterPopup(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Popup de Login */}
        {showLoginPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <form id="loginForm" onSubmit={handleLoginSubmit} autoComplete="off">
                <h2>Iniciar sesión</h2>
                
                <label htmlFor="loginEmail">Email:</label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  name="loginEmail" 
                  value={loginData.loginEmail}
                  onChange={handleLoginInputChange}
                  required 
                />
                <span id="errorLoginEmail" className="error"></span>

                <label htmlFor="loginPassword">Contraseña:</label>
                <input 
                  type="password" 
                  id="loginPassword" 
                  name="loginPassword" 
                  value={loginData.loginPassword}
                  onChange={handleLoginInputChange}
                  required 
                />
                <span id="errorLoginPassword" className="error"></span>

                <button type="submit">Entrar</button>
              </form>
              <button 
                className="cerrarLogin"
                onClick={() => setShowLoginPopup(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}