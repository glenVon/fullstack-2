import React, { useEffect, useState } from 'react'

export const Admin = () => {
  const [users, setUsers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', isAdmin: false })

  useEffect(() => {
    const s = localStorage.getItem('users')
    setUsers(s ? JSON.parse(s) : [])
  }, [])

  const save = (next) => {
    localStorage.setItem('users', JSON.stringify(next))
    setUsers(next)
  }

  const handleDelete = (email) => {
    if (!confirm('Eliminar usuario ' + email + ' ?')) return
    const next = users.filter(u => u.email !== email)
    save(next)
  }

  const startEdit = (u) => {
    setEditingId(u.email)
    setForm({ name: u.name, email: u.email, password: u.password || '', isAdmin: !!u.isAdmin })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ name: '', email: '', password: '', isAdmin: false })
  }

  const submitEdit = () => {
    // validaciones básicas
    if (!form.name.trim()) return alert('Nombre requerido')
    if (!/\S+@\S+\.\S+/.test(form.email)) return alert('Email inválido')
    const next = users.map(u => u.email === editingId ? { ...u, name: form.name, email: form.email, password: form.password || u.password, isAdmin: !!form.isAdmin } : u)
    save(next)
    cancelEdit()
  }

  const addUser = () => {
    if (!form.name.trim()) return alert('Nombre requerido')
    if (!/\S+@\S+\.\S+/.test(form.email)) return alert('Email inválido')
    if (form.password.length < 6) return alert('Contraseña mínima 6 caracteres')
    if (users.find(u => u.email === form.email)) return alert('Email ya registrado')
    const next = [...users, { name: form.name, email: form.email, password: form.password, isAdmin: !!form.isAdmin }]
    save(next)
    setForm({ name: '', email: '', password: '', isAdmin: false })
  }

  return (
    <div>
      <h2>Administración de usuarios</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h3>Usuarios</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd' }}>Nombre</th>
                <th style={{ borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ borderBottom: '1px solid #ddd' }}>Admin</th>
                <th style={{ borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email}>
                  <td style={{ padding: 8 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.isAdmin ? 'Sí' : 'No'}</td>
                  <td>
                    <button onClick={() => startEdit(u)}>Editar</button>
                    <button onClick={() => handleDelete(u.email)} style={{ marginLeft: 8 }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ width: 320 }}>
          <h3>{editingId ? 'Editar usuario' : 'Crear usuario'}</h3>
          <label>Nombre</label>
          <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
          <label>Email</label>
          <input value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
          <label>Contraseña</label>
          <input value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} />
          <label>
            <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm(prev => ({ ...prev, isAdmin: e.target.checked }))} /> Dar rol admin
          </label>
          <div style={{ marginTop: 8 }}>
            {editingId ? (
              <>
                <button onClick={submitEdit}>Guardar</button>
                <button onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancelar</button>
              </>
            ) : (
              <button onClick={addUser}>Crear</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
