// EXPORTAR
export const exportPostsToCSV = (posts) => {
    if (!posts || posts.length === 0) return alert("No hay datos para exportar");
    
    // Encabezados claros
    const headers = ["Usuario", "Tipo", "Fecha IG", "Media URL", "Link Post", "Hashtags", "Mentions"];
    
    const rows = posts.map(p => [
        p.user || '', 
        p.type || 'image', 
        p.igDate || '', 
        p.mediaUrl || '', 
        p.url || '', 
        `"${(p.hashtags || "").replace(/"/g, '""')}"`, // Escapar comillas internas
        `"${(p.mentions || "").replace(/"/g, '""')}"`
    ]);

    // Usamos \ufeff para que Excel reconozca los acentos (UTF-8)
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup_posts_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};

// IMPORTAR (CORREGIDO)
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split(/\r?\n/); // Soporta saltos de línea Windows/Linux
            const data = [];

            // Empezamos desde i = 1 para saltar la cabecera
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Nueva Regex que maneja campos vacíos correctamente
                // Divide por comas, pero ignora las comas dentro de comillas
                const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

                if (columns.length >= 5) { // Validamos que al menos tenga los datos básicos
                    data.push({
                        user: columns[0]?.trim(),
                        type: columns[1]?.trim() || 'image',
                        igDate: columns[2]?.trim(),
                        mediaUrl: columns[3]?.trim(),
                        url: columns[4]?.trim(),
                        hashtags: columns[5]?.replace(/^"|"$/g, '').replace(/""/g, '"').trim(),
                        mentions: columns[6]?.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
                    });
                }
            }
            resolve(data);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
};