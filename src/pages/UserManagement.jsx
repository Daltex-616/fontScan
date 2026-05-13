import React, { useState } from 'react';

const UserManagement = ({ 
    newUser, setNewUser, 
    newLocation, setNewLocation, 
    newStatus, setNewStatus, 
    handleAddUser,
    users, deleteUser,
    editingUserId, setEditingUserId, cancelEdit 
}) => {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const cleanUsername = (input) => {
        if (!input) return '';
        let result = input.trim();
        if (result.includes('instagram.com')) {
            const segments = result.split('/').filter(s => s !== '' && !s.includes('?'));
            result = segments[segments.length - 1];
        }
        return result.startsWith('@') ? result : `@${result}`;
    };

    const handleEditClick = (user) => {
        setIsBulkMode(false);
        setEditingUserId(user);
        setNewUser(user.username);
        setNewLocation(user.location);
        setNewStatus(user.status || 'publico');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al form en móvil
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        const lines = bulkText.split('\n').filter(l => l.trim() !== '');
        setLoadingBulk(true);
        for (const line of lines) {
            let [userInput, locInput] = line.split(',').map(item => item.trim());
            if (userInput) {
                await handleAddUser(null, {
                    username: cleanUsername(userInput),
                    location: locInput || newLocation || 'Sin ubicación',
                    status: newStatus
                });
            }
        }
        setLoadingBulk(false);
        setBulkText('');
        setIsBulkMode(false);
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-2 p-md-4 bg-light min-vh-100">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    
                    {/* ENCABEZADO REFRESCADO */}
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 gap-3">
                        <h4 className="fw-bold m-0 text-dark text-center text-sm-start">Gestión de Cuentas</h4>
                        <button 
                            className={`btn btn-sm w-100 w-sm-auto ${isBulkMode ? 'btn-secondary' : 'btn-outline-primary shadow-sm'}`}
                            onClick={() => { setIsBulkMode(!isBulkMode); cancelEdit(); }}
                        >
                            {isBulkMode ? '← Volver a modo simple' : '📥 Carga Masiva'}
                        </button>
                    </div>

                    {/* FORMULARIO ADAPTABLE */}
                    <div className={`card border-0 shadow-sm mb-4 ${editingUserId ? 'border-start border-warning border-4' : ''}`}>
                        <div className="card-body p-3 p-md-4">
                            {!isBulkMode ? (
                                <form onSubmit={(e) => {
                                    setNewUser(cleanUsername(newUser));
                                    handleAddUser(e);
                                }} className="row g-3">
                                    <div className="col-12">
                                        <h6 className="fw-bold text-muted mb-0 small text-uppercase">
                                            {editingUserId ? '✏️ Editando Usuario' : '👤 Registro Individual'}
                                        </h6>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label x-small fw-bold text-muted">Usuario / Link IG</label>
                                        <input 
                                            type="text" className="form-control form-control-lg fs-6" 
                                            placeholder="@usuario" 
                                            value={newUser} 
                                            onChange={(e) => setNewUser(e.target.value)} 
                                            onBlur={() => setNewUser(cleanUsername(newUser))}
                                            required 
                                        />
                                    </div>
                                    <div className="col-12 col-md-3">
                                        <label className="form-label x-small fw-bold text-muted">Ubicación</label>
                                        <input type="text" className="form-control form-control-lg fs-6" placeholder="Ej: Palermo" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
                                    </div>
                                    <div className="col-12 col-md-3">
                                        <label className="form-label x-small fw-bold text-muted">Estado</label>
                                        <select className="form-select form-select-lg fs-6" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                            <option value="publico">Público</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-2 d-flex align-items-end">
                                        <button className={`btn btn-lg w-100 fw-bold shadow-sm ${editingUserId ? 'btn-warning text-dark' : 'btn-primary'}`}>
                                            {editingUserId ? 'Guardar' : 'Añadir'}
                                        </button>
                                    </div>
                                    {editingUserId && (
                                        <div className="col-12 text-center text-md-start">
                                            <button type="button" onClick={cancelEdit} className="btn btn-sm btn-link text-danger text-decoration-none p-0 mt-2 small">✕ Cancelar edición</button>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <form onSubmit={handleBulkSubmit}>
                                    <h6 className="fw-bold text-muted mb-2 small text-uppercase">📥 Importación Masiva</h6>
                                    <p className="x-small text-muted mb-3">Pega una lista de usuarios o links (uno por línea). Opcional: <code>@usuario, Ubicación</code></p>
                                    <textarea 
                                        className="form-control mb-3 fs-6" rows="6" 
                                        placeholder={"https://instagram.com/messi/\n@cristiano, Portugal"}
                                        value={bulkText} onChange={(e) => setBulkText(e.target.value)} required
                                    />
                                    <div className="row g-2 align-items-center">
                                        <div className="col-12 col-md-8">
                                            <div className="input-group">
                                                <span className="input-group-text x-small fw-bold bg-light">Default:</span>
                                                <input type="text" className="form-control" placeholder="Ubicación" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                                                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                                    <option value="publico">Público</option>
                                                    <option value="personal">Personal</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-4 mt-3 mt-md-0">
                                            <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" disabled={loadingBulk}>
                                                {loadingBulk ? '⏳ Procesando...' : `Añadir ${bulkText.split('\n').filter(x => x.trim()).length} Cuentas`}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* BUSCADOR */}
                    <div className="mb-3">
                        <div className="input-group shadow-sm border rounded-pill overflow-hidden bg-white px-3 py-1">
                            <span className="bg-transparent border-0 pe-2">🔍</span>
                            <input 
                                type="text" 
                                className="form-control border-0 bg-transparent shadow-none" 
                                placeholder="Buscar usuario o ciudad..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="btn btn-link text-muted border-0 p-0" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>
                    </div>

                    {/* VISTA MÓVIL (TARJETAS) / ESCRITORIO (TABLA) */}
                    <div className="card border-0 shadow-sm overflow-hidden">
                        
                        {/* Tabla para Desktop */}
                        <div className="table-responsive d-none d-md-block">
                            <table className="table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4 py-3 x-small fw-bold text-muted">USUARIO</th>
                                        <th className="py-3 x-small fw-bold text-muted">UBICACIÓN</th>
                                        <th className="py-3 x-small fw-bold text-muted text-center">TIPO</th>
                                        <th className="text-end pe-4 py-3 x-small fw-bold text-muted">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                        <tr key={u._id} className={editingUserId?._id === u._id ? 'table-warning' : ''}>
                                            <td className="ps-4">
                                                <a href={`https://instagram.com/${u.username.replace('@','')}`} target="_blank" rel="noreferrer" className="fw-bold text-decoration-none">
                                                    {u.username}
                                                </a>
                                            </td>
                                            <td className="text-muted small">{u.location}</td>
                                            <td className="text-center">
                                                <span className={`badge ${u.status === 'personal' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill`}>
                                                    {u.status || 'público'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group shadow-sm border rounded">
                                                    <button onClick={() => handleEditClick(u)} className="btn btn-sm btn-white text-primary px-3">✏️</button>
                                                    <button onClick={() => deleteUser(u._id)} className="btn btn-sm btn-white text-danger px-3">✕</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted">No se encontraron cuentas.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Vista de Tarjetas para Móvil */}
                        <div className="d-md-none">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <div key={u._id} className={`p-3 border-bottom ${editingUserId?._id === u._id ? 'bg-warning-subtle' : 'bg-white'}`}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <a href={`https://instagram.com/${u.username.replace('@','')}`} target="_blank" rel="noreferrer" className="fw-bold text-primary fs-5 text-decoration-none">
                                            {u.username}
                                        </a>
                                        <span className={`badge ${u.status === 'personal' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill`}>
                                            {u.status}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className="text-muted small">📍 {u.location}</span>
                                        <div className="d-flex gap-2">
                                            <button onClick={() => handleEditClick(u)} className="btn btn-sm btn-outline-primary px-3 fw-bold">Editar</button>
                                            <button onClick={() => deleteUser(u._id)} className="btn btn-sm btn-outline-danger px-3 fw-bold">Borrar</button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5 text-muted">No se encontraron cuentas.</div>
                            )}
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* ESTILOS EXTRA */}
            <style>{`
                .x-small { font-size: 0.75rem; }
                .form-control:focus, .form-select:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
                }
                .btn-white:hover { background-color: #f8f9fa; }
                .w-sm-auto { @media (min-width: 576px) { width: auto !important; } }
            `}</style>
        </div>
    );
};

export default UserManagement;