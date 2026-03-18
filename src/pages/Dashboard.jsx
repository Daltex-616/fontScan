import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Sub-componentes
import Sidebar from '../components/Sidebar';
import UserAccordion from '../components/UserAccordion';

const Dashboard = () => {
    // --- 1. ESTADOS DE DATOS ---
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);

    // --- 2. ESTADOS DE FORMULARIO / FILTROS ---
    const [newUser, setNewUser] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterLocation, setFilterLocation] = useState('');

    // --- 3. ESTADO DE EDICIÓN ---
    const [editingUserId, setEditingUserId] = useState(null);

    // --- 4. ESTADOS DE UI ---
    const [isScanning, setIsScanning] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);
    const [currentPageUsers, setCurrentPageUsers] = useState(1);
    const usersPerPage = 6;

    const navigate = useNavigate();

    // --- CARGA INICIAL Y POLLING ---
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
        } catch (e) {
            console.error("Error al cargar filtros guardados");
        }
    };

    const checkScanStatus = async () => {
        try {
            const res = await api.get('/posts/scan-status'); 
            const wasScanning = isScanning;
            setIsScanning(res.data.isScanning);
            
            if (wasScanning && !res.data.isScanning) {
                fetchData();
            }
        } catch (e) {}
    };

    // --- 5. ACCIONES DE USUARIOS ---
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                await api.put(`/users/${editingUserId}`, { 
                    username: newUser, 
                    location: newLocation 
                });
                setEditingUserId(null);
            } else {
                await api.post('/users', { 
                    username: newUser, 
                    location: newLocation 
                });
            }
            setNewUser('');
            setNewLocation('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || "Error en la operación");
        }
    };

    const startEditUser = (user) => {
        setEditingUserId(user._id);
        setNewUser(user.username);
        setNewLocation(user.location);
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setNewUser('');
        setNewLocation('');
    };

    const deleteUser = async (id) => {
        if (window.confirm('¿Eliminar esta cuenta?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchData();
            } catch (err) {
                console.error("Error al borrar usuario");
            }
        }
    };

    // --- 6. ACCIONES DE BOT ---
    const handleScan = async () => {
        try {
            await api.post('/posts/scan');
            setIsScanning(true);
        } catch (e) {
            alert("Ya hay un escaneo en curso.");
        }
    };

    const clearAllPosts = async () => {
        if (window.confirm('¿Vaciar historial?')) {
            try {
                await api.post('/posts/clear-history'); 
                setPosts([]);
                fetchData();
            } catch (err) {
                console.error("Error al vaciar historial");
            }
        }
    };

    // --- 7. GESTIÓN DE FILTROS ---
    const saveCurrentFilter = async () => {
        if (!filterValue.trim()) return;
        try {
            await api.post('/filters', { tag: filterValue.trim() });
            fetchFilters();
        } catch (e) {
            alert("Este filtro ya existe.");
        }
    };

    const deleteFilter = async (id) => {
        try {
            await api.delete(`/filters/${id}`);
            fetchFilters();
        } catch (e) {}
    };

    const clearDateFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    // --- 8. LÓGICA DE FILTRADO CORREGIDA ---
    const uniqueLocations = useMemo(() => {
        return [...new Set(users.map(u => u.location))].filter(Boolean).sort();
    }, [users]);

    const filteredPosts = useMemo(() => {
        const search = String(filterValue || "").toLowerCase().trim();

        return posts.filter(p => {
            // Filtro de texto
            const matchesText = !search || 
                p.hashtags?.toLowerCase().includes(search) || 
                p.mentions?.toLowerCase().includes(search) ||
                p.user?.toLowerCase().includes(search);
            
            // Filtro de localidad
            const userObj = users.find(u => u.username === p.user);
            const matchesLocation = !filterLocation || userObj?.location === filterLocation;

            // Filtro de fecha robusto
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
            posts: filteredPosts.filter(p => p.user === u.username)
        }));
        
        return (filterValue || filterLocation || startDate || endDate) 
            ? groups.filter(g => g.posts.length > 0) 
            : groups;
    }, [users, filteredPosts, filterValue, filterLocation, startDate, endDate]);

    // Paginación
    const totalUserPages = Math.ceil(groupedPosts.length / usersPerPage);
    const currentUsersGroup = groupedPosts.slice(
        (currentPageUsers - 1) * usersPerPage, 
        currentPageUsers * usersPerPage
    );

    return (
        <div className="container-fluid bg-light" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="row">
                <div className="col-lg-3">
                    <Sidebar 
                        newUser={newUser} setNewUser={setNewUser}
                        newLocation={newLocation} setNewLocation={setNewLocation}
                        handleAddUser={handleAddUser}
                        users={users} deleteUser={deleteUser}
                        filterValue={filterValue} 
                        setFilterValue={(val) => { setFilterValue(val); setCurrentPageUsers(1); }}
                        saveCurrentFilter={saveCurrentFilter}
                        savedFilters={savedFilters} deleteFilter={deleteFilter}
                        startDate={startDate} setStartDate={setStartDate}
                        endDate={endDate} setEndDate={setEndDate}
                        clearDateFilters={clearDateFilters}
                        isScanning={isScanning} handleScan={handleScan}
                        clearAllPosts={clearAllPosts}
                        editingUserId={editingUserId}
                        setEditingUserId={startEditUser}
                        cancelEdit={cancelEdit}
                    />
                </div>

                <div className="col-lg-9">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-3 rounded shadow-sm border">
                        <h4 className="fw-bold mb-0">
                            Monitor de Actividad 
                            <span className="badge bg-primary ms-2" style={{fontSize:'0.8rem'}}>
                                {filteredPosts.length} resultados
                            </span>
                        </h4>

                        <div className="d-flex align-items-center gap-2">
                            <label className="small fw-bold text-muted text-nowrap">ZONA:</label>
                            <select 
                                className="form-select form-select-sm shadow-sm" 
                                style={{ width: '200px', borderRadius: '8px' }}
                                value={filterLocation}
                                onChange={(e) => { setFilterLocation(e.target.value); setCurrentPageUsers(1); }}
                            >
                                <option value="">Todas las localidades</option>
                                {uniqueLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            {filterLocation && (
                                <button className="btn btn-sm btn-link text-danger p-0 fw-bold" onClick={() => setFilterLocation('')}>✕</button>
                            )}
                        </div>
                    </div>

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
                        <div className="text-center p-5 bg-white rounded shadow-sm border">
                            <h5 className="text-muted">Sin coincidencias</h5>
                            <p className="small text-muted mb-0">Ajusta los filtros o selecciona otra localidad.</p>
                        </div>
                    )}

                    {totalUserPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center mt-4 mb-5">
                            <button 
                                className="btn btn-sm btn-outline-primary me-3" 
                                disabled={currentPageUsers === 1}
                                onClick={() => { setCurrentPageUsers(p => p - 1); window.scrollTo(0,0); }}
                            >← Anterior</button>
                            <span className="fw-bold text-muted small">Página {currentPageUsers} de {totalUserPages}</span>
                            <button 
                                className="btn btn-sm btn-outline-primary ms-3" 
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