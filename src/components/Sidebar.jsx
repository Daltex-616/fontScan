import React, { useState } from 'react';

const Sidebar = ({ 
    filterValue, setFilterValue, saveCurrentFilter,
    savedFilters, deleteFilter, isScanning, handleScan, clearAllPosts,
    startDate, setStartDate, endDate, setEndDate, 
    clearDateFilters 
}) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div 
            className="bg-white border-end shadow-sm d-flex flex-column"
            style={{ 
                width: isOpen ? '280px' : '70px', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '100vh',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                overflowX: 'hidden'
            }}
        >
            {/* BOTÓN TOGGLE */}
            <div className="d-flex justify-content-end p-3">
                <button 
                    className="btn btn-sm btn-light border shadow-sm"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '❮' : '☰'}
                </button>
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div className={`flex-grow-1 px-3 ${isOpen ? 'opacity-100' : 'opacity-0 disabled'}`} 
                 style={{ transition: 'opacity 0.2s', pointerEvents: isOpen ? 'all' : 'none', minWidth: '280px' }}>
                
                <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">INSTA-MONITOR</h6>
                
                {/* BUSCADOR */}
                <div className="mb-4">
                    <label className="small fw-bold text-muted text-uppercase mb-1" style={{fontSize: '0.65rem'}}>Buscador</label>
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

                    {/* Filtros Guardados */}
                    <div className="d-flex flex-wrap gap-1 mt-2">
                        {savedFilters && savedFilters.map(f => (
                            <div key={f._id} className="badge bg-info text-dark d-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '0.7rem', fontWeight: '500' }}>
                                <span onClick={() => setFilterValue(f.tag)} style={{ cursor: 'pointer' }}>{f.tag}</span>
                                <span onClick={() => deleteFilter(f._id)} className="ms-1 border-start ps-1 text-danger" style={{ cursor: 'pointer' }}>×</span>
                            </div>
                        ))}
                    </div>
                </div>

                <hr />

                {/* FILTRAR FECHAS */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.65rem'}}>Fechas</label>
                        {(startDate || endDate) && (
                            <button onClick={clearDateFilters} className="btn btn-sm p-0 text-danger fw-bold" style={{ fontSize: '0.65rem' }}>LIMPIAR</button>
                        )}
                    </div>
                    <div className="mb-2">
                        <input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <input type="date" className="form-control form-control-sm" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <hr />
            </div>
        </div>
    );
};

export default Sidebar;