import React from 'react';

const PostCard = ({ post }) => {
    // Función para formatear la fecha del timestamp
    const formatTimestamp = (dateValue) => {
        if (!dateValue) return "Reciente";
        
        const date = new Date(dateValue);
        
        // Formateamos: "18/03/2026 12:20" (Día/Mes/Año Hora:Minuto)
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Para que sea formato 24hs
        });
    };

    return (
        <div className="post-card shadow-sm">
            <div className="media-container mb-2">
                <span className="badge bg-dark position-absolute top-0 end-0 m-2" style={{ zIndex: 5 }}>
                    {post.type?.toUpperCase()}
                </span>
                <img 
                    src={post.mediaUrl} 
                    alt={post.type === 'reel' ? "Reel placeholder" : "Post"} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen'; }}
                />
            </div>
            
            <div className="flex-grow-1">
                <div className="post-meta-scroll" title={post.hashtags}>
                    <span className="tag-text">{post.hashtags || '#SinHashtags'}</span>
                </div>
                <div className="post-meta-scroll" title={post.mentions}>
                    <span className="mention-text">{post.mentions || '@SinMenciones'}</span>
                </div>
                <div className="text-muted mt-2 border-top pt-2" style={{ fontSize: '0.7rem' }}>
                    {/* CAMBIAMOS post.igDate por post.timestamp */}
                    🗓️ {formatTimestamp(post.timestamp)}
                </div>
            </div>

            <a href={post.url} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm w-100 mt-2 fw-bold">
                VER EN IG
            </a>
        </div>
    );
};

export default PostCard;