import React, { useState } from 'react';

const UserManagement = ({ 
    newUser, setNewUser, 
    newLocation, setNewLocation, 
    newStatus, setNewStatus, 
    handleAddUser,
    users = [], // Valor por defecto para evitar undefined
    deleteUser,
    editingUserId, setEditingUserId, cancelEdit 
}) => {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Función para limpiar el @ y extraer el username de links de Instagram
    const cleanUsername = (input) => {
        if (!input) return '';
        let result = input.trim();
        
        if (result.includes('instagram.com')) {
            const segments = result.split('/').filter(s => s !== '' && !s.includes('?'));
            result = segments[segments.length - 1];
        }
        
        return result.replace('@', '');
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

        try {
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
        } catch (error) {
            console.error("Error en carga masiva:", error);
        } finally {
            setLoadingBulk(false);
            setBulkText('');
            setIsBulkMode(false);
        }
    };

    // BLINDAJE: Verificamos que users sea array y usamos Optional Chaining (?.)
    const filteredUsers = (Array.isArray(users) ? users : []).filter(u => 
        u?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold m-0 text-dark">Gestión de Cuentas</h4>
                        <div className="d-flex gap-2">
                            <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                placeholder="Buscar..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '200px' }}
                            />
                            <button 
                                className={`btn btn-sm ${isBulkMode ? 'btn-secondary' : 'btn-outline-primary'}`}
                                onClick={() => { setIsBulkMode(!isBulkMode); cancelEdit(); }}
                            >
                                {isBulkMode ? 'Volver' : '📥 Carga Masiva'}
                            </button>
                        </div>
                    </div>

                    <div className={`card border-0 shadow-sm mb-4 ${editingUserId ? 'border-start border-warning border-4' : ''}`}>
                        <div className="card-body p-4">
                            {!isBulkMode ? (
                                <form onSubmit={(e) => {
                                    const cleaned = cleanUsername(newUser);
                                    handleAddUser(e, { username: cleaned, location: newLocation, status: newStatus });
                                }} className="row g-3">
                                    <h6 className="fw-bold text-muted mb-0">
                                        {editingUserId ? 'EDITAR CUENTA' : 'REGISTRAR NUEVA CUENTA'}
                                    </h6>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Usuario o Link IG</label>
                                        <input 
                                            type="text" className="form-control" 
                                            placeholder="ej: messi" 
                                            value={newUser} 
                                            onChange={(e) => setNewUser(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Ubicación</label>
                                        <input type="text" className="form-control" placeholder="Ciudad..." value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Status</label>
                                        <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                            <option value="publico">Público</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button type="submit" className={`btn w-100 fw-bold ${editingUserId ? 'btn-warning' : 'btn-primary'}`}>
                                            {editingUserId ? 'Actualizar' : 'Añadir'}
                                        </button>
                                    </div>
                                    {editingUserId && (
                                        <div className="col-12">
                                            <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={cancelEdit}>Cancelar edición</button>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <form onSubmit={handleBulkSubmit}>
                                    <h6 className="fw-bold text-muted mb-2">IMPORTACIÓN MASIVA (Formato: usuario, ubicación)</h6>
                                    <textarea 
                                        className="form-control mb-3" rows="5" 
                                        placeholder={"usuario1\nusuario2, Buenos Aires\nusuario3, Rosario"}
                                        value={bulkText} onChange={(e) => setBulkText(e.target.value)} required
                                    />
                                    <button className="btn btn-success w-100 fw-bold" disabled={loadingBulk}>
                                        {loadingBulk ? 'Procesando lista...' : '🚀 Importar Lista'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Usuario</th>
                                        <th>Ubicación</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(u => (
                                            <tr key={u._id || Math.random()}>
                                                <td className="ps-4 fw-bold">
                                                    <span className="text-muted small">@</span>{u.username}
                                                </td>
                                                <td className="text-muted">{u.location}</td>
                                                <td className="text-end pe-4">
                                                    <button onClick={() => handleEditClick(u)} className="btn btn-sm btn-light me-2" title="Editar">✏️</button>
                                                    <button onClick={() => deleteUser(u._id)} className="btn btn-sm btn-light text-danger" title="Eliminar">✕</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center p-4 text-muted">
                                                No hay cuentas registradas que coincidan con la búsqueda.
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

export default UserManagement;