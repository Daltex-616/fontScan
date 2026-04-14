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
    // --- ESTADO PARA EL BUSCADOR ---
    const [searchTerm, setSearchTerm] = useState('');

    // Función para extraer usuario de URL o limpiar texto
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

    // --- LÓGICA DE FILTRADO ---
    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold m-0 text-dark">Gestión de Cuentas</h4>
                        <button 
                            className={`btn btn-sm ${isBulkMode ? 'btn-secondary' : 'btn-outline-primary'}`}
                            onClick={() => { setIsBulkMode(!isBulkMode); cancelEdit(); }}
                        >
                            {isBulkMode ? 'Volver a modo simple' : '📥 Carga Masiva '}
                        </button>
                    </div>

                    <div className={`card border-0 shadow-sm mb-4 ${editingUserId ? 'border-start border-warning border-4' : ''}`}>
                        <div className="card-body p-4">
                            {!isBulkMode ? (
                                <form onSubmit={(e) => {
                                    setNewUser(cleanUsername(newUser));
                                    handleAddUser(e);
                                }} className="row g-3">
                                    <h6 className="fw-bold text-muted mb-0">
                                        {editingUserId ? 'EDITAR CUENTA' : 'REGISTRAR NUEVA CUENTA'}
                                    </h6>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Usuario o Link IG</label>
                                        <input 
                                            type="text" className="form-control" 
                                            placeholder="@usuario o link completo" 
                                            value={newUser} 
                                            onChange={(e) => setNewUser(e.target.value)} 
                                            onBlur={() => setNewUser(cleanUsername(newUser))}
                                            required 
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Ubicación</label>
                                        <input type="text" className="form-control" placeholder="Ciudad, Barrio..." value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Status</label>
                                        <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                            <option value="publico">Público</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button className={`btn w-100 fw-bold ${editingUserId ? 'btn-warning' : 'btn-primary'}`}>
                                            {editingUserId ? 'Actualizar' : 'Añadir'}
                                        </button>
                                    </div>
                                    {editingUserId && (
                                        <div className="col-12 mt-0">
                                            <button type="button" onClick={cancelEdit} className="btn btn-sm btn-link text-danger p-0 mt-2 small">Cancelar edición</button>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <form onSubmit={handleBulkSubmit}>
                                    <h6 className="fw-bold text-muted mb-2">IMPORTAR LISTADO (Links o Usuarios)</h6>
                                    <textarea 
                                        className="form-control mb-3" rows="5" 
                                        placeholder={"https://www.instagram.com/messi/\n@cristiano, Portugal"}
                                        value={bulkText} onChange={(e) => setBulkText(e.target.value)} required
                                    />
                                    <div className="row g-2 align-items-center">
                                        <div className="col-md-6">
                                            <label className="small fw-bold">Configuración por defecto:</label>
                                            <div className="input-group input-group-sm">
                                                <input type="text" className="form-control" placeholder="Ubicación" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                                                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                                    <option value="publico">Público</option>
                                                    <option value="personal">Personal</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6 d-flex align-items-end pt-3">
                                            <button className="btn btn-success w-100 fw-bold" disabled={loadingBulk}>
                                                {loadingBulk ? 'Procesando...' : `Añadir lista (${bulkText.split('\n').filter(x => x.trim()).length} cuentas)`}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* --- BUSCADOR --- */}
                    <div className="mb-3">
                        <div className="input-group shadow-sm">
                            <span className="input-group-text bg-white border-0">🔍</span>
                            <input 
                                type="text" 
                                className="form-control border-0" 
                                placeholder="Buscar por usuario o ubicación..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="btn btn-white border-0 text-muted" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Usuario</th>
                                        <th>Ubicación</th>
                                        <th>Tipo</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                        <tr key={u._id} className={editingUserId?._id === u._id ? 'table-warning' : ''}>
                                            <td className="ps-4 fw-bold text-primary">
                                                <a href={`https://instagram.com/${u.username.replace('@','')}`} target="_blank" rel="noreferrer" className="text-decoration-none">
                                                    {u.username}
                                                </a>
                                            </td>
                                            <td className="text-muted">{u.location}</td>
                                            <td>
                                                <span className={`badge border ${u.status === 'personal' ? 'bg-danger-subtle text-danger border-danger' : 'bg-success-subtle text-success border-success'}`}>
                                                    {u.status || 'público'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button onClick={() => handleEditClick(u)} className="btn btn-sm btn-outline-primary me-2 border-0">✏️</button>
                                                <button onClick={() => deleteUser(u._id)} className="btn btn-sm btn-outline-danger border-0">✕</button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="text-center py-4 text-muted small">No se encontraron cuentas.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;