
import 'bootstrap/dist/css/bootstrap.min.css';
// AGREGA ESTA LÍNEA:
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useMemo, useState } from 'react';

const Database = ({ posts, users }) => {
    // ESTADOS PARA PAGINACIÓN DE HASHTAGS
    const [currentPage, setCurrentPage] = useState(0);
    const hashtagsPerPage = 5;

    // 1. LÓGICA DE ANÁLISIS
    const analysis = useMemo(() => {
        if (!posts || posts.length === 0) return { stats: null, topHashtags: [] };

        // Estadísticas para Widgets
        const horas = posts.map(p => new Date(p.timestamp).getHours());
        const frecHoras = horas.reduce((acc, h) => { acc[h] = (acc[h] || 0) + 1; return acc; }, {});
        const horaPico = Object.keys(frecHoras).length > 0 
            ? Object.keys(frecHoras).reduce((a, b) => frecHoras[a] > frecHoras[b] ? a : b) 
            : "0";
        
        // Ranking de Hashtags y Difusión
        const hashmap = {};
        posts.forEach(post => {
            if (post.hashtags) {
                const tags = post.hashtags.split(/\s+/).filter(t => t.startsWith('#'));
                tags.forEach(tag => {
                    const cleanTag = tag.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
                    if (!hashmap[cleanTag]) {
                        hashmap[cleanTag] = { count: 0, users: new Set() };
                    }
                    hashmap[cleanTag].count += 1;
                    hashmap[cleanTag].users.add(post.user);
                });
            }
        });

        const allHashtags = Object.entries(hashmap)
            .map(([tag, data]) => ({
                tag: `#${tag}`,
                count: data.count,
                authors: Array.from(data.users)
            }))
            .sort((a, b) => b.count - a.count);

        return {
            stats: {
                totalPosts: posts.length,
                horaPico,
                promedio: (posts.length / (users.length || 1)).toFixed(1)
            },
            allHashtags
        };
    }, [posts, users]);

    // Lógica de Paginación para Hashtags
    const totalPages = Math.ceil(analysis.allHashtags.length / hashtagsPerPage);
    const currentHashtags = analysis.allHashtags.slice(
        currentPage * hashtagsPerPage, 
        (currentPage + 1) * hashtagsPerPage
    );

    // Agrupación para el acordeón de usuarios
    const groupedData = useMemo(() => {
        return users.map(u => ({
            ...u,
            userPosts: posts.filter(p => p.user === u.username)
        })).filter(group => group.userPosts.length > 0);
    }, [posts, users]);

    // Función Exportar CSV
    const exportToCSV = () => {
        const headers = ["Usuario", "Ubicacion", "Status", "Fecha", "Contenido", "Link IG"];
        const rows = posts.map(p => {
            const u = users.find(user => user.username === p.user);
            return [
                p.user, u?.location || '---', u?.status || 'publico',
                new Date(p.timestamp).toLocaleString('es-AR'),
                `"${(p.hashtags || p.caption || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                p.url || ''
            ];
        });
        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reporte_completo.csv`;
        link.click();
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            
            {/* CABECERA */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0 text-dark">Panel de Monitoreo</h4>
                <button onClick={exportToCSV} className="btn btn-success fw-bold shadow-sm">
                    <i className="bi bi-download me-2"></i>Exportar CSV
                </button>
            </div>

            {/* WIDGETS */}
            <div className="row g-3 mb-4 text-center">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3 bg-dark text-white h-100">
                        <small className="opacity-75">REGISTROS</small>
                        <h3 className="fw-bold mb-0">{analysis.stats?.totalPosts || 0}</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3 bg-white h-100">
                        <small className="text-muted text-uppercase small">Hora de Mayor Tráfico</small>
                        <h3 className="fw-bold mb-0 text-primary">{analysis.stats?.horaPico}:00hs</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3 bg-white h-100">
                        <small className="text-muted text-uppercase small">Posts por Cuenta</small>
                        <h3 className="fw-bold mb-0 text-success">{analysis.stats?.promedio}</h3>
                    </div>
                </div>
            </div>

            {/* TABLA DE TENDENCIAS (CON PAGINACIÓN) */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Tendencias de Contenido</h6>
                    <div className="btn-group shadow-sm">
                        <button 
                            className="btn btn-outline-secondary btn-sm" 
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Anterior
                        </button>
                        <button 
                            className="btn btn-outline-secondary btn-sm" 
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-light text-muted">
                            <tr>
                                <th className="ps-4">Hashtag</th>
                                <th>Impacto</th>
                                <th>Difusión (Cuentas)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentHashtags.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-primary">{item.tag}</td>
                                    <td>
                                        <div className="d-flex align-items-center" style={{ width: '120px' }}>
                                            <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                                <div 
                                                    className="progress-bar bg-primary" 
                                                    style={{ width: `${(item.count / analysis.stats.totalPosts) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="fw-bold">{item.count}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {item.authors.length <= 2 ? (
                                            item.authors.map((u, i) => (
                                                <span key={i} className="badge bg-light text-dark border me-1 fw-normal">@{u}</span>
                                            ))
                                        ) : (
                                            <details className="position-relative">
                                                <summary className="text-primary small fw-bold" style={{ cursor: 'pointer', listStyle: 'none' }}>
                                                    @{item.authors[0]} y {item.authors.length - 1} más...
                                                </summary>
                                                <div className="position-absolute bg-white border shadow-sm p-2 rounded mt-1" style={{ zIndex: 100, minWidth: '150px' }}>
                                                    {item.authors.map((u, i) => (
                                                        <div key={i} className="small border-bottom py-1">@{u}</div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ACORDEÓN DE CUENTAS CON STATUS DINÁMICO */}
            <h6 className="fw-bold text-muted mb-3">DESGLOSE POR CUENTA</h6>
            <div className="accordion shadow-sm" id="mainAcc">
                {groupedData.map((group, index) => (
                    <div className="accordion-item border-0 mb-2 rounded overflow-hidden shadow-sm" key={group._id || index}>
                        <h2 className="accordion-header">
                            <button className="accordion-button collapsed py-3" type="button" data-bs-toggle="collapse" data-bs-target={`#c${index}`}>
                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                    <div>
                                        <span className="fw-bold text-dark">@{group.username}</span>
                                        {/* TU CÓDIGO DE COLORES APLICADO AQUÍ */}
                                        <span className={`badge border ms-3 fw-normal ${
                                            group.status === 'personal' 
                                            ? 'bg-danger-subtle text-danger border-danger' 
                                            : 'bg-success-subtle text-success border-success'
                                        }`}>
                                            {group.status || 'público'}
                                        </span>
                                    </div>
                                    <span className="badge bg-light text-dark border fw-normal">{group.userPosts.length} registros</span>
                                </div>
                            </button>
                        </h2>
                        <div id={`c${index}`} className="accordion-collapse collapse" data-bs-parent="#mainAcc">
                            <div className="accordion-body p-0">
                                <table className="table table-hover mb-0" style={{ fontSize: '0.8rem' }}>
                                    <thead className="table-light text-muted">
                                        <tr>
                                            <th className="ps-4">FECHA</th>
                                            <th>DETALLES</th>
                                            <th className="text-center">LINK</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.userPosts.map((p) => (
                                            <tr key={p._id}>
                                                <td className="ps-4 text-nowrap">{new Date(p.timestamp).toLocaleDateString()}</td>
                                                <td className="text-muted text-truncate" style={{maxWidth: '350px'}}>{p.hashtags || p.caption || "Sin texto"}</td>
                                                <td className="text-center">
                                                    <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link py-0 fw-bold">Ver IG</a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Database;