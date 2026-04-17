// EXPORTAR
export const exportPostsToCSV = (posts) => {
    if (!posts || posts.length === 0) return alert("No hay datos para exportar");
    const headers = ["Usuario", "Tipo", "Fecha IG", "Media URL", "Link Post", "Hashtags", "Mentions"];
    const rows = posts.map(p => [
        p.user || '', p.type || 'image', p.igDate || '', p.mediaUrl || '', 
        p.url || '', `"${(p.hashtags || "")}"`, `"${(p.mentions || "")}"`
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `plantilla_posts.csv`;
    link.click();
};

// IMPORTAR (NUEVO)
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split("\n").slice(1); // Omitir cabecera
            const data = lines.filter(line => line.trim() !== "").map(line => {
                // Regex para separar por comas respetando las comillas
                const columns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if (!columns) return null;
                return {
                    user: columns[0],
                    type: columns[1],
                    igDate: columns[2],
                    mediaUrl: columns[3],
                    url: columns[4],
                    hashtags: columns[5]?.replace(/"/g, ''),
                    mentions: columns[6]?.replace(/"/g, '')
                };
            }).filter(item => item !== null);
            resolve(data);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
};