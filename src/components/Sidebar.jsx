import React from 'react';

const Sidebar = ({ 
    newUser, setNewUser, 
    newLocation, setNewLocation, 
    newStatus, setNewStatus, 
    handleAddUser,
    users, deleteUser, filterValue, setFilterValue, saveCurrentFilter,
    savedFilters, deleteFilter, isScanning, handleScan, clearAllPosts,
    startDate, setStartDate, endDate, setEndDate, 
    clearDateFilters,
    editingUserId, setEditingUserId, cancelEdit 
}) => {
    return (
        <div className="p-3 bg-white rounded shadow-sm border h-100 d-flex flex-column">
            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">INSTA-MONITOR</h6>
            
            {/* FORMULARIO: Crear o Editar */}
            <form onSubmit={handleAddUser} className={`mb-4 p-2 rounded ${editingUserId ? 'bg-light border border-warning' : ''}`}>
                <label className="small fw-bold text-muted">
                    {editingUserId ? 'EDITAR CUENTA' : 'MONITOREAR CUENTA'}
                </label>
                <div className="mb-1">
                    <input 
                        type="text" className="form-control form-control-sm mb-1 shadow-sm" 
                        placeholder="@usuario" value={newUser} 
                        onChange={(e) => setNewUser(e.target.value)} required 
                        disabled={editingUserId} 
                    />
                    <input 
                        type="text" className="form-control form-control-sm mb-1 shadow-sm" 
                        placeholder="Ubicación" value={newLocation} 
                        onChange={(e) => setNewLocation(e.target.value)} required 
                        autoFocus={editingUserId}
                    />
                    
                    {/* SELECT PARA STATUS SIN EMOTICONES */}
                    <select 
                        className="form-select form-select-sm mb-2 shadow-sm"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        <option value="publico">Público</option>
                        <option value="personal">Personal</option>
                    </select>
                </div>
                <button className={`btn btn-sm w-100 fw-bold shadow-sm ${editingUserId ? 'btn-warning' : 'btn-primary'}`}>
                    {editingUserId ? 'Actualizar' : 'Añadir'}
                </button>
                {editingUserId && (
                    <button type="button" onClick={cancelEdit} className="btn btn-link btn-sm w-100 text-danger mt-1 small" style={{fontSize: '0.7rem'}}>
                        Cancelar edición
                    </button>
                )}
            </form>

            <hr className="mt-0"/>

            {/* BUSCADOR */}
            <div className="mb-4">
                <label className="small fw-bold text-muted">BUSCADOR</label>
                <div className="input-group input-group-sm mb-2 shadow-sm">
                    <input 
                        type="text" className="form-control" placeholder="Buscar # o @" 
                        value={filterValue} onChange={(e) => setFilterValue(e.target.value)} 
                    />
                    <button 
                        className="btn btn-warning" type="button" 
                        onClick={(e) => { e.preventDefault(); saveCurrentFilter(); }}
                    >⭐</button>
                </div>
                <div className="d-flex flex-wrap gap-1 mt-2">
                    {savedFilters && savedFilters.map(f => (
                        <div key={f._id} className="badge bg-info text-dark d-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '0.7rem' }}>
                            <span onClick={() => setFilterValue(f.tag)} style={{ cursor: 'pointer' }}>{f.tag}</span>
                            <span onClick={() => deleteFilter(f._id)} className="ms-1 border-start ps-1 text-danger" style={{ cursor: 'pointer', fontWeight: 'bold' }}>×</span>
                        </div>
                    ))}
                </div>
            </div>

            <hr />

            {/* FILTRAR FECHAS */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="small fw-bold text-muted">FILTRAR POR FECHA</label>
                    {(startDate || endDate) && (
                        <button onClick={clearDateFilters} className="btn btn-sm p-0 text-danger fw-bold" style={{ fontSize: '0.65rem' }}>LIMPIAR</button>
                    )}
                </div>
                
                <div className="mb-2">
                    <label className="text-muted mb-0" style={{ fontSize: '0.65rem', display: 'block' }}>DESDE:</label>
                    <input 
                        type="date" 
                        className="form-control form-control-sm shadow-sm" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
                </div>

                <div>
                    <label className="text-muted mb-0" style={{ fontSize: '0.65rem', display: 'block' }}>HASTA:</label>
                    <input 
                        type="date" 
                        className="form-control form-control-sm shadow-sm" 
                        value={endDate} 
                        min={startDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                    />
                </div>
            </div>

            <hr />

            {/* LISTA DE CUENTAS SIN EMOTICONES */}
            <div className="mb-4 flex-grow-1" style={{minHeight: '0'}}>
                <label className="small fw-bold text-muted mb-1">CUENTAS ACTIVAS ({users.length})</label>
                <div className="border rounded p-1 bg-light shadow-inner h-100" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                    {users.length > 0 ? users.map(u => (
                        <div key={u._id} className={`d-flex justify-content-between align-items-center p-1 border-bottom mb-1 rounded ${editingUserId === u._id ? 'bg-warning-subtle border-warning' : 'bg-white shadow-sm'}`} style={{ fontSize: '0.75rem' }}>
                            <div className="text-truncate d-flex flex-column">
                                <div className="d-flex align-items-center gap-1">
                                    <span className="fw-bold">@{u.username}</span>
                                </div>
                                <span className="text-muted small" style={{fontSize: '0.65rem'}}>{u.location}</span>
                            </div>
                            <div className="d-flex gap-2">
                                <button onClick={() => setEditingUserId(u)} className="btn btn-sm text-primary p-0 border-0">✏️</button>
                                <button onClick={() => deleteUser(u._id)} className="btn btn-sm text-danger p-0 border-0">✕</button>
                            </div>
                        </div>
                    )) : <div className="text-center small text-muted p-2">Sin cuentas</div>}
                </div>
            </div>

            <div className="mt-auto">
                <button className={`btn btn-sm w-100 mb-2 fw-bold shadow-sm ${isScanning ? 'btn-warning border' : 'btn-dark'}`} onClick={handleScan} disabled={isScanning}>
                    {isScanning ? '🔄 ESCANEANDO...' : '🚀 ESCANEAR AHORA'}
                </button>
                <button className="btn btn-outline-danger btn-sm w-100 fw-bold" onClick={clearAllPosts}>Vaciar Historial</button>
            </div>
        </div>
    );
};

export default Sidebar;