/**
 * export.js
 * Genera un archivo .sql con las tablas `grupos` y `prendas` ya creadas
 * y con los datos actuales cargados, listo para importar en MySQL con:
 *   mysql -u usuario -p base_de_datos < emabitex-talles.sql
 */

/** Escapa comillas simples para no romper el INSERT */
function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

/** Formatea una fecha ISO a formato DATETIME de MySQL (YYYY-MM-DD HH:MM:SS) */
function toMySQLDatetime(isoString) {
  return isoString.slice(0, 19).replace("T", " ");
}

/**
 * Arma el contenido completo del archivo .sql a partir del estado actual.
 * @param {{groups: Array, entries: Array}} state
 * @returns {string}
 */
function buildSQLExport(state) {
  const lines = [];

  lines.push("-- Emabitex — export de talles para MySQL");
  lines.push(`-- Generado el ${new Date().toLocaleString("es-AR")}`);
  lines.push("");

  lines.push("CREATE TABLE IF NOT EXISTS grupos (");
  lines.push("  id INT AUTO_INCREMENT PRIMARY KEY,");
  lines.push("  nombre VARCHAR(50) NOT NULL,");
  lines.push("  color_hex VARCHAR(7) NOT NULL");
  lines.push(");");
  lines.push("");

  lines.push("CREATE TABLE IF NOT EXISTS prendas (");
  lines.push("  id INT AUTO_INCREMENT PRIMARY KEY,");
  lines.push("  nombre VARCHAR(100) NOT NULL,");
  lines.push("  talle ENUM('XS','S','M','L','XL','2XL','3XL') NOT NULL,");
  lines.push("  grupo_id INT NOT NULL,");
  lines.push("  creado_en DATETIME NOT NULL,");
  lines.push("  FOREIGN KEY (grupo_id) REFERENCES grupos(id)");
  lines.push(");");
  lines.push("");

  if (state.groups.length > 0) {
    lines.push("INSERT INTO grupos (id, nombre, color_hex) VALUES");
    const groupRows = state.groups.map(
      (g) => `  (${g.id}, '${sqlEscape(g.name)}', '${g.color}')`
    );
    lines.push(groupRows.join(",\n") + ";");
    lines.push("");
  }

  if (state.entries.length > 0) {
    lines.push("INSERT INTO prendas (nombre, talle, grupo_id, creado_en) VALUES");
    const entryRows = state.entries.map(
      (e) =>
        `  ('${sqlEscape(e.name)}', '${e.size}', ${e.groupId}, '${toMySQLDatetime(e.createdAt)}')`
    );
    lines.push(entryRows.join(",\n") + ";");
  }

  return lines.join("\n");
}

/** Dispara la descarga del archivo .sql en el navegador */
function downloadSQLExport(state) {
  const sql = buildSQLExport(state);
  const blob = new Blob([sql], { type: "application/sql" });
  const url = URL.createObjectURL(blob);

  const fecha = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `emabitex-talles-${fecha}.sql`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
