import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useMemo, useState, useEffect } from 'react';
import api from '../services/api';

const Database = ({ posts = [], users = [] }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [lastSync, setLastSync] = useState("");
    const [expandedTag, setExpandedTag] = useState(null); // Para ver cuentas en móvil
    const hashtagsPerPage = 5;

    useEffect(() => {
        const fetchUpdateDate = async () => {
            try {
                const res = await api.get('/posts/last-update');
                if (res.data && res.data.date) {
                    const d = new Date(res.data.date);
                    setLastSync(`Actualizado: ${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`);
                }
            } catch (e) { console.error("Error de fecha"); }
        };
        fetchUpdateDate();
    }, []);

    const analysis = useMemo(() => {
        if (!posts.length) return { stats: { totalPosts: 0, horaPico: "0", promedio: "0" }, allHashtags: [] };
        
        const hashmap = {};
        posts.forEach(post => {
            if (post.hashtags) {
                const tags = post.hashtags.split(/\s+/).filter(t => t.startsWith('#'));
                tags.forEach(tag => {
                    const cleanTag = tag.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
                    if (!hashmap[cleanTag]) hashmap[cleanTag] = { count: 0, users: new Set() };
                    hashmap[cleanTag].count += 1;
                    hashmap[cleanTag].users.add(post.user);
                });
            }
        });

        return {
            stats: { 
                totalPosts: posts.length, 
                promedio: (posts.length / (users.length || 1)).toFixed(1) 
            },
            allHashtags: Object.entries(hashmap)
                .map(([tag, data]) => ({ tag: `#${tag}`, count: data.count, authors: Array.from(data.users) }))
                .sort((a, b) => b.count - a.count)
        };
    }, [posts, users]);

    const currentHashtags = (analysis.allHashtags || []).slice(currentPage * hashtagsPerPage, (currentPage + 1) * hashtagsPerPage);

    const groupedData = useMemo(() => {
        return users.map(u => ({
            ...u,
            userPosts: posts.filter(p => p.user === u.username)
        })).filter(group => group.userPosts.length > 0);
    }, [posts, users]);

    const exportToCSV = () => {
        const headers = ["Usuario", "Ubicacion", "Status", "Fecha", "Contenido", "Link"];
        const rows = posts.map(p => {
            const u = users.find(user => user.username === p.user);
            return [p.user, u?.location || '', u?.status || '', new Date(p.timestamp).toLocaleString(), `"${(p.hashtags || "").replace(/"/g, '""')}"`, p.url];
        });
        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
        link.download = `reporte.csv`;
        link.click();
    };

    return (
        <div className="container-fluid p-2 p-md-4 bg-light min-vh-100">
            {/* ENCABEZADO OPTIMIZADO */}
            <div className="d-flex justify-content-between align-items-start mb-4 bg-white p-3 rounded shadow-sm">
                <div>
                    <h5 className="fw-bold m-0 text-dark">Panel de Monitoreo</h5>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{lastSync}</small>
                </div>
                <button onClick={exportToCSV} className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 fw-bold">
                    <span>📊</span> <span className="d-none d-md-inline">Exportar</span>
                </button>
            </div>

            {/* ESTADÍSTICAS COMPACTAS */}
            <div className="row g-2 mb-4">
                <div className="col-4">
                    <div className="card border-0 shadow-sm p-2 text-center">
                        <span className="x-small text-muted fw-bold">POSTS</span>
                        <h5 className="fw-bold mb-0">{analysis.stats.totalPosts}</h5>
                    </div>
                </div>
                <div className="col-8">
                    <div className="card border-0 shadow-sm p-2 text-center h-100 d-flex flex-row align-items-center justify-content-around">
                        <div>
                            <span className="x-small text-muted fw-bold">PROMEDIO</span>
                            <h5 className="fw-bold mb-0 text-success">{analysis.stats.promedio}</h5>
                        </div>
                        <div className="vr mx-2"></div>
                        <div>
                            <span className="x-small text-muted fw-bold">TENDENCIAS</span>
                            <h5 className="fw-bold mb-0 text-primary">{analysis.allHashtags.length}</h5>
                        </div>
                    </div>
                </div>
            </div>

            {/* HASHTAGS CON VISTA AMPLIADA EN MÓVIL */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                    <span className="fw-bold small">Tendencias</span>
                    <div className="btn-group">
                        <button className="btn btn-xs btn-light border" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>‹</button>
                        <button className="btn btn-xs btn-light border" disabled={currentPage >= Math.ceil(analysis.allHashtags.length / hashtagsPerPage) - 1} onClick={() => setCurrentPage(currentPage + 1)}>›</button>
                    </div>
                </div>
                
                <div className="p-0">
                    {currentHashtags.map((item, idx) => (
                        <div key={idx} className="border-bottom p-3 post-item-hover" onClick={() => setExpandedTag(expandedTag === idx ? null : idx)}>
                            <div className="d-flex justify-content-between align-items-center cursor-pointer">
                                <div>
                                    <span className="fw-bold text-primary">{item.tag}</span>
                                    <div className="x-small text-muted d-md-none">Tocar para ver cuentas</div>
                                </div>
                                <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3">{item.count}</span>
                            </div>
                            
                            {/* Cuentas - Visible siempre en Desktop o expandido en Móvil */}
                            <div className={`mt-2 flex-wrap gap-1 ${expandedTag === idx ? 'd-flex' : 'd-none d-md-flex'}`}>
                                {item.authors.map((a, i) => (
                                    <span key={i} className="badge bg-light text-dark border fw-normal x-small">@{a}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ACORDEÓN DE USUARIOS ALINEADO */}
            <div className="accordion accordion-flush rounded shadow-sm overflow-hidden" id="mainAcc">
                {groupedData.map((group, index) => (
                    <div className="accordion-item" key={index}>
                        <h2 className="accordion-header">
                            <button className="accordion-button collapsed py-3 px-3" type="button" data-bs-toggle="collapse" data-bs-target={`#c${index}`}>
                                <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="fw-bold text-dark">@{group.username}</span>
                                        <span className={`badge ${group.status === 'personal' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} border-0 small d-none d-md-inline-block`}>
                                            {group.status || 'público'}
                                        </span>
                                    </div>
                                    <div className="text-end">
                                        <span className={`badge bg-danger text-danger bg-opacity-10 d-md-none mb-1 d-block`}>{group.status}</span>
                                        <span className="text-muted x-small fw-bold">{group.userPosts.length} POSTS</span>
                                    </div>
                                </div>
                            </button>
                        </h2>
                        <div id={`c${index}`} className="accordion-collapse collapse" data-bs-parent="#mainAcc">
                            <div className="accordion-body p-0 bg-light-subtle">
                                {group.userPosts.map((p, pIdx) => (
                                    <div key={pIdx} className="p-3 border-bottom d-flex justify-content-between align-items-start">
                                        <div style={{ maxWidth: '80%' }}>
                                            <small className="text-muted d-block mb-1">{new Date(p.timestamp).toLocaleDateString()}</small>
                                            <p className="small mb-0 text-truncate-2">{p.hashtags || "Sin texto"}</p>
                                        </div>
                                        <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-xs btn-primary">IG</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .x-small { font-size: 0.68rem; }
                .btn-xs { padding: 0.2rem 0.4rem; font-size: 0.7rem; }
                .text-truncate-2 {
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                }
                .cursor-pointer { cursor: pointer; }
                .post-item-hover:hover { background-color: #f8f9fa; }
                .accordion-button:not(.collapsed) { background-color: #f8f9fa; color: inherit; }
            `}</style>
        </div>
    );
};

export default Database;