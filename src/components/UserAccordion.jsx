import React, { useState } from 'react';
import PostCard from './PostCard';

const UserAccordion = ({ group, isOpened, onToggle }) => {
    // Paginación interna para los posts de este usuario específico
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    const totalPages = Math.ceil(group.posts.length / postsPerPage);
    const currentPosts = group.posts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    );

    return (
        <div className="accordion-item shadow-sm mb-3 bg-white rounded border-0">
            {/* Cabecera del Acordeón */}
            <div 
                className="p-3 fw-bold d-flex justify-content-between align-items-center" 
                onClick={onToggle} 
                style={{ cursor: 'pointer' }}
            >
                <span>
                    👤 @{group.user} 
                    <small className="text-muted ms-2 fw-normal">| {group.location}</small>
                </span>
                <span className="badge bg-primary rounded-pill">
                    {group.posts.length} posts
                </span>
            </div>

            {/* Contenido Expandible */}
            {isOpened && (
                <div className="p-3 bg-light border-top">
                    <div className="row g-3">
                        {currentPosts.length > 0 ? (
                            currentPosts.map((post) => (
                                <div className="col-md-4" key={post._id}>
                                    <PostCard post={post} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center text-muted py-3">
                                No hay posts que coincidan con el filtro.
                            </div>
                        )}
                    </div>

                    {/* Paginación Interna (Solo si hay más de una página) */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                            <button 
                                className="btn btn-sm btn-outline-secondary" 
                                disabled={currentPage === 1} 
                                onClick={(e) => { e.stopPropagation(); setCurrentPage(currentPage - 1); }}
                            >
                                ←
                            </button>
                            <span className="fw-bold small">Pág {currentPage} / {totalPages}</span>
                            <button 
                                className="btn btn-sm btn-outline-secondary" 
                                disabled={currentPage === totalPages} 
                                onClick={(e) => { e.stopPropagation(); setCurrentPage(currentPage + 1); }}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserAccordion;