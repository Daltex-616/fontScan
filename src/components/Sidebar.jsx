import React, { useState, useEffect } from 'react';

const Sidebar = ({ 
    filterValue, setFilterValue, saveCurrentFilter,
    savedFilters, deleteFilter, isScanning, handleScan, clearAllPosts,
    startDate, setStartDate, endDate, setEndDate, 
    clearDateFilters 
}) => {
    const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // En desktop, podrías elegir que inicie abierto, pero ahora permitimos que sea 0px
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarWidth = isOpen ? '280px' : '0px';

    const sidebarStyle = {
        width: sidebarWidth,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: 1050,
        overflowX: 'hidden',
        backgroundColor: '#fff',
        visibility: isOpen ? 'visible' : (isMobile ? 'hidden' : 'visible'), // Mantiene el track en desktop si quieres, pero width 0 lo oculta
        borderRight: isOpen ? '1px solid #dee2e6' : 'none',
        boxShadow: isOpen && isMobile ? '0 0.5rem 1rem rgba(0,0,0,0.15)' : 'none'
    };

    return (
        <>
            {/* BOTÓN TOGGLE FLOTANTE (Visible cuando el sidebar está cerrado) */}
            {(!isOpen || isMobile) && (
                <button 
                    className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                    style={{ 
                        position: 'fixed', 
                        bottom: '20px', 
                        left: isMobile ? 'auto' : '20px', // En PC a la izquierda, en móvil a la derecha
                        right: isMobile ? '20px' : 'auto', 
                        width: '55px', 
                        height: '55px', 
                        zIndex: 1100 
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '✕' : '🔍'}
                </button>
            )}

            {/* OVERLAY PARA MÓVIL */}
            {isMobile && isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1040, backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <div style={sidebarStyle} className="shadow-sm">
                {/* CONTENIDO INTERNO CON MIN-WIDTH PARA QUE NO SE DEFORME AL CERRAR */}
                <div style={{ minWidth: '280px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
                    
                    {/* HEADER CON CIERRE */}
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                        <h6 className="fw-bold m-0 text-primary">INSTA-MONITOR</h6>
                        <button 
                            className="btn btn-sm btn-outline-secondary border-0"
                            onClick={() => setIsOpen(false)}
                        >
                            ❮ Ocultar
                        </button>
                    </div>

                    <div className="p-3">
                        {/* BUSCADOR */}
                        <div className="mb-4">
                            <label className="small fw-bold text-muted text-uppercase mb-2 d-block" style={{fontSize: '0.7rem'}}>Filtros</label>
                            <div className="input-group mb-2 shadow-sm">
                                <input 
                                    type="text" className="form-control" placeholder="Buscar # o @" 
                                    value={filterValue} onChange={(e) => setFilterValue(e.target.value)} 
                                />
                                <button className="btn btn-warning" onClick={saveCurrentFilter}>⭐</button>
                            </div>

                            {/* Filtros Guardados */}
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {savedFilters?.map(f => (
                                    <div key={f._id} className="badge bg-light text-dark border d-flex align-items-center gap-2 p-2 rounded-pill">
                                        <span onClick={() => { setFilterValue(f.tag); if(isMobile) setIsOpen(false); }} className="cursor-pointer">{f.tag}</span>
                                        <span onClick={() => deleteFilter(f._id)} className="text-danger fw-bold cursor-pointer">×</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr />

                        {/* FECHAS */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <label className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.7rem'}}>Rango de Fechas</label>
                                {(startDate || endDate) && (
                                    <button onClick={clearDateFilters} className="btn btn-link btn-sm p-0 text-danger text-decoration-none fw-bold">LIMPIAR</button>
                                )}
                            </div>
                            <input type="date" className="form-control mb-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <input type="date" className="form-control" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .badge:hover { background-color: #e9ecef !important; }
            `}</style>
        </>
    );
};

export default Sidebar;