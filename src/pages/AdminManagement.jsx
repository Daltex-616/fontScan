import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Edit3, Trash2, Download, Upload, LogOut } from 'lucide-react';
import { exportPostsToCSV, parseCSV } from '../utils/csvHelper';

const AdminManagement = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [authForm, setAuthForm] = useState({ username: '', password: '' });
    const [admins, setAdmins] = useState([]);
    const [posts, setPosts] = useState([]);
    const [form, setForm] = useState({ user: '', pass: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isVerified) {
            fetchAdmins();
            fetchPosts();
        }
    }, [isVerified]);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin-users');
            setAdmins(Array.isArray(res.data) ? res.data : []);
        } catch (e) { setAdmins([]); }
    };

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (e) { console.error("Error cargando posts"); }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/login', authForm);
            setIsVerified(true);
        } catch (err) {
            setError('Credenciales inválidas');
        }
    };

    const handleAdminSubmit = async (e) => {
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
            alert("Usuario guardado correctamente");
        } catch (err) {
            alert(err.response?.data?.msg || "Error en la operación");
        }
    };

    const deleteAdmin = async (id) => {
        if (!window.confirm("¿Eliminar este administrador?")) return;
        try {
            await api.delete(`/admin-users/${id}`);
            fetchAdmins();
        } catch (e) { alert("No se pudo eliminar"); }
    };

    // FUNCIÓN DE SINCRONIZACIÓN MASIVA (UPSERT)
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm("¿Deseas sincronizar los datos? Se actualizarán los links de media existentes y se crearán los nuevos posts.")) {
            setLoading(true);
            try {
                const dataArray = await parseCSV(file);
                // El backend ahora usa bulkWrite para hacer el Upsert
                const response = await api.post('/posts/bulk', { posts: dataArray });
                
                alert(`Sincronización exitosa:\n- Nuevos registros: ${response.data.inserted}\n- Links actualizados: ${response.data.updated}`);
                
                fetchPosts(); 
            } catch (err) {
                alert("Error al procesar el archivo CSV o fallo en el servidor");
            } finally {
                setLoading(false);
                e.target.value = null; 
            }
        }
    };

    if (!isVerified) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card p-4 shadow-lg border-0" style={{ width: '380px' }}>
                    <div className="text-center mb-3 text-primary"><ShieldCheck size={50} strokeWidth={2.5} /></div>
                    <h4 className="text-center fw-bold mb-4">Panel de Seguridad</h4>
                    <form onSubmit={handleVerify}>
                        <div className="mb-3">
                            <input type="text" className="form-control" placeholder="Nombre de usuario" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <input type="password" className="form-control" placeholder="Contraseña" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
                        </div>
                        {error && <div className="alert alert-danger py-2 small">{error}</div>}
                        <button className="btn btn-primary w-100 fw-bold py-2">Verificar Acceso</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 pb-5">
            {/* TOOLBAR DE BASE DE DATOS */}
            <div className="card border-0 shadow-sm mb-4 p-4">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h3 className="fw-bold mb-1">Centro de Administración</h3>
                        <p className="text-muted mb-0">Gestión de base de datos y control de accesos</p>
                    </div>
                    <div className="col-md-6 text-end d-flex gap-2 justify-content-end">
                        <button 
                            className="btn btn-outline-dark d-flex align-items-center gap-2 fw-semibold"
                            onClick={() => exportPostsToCSV(posts)}
                        >
                            <Download size={18} /> Exportar Backup
                        </button>
                        
                        <label className={`btn btn-success d-flex align-items-center gap-2 fw-semibold ${loading ? 'disabled' : ''}`}>
                            {loading ? 'Procesando...' : <><Upload size={18} /> Sincronización Masiva</>}
                            <input type="file" accept=".csv" hidden onChange={handleImport} disabled={loading} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* LADO IZQUIERDO: FORMULARIO ADMINS */}
                <div className="col-md-4">
                    <div className="card shadow-sm p-4 border-0 mb-4">
                        <h5 className="fw-bold mb-3">{editingId ? 'Editar Admin' : 'Nuevo Administrador'}</h5>
                        <form onSubmit={handleAdminSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">USUARIO</label>
                                <input type="text" className="form-control" placeholder="Ej: admin_zamora" value={form.user} onChange={e => setForm({...form, user: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">CONTRASEÑA</label>
                                <input type="password" className="form-control" placeholder={editingId ? "Dejar vacío para no cambiar" : "••••••••"} value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} required={!editingId} />
                            </div>
                            <button className={`btn w-100 fw-bold py-2 ${editingId ? 'btn-warning' : 'btn-dark'}`}>
                                {editingId ? 'Actualizar Datos' : 'Registrar Admin'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-link btn-sm w-100 mt-2 text-decoration-none text-muted" onClick={() => {setEditingId(null); setForm({user:'', pass:''})}}>
                                    Cancelar edición
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* LADO DERECHO: LISTA DE ADMINS */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 overflow-hidden">
                        <div className="p-3 bg-white border-bottom">
                            <h6 className="m-0 fw-bold">Administradores con Acceso</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Nombre de Usuario</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.length > 0 ? admins.map(a => (
                                        <tr key={a._id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{a.username}</div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-2 border-0"
                                                    onClick={() => {setEditingId(a._id); setForm({user: a.username, pass: ''})}}
                                                    title="Editar"
                                                >
                                                    <Edit3 size={17}/>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger border-0"
                                                    onClick={() => deleteAdmin(a._id)}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={17}/>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="2" className="text-center py-4 text-muted">No hay administradores registrados</td>
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