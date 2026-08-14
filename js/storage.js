/**
 * storage.js
 * Persistencia simple en localStorage. Todo el estado de la app
 * (grupos + prendas) se guarda acá para no perderlo al recargar.
 */

const STORAGE_KEY = "emabitex-data";

/**
 * Carga el estado guardado, o devuelve un estado inicial con
 * el primer grupo por defecto ("GRUPO", gris pizarra).
 */
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      groups: [{ id: 1, name: "Grupo 1", color: GROUP_PALETTE[0].hex }],
      entries: [],
      nextGroupId: 2,
      nextGroupNumber: 2, // próximo nombre automático: "Grupo 2", "Grupo 3", ...
      nextEntryId: 1,
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.error("No se pudo leer el estado guardado, se reinicia.");
    return {
      groups: [{ id: 1, name: "Grupo 1", color: GROUP_PALETTE[0].hex }],
      entries: [],
      nextGroupId: 2,
      nextGroupNumber: 2,
      nextEntryId: 1,
    };
  }
}

/** Guarda el estado completo en localStorage */
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
