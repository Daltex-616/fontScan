import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, UserPlus, Edit3, Trash2, XCircle } from 'lucide-react';

const AdminManagement = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [authForm, setAuthForm] = useState({ username: '', password: '' });
    const [admins, setAdmins] = useState([]);
    const [form, setForm] = useState({ user: '', pass: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isVerified) fetchAdmins();
    }, [isVerified]);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin-users');
            setAdmins(res.data);
        } catch (e) { console.error("Error de carga"); }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/login', authForm);
            setIsVerified(true);
        } catch (err) {
            setError('Credenciales de acceso incorrectas');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                username: form.user,
                ...(form.pass && { password: form.pass }) // Solo envía pass si hay texto
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
            alert(err.response?.data?.msg || "Error en el servidor (500)");
        }
    };

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
                        <button className="btn btn-primary w-100 fw-bold">Verificar</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm p-3 border-0">
                        <h5 className="fw-bold mb-3">{editingId ? 'Editar Admin' : 'Crear Admin'}</h5>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className="form-control mb-2" placeholder="Nombre de usuario" value={form.user} onChange={e => setForm({...form, user: e.target.value})} required />
                            <input type="password" className="form-control mb-3" placeholder={editingId ? "Nueva pass (opcional)" : "Contraseña"} value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} required={!editingId} />
                            <button className="btn btn-dark w-100 mb-2">{editingId ? 'Actualizar' : 'Guardar'}</button>
                            {editingId && <button type="button" className="btn btn-link btn-sm w-100" onClick={() => {setEditingId(null); setForm({user:'', pass:''})}}>Cancelar</button>}
                        </form>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <table className="table align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Usuario</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(a => (
                                    <tr key={a._id}>
                                        <td className="fw-bold">{a.username}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {setEditingId(a._id); setForm({user: a.username, pass: ''})}}><Edit3 size={14}/></button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={async () => { if(window.confirm("¿Eliminar?")) { await api.delete(`/admin-users/${a._id}`); fetchAdmins(); } }}><Trash2 size={14}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;