import React, { useEffect, useState } from "react";
import api from "../services/api";
import { ShieldCheck, Edit3, Trash2, Download, Upload, Loader2, Play } from "lucide-react";
import { exportPostsToCSV, parseCSV } from "../utils/csvHelper";

const AdminManagement = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [admins, setAdmins] = useState([]);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ user: "", pass: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVerified) {
      fetchAdmins();
      fetchPosts();
    }
  }, [isVerified]);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin-users");
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setAdmins([]); }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (e) { console.error("Error cargando posts"); }
  };

  // --- RUTAS CORREGIDAS SEGÚN TU DASHBOARD ---
  const handleScan = async () => {
    if (!window.confirm("¿Iniciar escaneo de Instagram ahora?")) return;
    setIsScanning(true);
    try {
      // Usando la ruta exacta de tu Dashboard
      await api.post('/posts/scan'); 
      alert("🚀 El proceso de escaneo ha iniciado.");
    } catch (e) { 
      alert("Escaneo en curso o error de conexión."); 
    } finally {
      setIsScanning(false);
    }
  };

  const clearAllPosts = async () => {
    if (!window.confirm('¿Vaciar historial por completo?')) return;
    setIsScanning(true);
    try {
      // Usando la ruta exacta de tu Dashboard (es un POST según tu código)
      await api.post('/posts/clear-history'); 
      setPosts([]);
      alert("🗑️ Historial vaciado.");
      fetchPosts();
    } catch (err) { 
      alert("Error al vaciar el historial."); 
    } finally {
      setIsScanning(false);
    }
  };

  // --- GESTIÓN DE CUENTAS (Restaurado) ---
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: form.user, ...(form.pass && { password: form.pass }) };
      if (editingId) {
        await api.put(`/admin-users/${editingId}`, payload);
      } else {
        await api.post("/admin-users", payload);
      }
      setForm({ user: "", pass: "" });
      setEditingId(null);
      fetchAdmins();
      alert("Operación exitosa");
    } catch (err) {
      alert(err.response?.data?.msg || "Error en la operación");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("¿Eliminar este administrador?")) return;
    try {
      await api.delete(`/admin-users/${id}`);
      fetchAdmins();
    } catch (e) { alert("No se pudo eliminar"); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/login", authForm);
      setIsVerified(true);
    } catch (err) { setError("Credenciales inválidas"); }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataArray = await parseCSV(file);
      await api.post("/posts/bulk", { posts: dataArray }, { timeout: 60000 });
      alert("✅ Sincronización exitosa");
      fetchPosts();
    } catch (err) { alert("Error al sincronizar"); }
    finally { setLoading(false); e.target.value = null; }
  };

  if (!isVerified) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow-lg border-0" style={{ width: "380px" }}>
          <div className="text-center mb-3 text-primary"><ShieldCheck size={50} /></div>
          <h4 className="text-center fw-bold mb-4">Acceso Administrativo</h4>
          <form onSubmit={handleVerify}>
            <input type="text" className="form-control mb-3" placeholder="Usuario" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} required />
            <input type="password" className="form-control mb-3" placeholder="Contraseña" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <button className="btn btn-primary w-100 fw-bold">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5">
      {/* TOOLBAR SUPERIOR */}
      <div className="card border-0 shadow-sm mb-4 p-4">
        <div className="row align-items-center">
          <div className="col-md-5">
            <h3 className="fw-bold mb-1">Centro de Control</h3>
            <p className="text-muted mb-0 small">Administración y Acciones Críticas</p>
          </div>
          <div className="col-md-7 text-end d-flex gap-2 justify-content-end align-items-center">
            <button className={`btn d-flex align-items-center gap-2 fw-bold ${isScanning ? 'btn-warning' : 'btn-dark'}`} onClick={handleScan} disabled={isScanning}>
              {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />} Escanear Ahora
            </button>
            <button className="btn btn-outline-danger fw-bold" onClick={clearAllPosts} disabled={isScanning}>
              <Trash2 size={18} /> Vaciar Historial
            </button>
            <div className="vr mx-2"></div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => exportPostsToCSV(posts)}><Download size={16} /> Backup</button>
            <label className="btn btn-success btn-sm m-0" style={{ cursor: "pointer" }}>
              <Upload size={16} /> Importar
              <input type="file" accept=".csv" hidden onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        {/* FORMULARIO DE CUENTAS */}
        <div className="col-md-4">
          <div className="card shadow-sm p-4 border-0">
            <h5 className="fw-bold mb-3">{editingId ? "Editar Usuario" : "Nuevo Administrador"}</h5>
            <form onSubmit={handleAdminSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">USUARIO</label>
                <input type="text" className="form-control" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">CONTRASEÑA</label>
                <input type="password" className="form-control" placeholder={editingId ? "Vacio para no cambiar" : "****"} value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} required={!editingId} />
              </div>
              <button className={`btn w-100 fw-bold ${editingId ? 'btn-warning' : 'btn-primary'}`}>
                {editingId ? "Actualizar" : "Crear Acceso"}
              </button>
              {editingId && <button type="button" className="btn btn-link w-100 btn-sm text-muted" onClick={() => {setEditingId(null); setForm({user:'', pass:''})}}>Cancelar</button>}
            </form>
          </div>
        </div>

        {/* LISTADO DE CUENTAS */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="p-3 bg-white border-bottom"><h6 className="m-0 fw-bold">Usuarios con Acceso al Panel</h6></div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr><th className="ps-4">Nombre de Usuario</th><th className="text-end pe-4">Acciones</th></tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a._id}>
                      <td className="ps-4 fw-bold">{a.username}</td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-light me-2" onClick={() => { setEditingId(a._id); setForm({ user: a.username, pass: "" }); }}><Edit3 size={16} /></button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => deleteAdmin(a._id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;