import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Sub-componentes
import Sidebar from '../components/Sidebar';
import UserAccordion from '../components/UserAccordion';

const Dashboard = () => {
    // --- ESTADOS ---
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);
    const [filterValue, setFilterValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);
    const [currentPageUsers, setCurrentPageUsers] = useState(1);
    const usersPerPage = 10;

    const navigate = useNavigate();

    // --- EFECTOS ---
    useEffect(() => {
        fetchData();
        fetchFilters();
        checkScanStatus();
        const interval = setInterval(checkScanStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [postsRes, usersRes] = await Promise.all([
                api.get('/posts'),
                api.get('/users')
            ]);
            setPosts(postsRes.data);
            setUsers(usersRes.data);
        } catch (err) { 
            if (err.response?.status === 401) navigate('/login'); 
        }
    };

    const fetchFilters = async () => {
        try { 
            const res = await api.get('/filters'); 
            setSavedFilters(res.data); 
        } catch (e) { console.error("Error filtros"); }
    };

    const checkScanStatus = async () => {
        try {
            const res = await api.get('/posts/scan-status'); 
            setIsScanning(res.data.isScanning);
            if (isScanning && !res.data.isScanning) fetchData();
        } catch (e) {}
    };

    // --- ACCIONES ---
    const handleScan = async () => {
        try {
            await api.post('/posts/scan');
            setIsScanning(true);
        } catch (e) { alert("Escaneo en curso."); }
    };

    const clearAllPosts = async () => {
        if (window.confirm('¿Vaciar historial?')) {
            try {
                await api.post('/posts/clear-history'); 
                setPosts([]);
                fetchData();
            } catch (err) { console.error("Error clear"); }
        }
    };

    const saveCurrentFilter = async () => {
        if (!filterValue.trim()) return;
        try {
            await api.post('/filters', { tag: filterValue.trim() });
            fetchFilters();
        } catch (e) { alert("Filtro ya existe."); }
    };

    const deleteFilter = async (id) => {
        try {
            await api.delete(`/filters/${id}`);
            fetchFilters();
        } catch (e) {}
    };

    // --- LÓGICA DE FILTRADO ---
    const normalizeString = (str) => {
        if (!str) return "";
        return str.trim().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const uniqueLocations = useMemo(() => {
        const locs = users.map(u => normalizeString(u.location)).filter(Boolean);
        return [...new Set(locs)].sort();
    }, [users]);

    const filteredPosts = useMemo(() => {
        const search = String(filterValue || "").toLowerCase().trim();
        const targetLoc = normalizeString(filterLocation);

        return posts.filter(p => {
            const matchesText = !search || 
                p.hashtags?.toLowerCase().includes(search) || 
                p.user?.toLowerCase().includes(search);
            
            const userObj = users.find(u => u.username === p.user);
            const userLocNormalized = normalizeString(userObj?.location);
            const matchesLocation = !filterLocation || userLocNormalized === targetLoc;

            let matchesDate = true;
            const postDate = p.timestamp ? new Date(p.timestamp) : null;
            if (postDate && !isNaN(postDate)) {
                if (startDate) {
                    const sDate = new Date(startDate + 'T00:00:00');
                    if (postDate < sDate) matchesDate = false;
                }
                if (endDate) {
                    const eDate = new Date(endDate + 'T23:59:59');
                    if (postDate > eDate) matchesDate = false;
                }
            }
            return matchesText && matchesDate && matchesLocation;
        });
    }, [posts, filterValue, startDate, endDate, filterLocation, users]);

    const groupedPosts = useMemo(() => {
        const groups = users.map(u => ({
            user: u.username,
            location: u.location,
            status: u.status,
            posts: filteredPosts.filter(p => p.user === u.username)
        }));
        return (filterValue || filterLocation || startDate || endDate) 
            ? groups.filter(g => g.posts.length > 0) : groups;
    }, [users, filteredPosts, filterValue, filterLocation, startDate, endDate]);

    const totalUserPages = Math.ceil(groupedPosts.length / usersPerPage);
    const currentUsersGroup = groupedPosts.slice((currentPageUsers - 1) * usersPerPage, currentPageUsers * usersPerPage);

    return (
        <div className="d-flex bg-light" style={{ minHeight: '100vh' }}>
            
            <Sidebar 
                filterValue={filterValue} 
                setFilterValue={(val) => { setFilterValue(val); setCurrentPageUsers(1); }}
                saveCurrentFilter={saveCurrentFilter}
                savedFilters={savedFilters} 
                deleteFilter={deleteFilter}
                startDate={startDate} 
                setStartDate={setStartDate}
                endDate={endDate} 
                setEndDate={setEndDate}
                clearDateFilters={() => { setStartDate(''); setEndDate(''); }}
                isScanning={isScanning} 
                handleScan={handleScan}
                clearAllPosts={clearAllPosts}
            />

            <div className="flex-grow-1 p-4" style={{ overflowX: 'hidden' }}>
                <div className="container-fluid p-0">
                    
                    {/* TOP BAR */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-3 rounded shadow-sm border">
                        <h4 className="fw-bold mb-0 text-dark">
                            Monitor de Actividad 
                            <span className="badge bg-primary ms-2" style={{fontSize:'0.75rem'}}>
                                {filteredPosts.length} registros
                            </span>
                        </h4>

                        <div className="d-flex align-items-center gap-2">
                            <label className="small fw-bold text-muted">ZONA:</label>
                            <select 
                                className="form-select form-select-sm shadow-sm" 
                                style={{ width: '220px', borderRadius: '8px' }}
                                value={filterLocation}
                                onChange={(e) => { setFilterLocation(e.target.value); setCurrentPageUsers(1); }}
                            >
                                <option value="">Todas las localidades</option>
                                {uniqueLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ACORDEONES */}
                    {currentUsersGroup.length > 0 ? (
                        currentUsersGroup.map((group, idx) => (
                            <UserAccordion 
                                key={group.user}
                                group={group}
                                isOpened={openIndex === idx}
                                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                            />
                        ))
                    ) : (
                        <div className="text-center p-5 bg-white rounded shadow-sm border my-5">
                            <h5 className="text-muted">No se encontraron resultados</h5>
                            <p className="small text-muted">Intenta cambiar los filtros del sidebar.</p>
                        </div>
                    )}

                    {/* PAGINACIÓN */}
                    {totalUserPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
                            <button 
                                className="btn btn-sm btn-outline-primary shadow-sm me-3 px-3" 
                                disabled={currentPageUsers === 1}
                                onClick={() => { setCurrentPageUsers(p => p - 1); window.scrollTo(0,0); }}
                            >← Anterior</button>
                            <span className="fw-bold text-muted small">Página {currentPageUsers} de {totalUserPages}</span>
                            <button 
                                className="btn btn-sm btn-outline-primary shadow-sm ms-3 px-3" 
                                disabled={currentPageUsers === totalUserPages}
                                onClick={() => { setCurrentPageUsers(p => p + 1); window.scrollTo(0,0); }}
                            >Siguiente →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;