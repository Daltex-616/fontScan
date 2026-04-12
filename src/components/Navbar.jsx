import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top px-4">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/dashboard">
                    <span className="text-primary">●</span> INSTA-MONITOR
                </Link>
                
                <div className="d-flex gap-2">
                    <Link 
                        to="/dashboard" 
                        className={`btn btn-sm ${location.pathname === '/dashboard' ? 'btn-primary' : 'btn-outline-light border-0'}`}
                    >
                        📊 Monitor
                    </Link>
                    <Link 
                        to="/database" 
                        className={`btn btn-sm ${location.pathname === '/database' ? 'btn-primary' : 'btn-outline-light border-0'}`}
                    >
                        📁 Base de Datos
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;