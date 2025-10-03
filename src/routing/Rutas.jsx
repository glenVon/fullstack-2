import React from 'react'
import {Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Inicio } from '../components/pages/Inicio';
import { Articulos } from '../components/pages/Admin';
import { Crear } from '../components/pages/Carrito';

export const Rutas = () => {
  return (
    <BrowserRouter>
        {/*LAYOUT*/}

        {/*Contenido central y rutas*/}
        <section id="content" className="content">
            <Routes>
                <Route path='/' element={<h1>Inicio</h1>}/>
                <Route path='/inicio' element={<h1>Inicio</h1>}/>
                <Route path='/articulos' element={<h1>Articulos</h1>}/>
                <Route path='/crear' element={<h1>Crear</h1>}/>
                <Route path='*' element={<Navigate to="/"/>}/>
            </Routes>
        </section>
        {/*Pie de pagina*/}
    </BrowserRouter>
  )
}