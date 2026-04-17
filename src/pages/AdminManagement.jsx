import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Edit3, Trash2 } from 'lucide-react';

const AdminManagement = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [authForm, setAuthForm] = useState({ username: '', password: '' });
    const [admins, setAdmins] = useState([]); // Inicializado como array vacío
    const [form, setForm] = useState({ user: '', pass: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isVerified) fetchAdmins();
    }, [isVerified]);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin-users');
            // IMPORTANTE: Nos aseguramos de que lo que guardamos sea un Array
            setAdmins(Array.isArray(res.data) ? res.data : []);
        } catch (e) { 
            console.error("Error de carga de administradores");
            setAdmins([]); // En caso de error, mantenemos el array vacío para no romper el .map
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // El login suele devolver un token, asegúrate de que tu servicio api lo guarde
            await api.post('/auth/login', authForm);
            setIsVerified(true);
        } catch (err) {
            setError('Credenciales de acceso incorrectas o insuficientes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                username: form.user,
                ...(form.pass && { password: form.pass }) 
            };

            if (editingId) {
                await api.put(`/admin-users/${editingId}`, payload);
            } else {
                await api.post('/admin-users', payload);
            }
            
            setForm({ user: '', pass: '' });
            setEditingId(null);
            fetchAdmins();
            alert("Operación exitosa");
        } catch (err) {
            const msg = err.response?.data?.msg || "Error en el servidor";
            alert(msg);
        }
    };

    // Vista de Bloqueo / Verificación
    if (!isVerified) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card p-4 shadow border-0" style={{ width: '350px' }}>
                    <div className="text-center mb-3 text-primary"><ShieldCheck size={48} /></div>
                    <h5 className="text-center fw-bold mb-3">Confirmar Identidad</h5>
                    <form onSubmit={handleVerify}>
                        <input type="text" className="form-control mb-2" placeholder="Usuario Admin" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required />
                        <input type="password" className="form-control mb-3" placeholder="Contraseña" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
                        {error && <div className="alert alert-danger py-1 small">{error}</div>}
                        <button className="btn btn-primary w-100 fw-bold">Verificar Acceso</button>
                    </form>
                </div>
            </div>
        );
    }

    // Vista de Gestión
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm p-3 border-0">
                        <h5 className="fw-bold mb-3">{editingId ? 'Editar Administrador' : 'Crear Nuevo Admin'}</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label className="form-label small fw-bold">Usuario</label>
                                <input type="text" className="form-control" placeholder="Nombre de usuario" value={form.user} onChange={e => setForm({...form, user: e.target.value})} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">{editingId ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
                                <input type="password" className="form-control" placeholder="••••••••" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} required={!editingId} />
                            </div>
                            <button className={`btn w-100 mb-2 fw-bold ${editingId ? 'btn-warning' : 'btn-dark'}`}>
                                {editingId ? 'Actualizar Datos' : 'Guardar Administrador'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-link btn-sm w-100 text-decoration-none text-muted" onClick={() => {setEditingId(null); setForm({user:'', pass:''})}}>
                                    Cancelar edición
                                </button>
                            )}
                        </form>
                    </div>
                </div>
                
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Usuario Administrador</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(admins || []).length > 0 ? (
                                        admins.map(a => (
                                            <tr key={a._id || Math.random()}>
                                                <td className="ps-4 fw-bold text-dark">
                                                    {a.username}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-2 border-0" 
                                                        onClick={() => {setEditingId(a._id); setForm({user: a.username, pass: ''})}}
                                                        title="Editar"
                                                    >
                                                        <Edit3 size={16}/>
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger border-0" 
                                                        onClick={async () => { 
                                                            if(window.confirm("¿Estás seguro de eliminar este administrador?")) { 
                                                                try {
                                                                    await api.delete(`/admin-users/${a._id}`); 
                                                                    fetchAdmins(); 
                                                                } catch(e) { alert("No se pudo eliminar"); }
                                                            } 
                                                        }}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center p-4 text-muted">
                                                Cargando lista de administradores...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;