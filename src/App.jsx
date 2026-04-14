import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Database from './pages/Database';
import AdminManagement from './pages/AdminManagement';
import Navbar from './components/Navbar';
import UserManagement from './pages/UserManagement';

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  // Estados del formulario
  const [newUser, setNewUser] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState('publico');
  const [editingUserId, setEditingUserId] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
  };

  const fetchData = async () => {
    if (!isAuth) return;
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts'),
        api.get('/users')
      ]);
      setPosts(postsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Error cargando datos", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuth(false);
      }
    }
  };

  // Función de guardado compatible con Carga Individual y Masiva
  const handleAddUser = async (e, bulkData = null) => {
    if (e) e.preventDefault();

    // Prioriza los datos que vienen por parámetro (bulk) o usa los del estado (individual)
    const userToSave = bulkData ? bulkData.username : newUser;
    const locationToSave = bulkData ? bulkData.location : newLocation;
    const statusToSave = bulkData ? bulkData.status : newStatus;

    try {
      if (editingUserId && !bulkData) {
        await api.put(`/users/${editingUserId._id}`, { 
          username: userToSave, 
          location: locationToSave, 
          status: statusToSave 
        });
      } else {
        await api.post('/users', { 
          username: userToSave, 
          location: locationToSave, 
          status: statusToSave 
        });
      }
      
      // Solo limpiamos estados si no es una carga masiva
      if (!bulkData) {
        setNewUser('');
        setNewLocation('');
        setNewStatus('publico');
        setEditingUserId(null);
      }
      fetchData(); 
    } catch (err) {
      console.error("Error al guardar usuario", err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("¿Eliminar esta cuenta?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth]);

  return (
    <BrowserRouter>
      <>
        {isAuth && <Navbar onLogout={() => setIsAuth(false)} />}
        <Routes>
          <Route path="/login" element={!isAuth ? <Login onLoginSuccess={checkAuth} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuth ? <Dashboard posts={posts} users={users} refreshData={fetchData} deleteUser={deleteUser} /> : <Navigate to="/login" />} />
          <Route path="/database" element={isAuth ? <Database posts={posts} users={users} /> : <Navigate to="/login" />} />
          
          <Route 
            path="/users" 
            element={isAuth ? (
              <UserManagement 
                users={users}
                newUser={newUser} setNewUser={setNewUser}
                newLocation={newLocation} setNewLocation={setNewLocation}
                newStatus={newStatus} setNewStatus={setNewStatus}
                editingUserId={editingUserId} setEditingUserId={setEditingUserId}
                handleAddUser={handleAddUser}
                deleteUser={deleteUser}
                cancelEdit={() => { setEditingUserId(null); setNewUser(''); setNewLocation(''); }}
              />
            ) : <Navigate to="/login" />} 
          />

          <Route path="/admin-settings" element={isAuth ? <AdminManagement /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isAuth ? "/dashboard" : "/login"} />} />
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;