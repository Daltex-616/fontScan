import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './services/api';

// Páginas y Componentes
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Database from './pages/Database';
import AdminManagement from './pages/AdminManagement';
import Navbar from './components/Navbar';

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

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
      console.error("Error cargando datos globales", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuth(false);
      }
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);

  return (
    <BrowserRouter>
      {/* SOLUCIÓN AL ERROR: Envolvemos todo en un Fragment <> </> */}
      <>
        {isAuth && <Navbar onLogout={() => setIsAuth(false)} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={!isAuth ? <Login onLoginSuccess={checkAuth} /> : <Navigate to="/dashboard" />} 
          />

          <Route 
            path="/dashboard" 
            element={isAuth ? (
              <Dashboard posts={posts} users={users} refreshData={fetchData} />
            ) : (
              <Navigate to="/login" />
            )} 
          />

          <Route 
            path="/database" 
            element={isAuth ? (
              <Database posts={posts} users={users} />
            ) : (
              <Navigate to="/login" />
            )} 
          />

          <Route 
            path="/admin-settings" 
            element={isAuth ? <AdminManagement /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to={isAuth ? "/dashboard" : "/login"} />} />
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;