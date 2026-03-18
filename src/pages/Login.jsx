import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            // Redirigir al dashboard después de guardar el token
            window.location.href = '/dashboard'; 
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            backgroundColor: '#1a1a2e',
            fontFamily: 'Inter, sans-serif' 
        }}>
            <form onSubmit={handleLogin} style={{ 
                background: '#fff', 
                padding: '40px', 
                borderRadius: '12px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#1a1a2e', margin: '0' }}>Bienvenido</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Ingresa al panel de monitoreo</p>
                </div>

                {error && (
                    <div style={{ 
                        background: '#ffe5e5', 
                        color: '#d9534f', 
                        padding: '10px', 
                        borderRadius: '6px', 
                        marginBottom: '20px',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
                    <input 
                        type="text" 
                        placeholder="Nombre de usuario" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '12px 12px 12px 40px', 
                            borderRadius: '8px', 
                            border: '1px solid #ddd',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }} 
                    />
                </div>

                <div style={{ marginBottom: '30px', position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '12px 12px 12px 40px', 
                            borderRadius: '8px', 
                            border: '1px solid #ddd',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }} 
                    />
                </div>

                <button type="submit" style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: '#7239ea', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'background 0.3s'
                }}>
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
};

export default Login;