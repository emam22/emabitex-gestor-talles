/**
 * app.js
 * Orquesta toda la app: estado en memoria (sincronizado con localStorage),
 * render del listado, de las estadísticas, y las acciones de
 * agregar/eliminar/renombrar/ordenar/exportar.
 */

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

// Mapa de orden real de talles (no alfabético: XS < S < M < L < XL < 2XL < 3XL)
const SIZE_ORDER = { XS: 0, S: 1, M: 2, L: 3, XL: 4, "2XL": 5, "3XL": 6 };

let state = loadState();

// Estado de ordenamiento de la lista. field: null (orden de entrada), "size", "name" o "group".
let sortState = { field: null, direction: "asc" };

// Id del grupo que se está renombrando en el panel de Estadísticas (null = ninguno)
let editingGroupId = null;

/**
 * Devuelve las entradas a mostrar, respetando el ordenamiento activo.
 * Si no hay ningún orden elegido, se muestran tal como fueron agregadas.
 */
function getDisplayEntries() {
  if (!sortState.field) return state.entries;

  const sorted = [...state.entries].sort((a, b) => {
    let comparison = 0;

    if (sortState.field === "size") {
      comparison = SIZE_ORDER[a.size] - SIZE_ORDER[b.size];
    } else if (sortState.field === "name") {
      comparison = a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    } else if (sortState.field === "group") {
      const groupA = state.groups.find((g) => g.id === a.groupId);
      const groupB = state.groups.find((g) => g.id === b.groupId);
      comparison = (groupA?.name || "").localeCompare(groupB?.name || "", "es", { sensitivity: "base" });
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/* ==========================================================================
   Render: listado de personas
   ========================================================================== */

function renderEntryList() {
  const list = document.getElementById("entryList");
  const countBadge = document.getElementById("entryCount");

  countBadge.textContent = state.entries.length;

  if (state.entries.length === 0) {
    list.innerHTML = `<li class="empty-row">Todavía no cargaste a nadie.</li>`;
    return;
  }

  const entriesToRender = getDisplayEntries();

  list.innerHTML = entriesToRender
    .map((entry) => {
      const group = state.groups.find((g) => g.id === entry.groupId);
      const groupColor = group ? group.color : "#9a9a9a";
      const groupName = group ? group.name : "Sin grupo";
      const chipBg = hexToRgba(groupColor, 0.14);

      return `
        <li class="entry-item">
          <span class="entry-name">${entry.name}</span>
          <span class="entry-size">${entry.size}</span>
          <span class="entry-group-tag" style="background:${chipBg}" title="Click para ordenar por grupo">
            <i class="fa-solid fa-shirt" style="color:${groupColor}" aria-hidden="true"></i>
            <span class="tag-label">${groupName}</span>
          </span>
          <button class="entry-remove" data-id="${entry.id}" aria-label="Quitar a ${entry.name} de la lista" title="Quitar de la lista">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </li>
      `;
    })
    .join("");
}

/* ==========================================================================
   Render: estadísticas por grupo (acá se renombran los grupos)
   ========================================================================== */

function renderStats() {
  const container = document.getElementById("statsList");

  if (state.groups.length === 0) {
    container.innerHTML = `<p class="empty-row">Sin datos todavía.</p>`;
    return;
  }

  container.innerHTML = state.groups
    .map((group) => {
      const groupEntries = state.entries.filter((e) => e.groupId === group.id);

      const chipBg = hexToRgba(group.color, 0.14);
      const isEditing = editingGroupId === group.id;

      const nameMarkup = isEditing
        ? `<input type="text" class="group-rename-input" data-group-id="${group.id}" value="${group.name}">`
        : `<span class="tag-label">${group.name}</span>`;

      // Cuenta por talle, solo mostrando los que tengan al menos 1 persona
      const sizeCounts = SIZES.map((size) => ({
        size,
        count: groupEntries.filter((e) => e.size === size).length,
      })).filter((s) => s.count > 0);

      const chips =
        sizeCounts.length > 0
          ? sizeCounts.map((s) => `<span class="stat-size-chip">${s.size}: ${s.count}</span>`).join("")
          : `<span class="stat-empty">Todavía nadie en este grupo</span>`;

      return `
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-tag" style="background:${chipBg}" data-group-id="${group.id}" title="Click para renombrar el grupo">
              <i class="fa-solid fa-shirt" style="color:${group.color}" aria-hidden="true"></i>
              ${nameMarkup}
              <i class="fa-solid fa-pen stat-tag-edit-icon" aria-hidden="true"></i>
            </span>
            <span class="stat-total">${groupEntries.length} persona${groupEntries.length === 1 ? "" : "s"}</span>
          </div>
          <div class="stat-sizes">${chips}</div>
        </div>
      `;
    })
    .join("");

  // Si hay un grupo en edición, enfocamos el input recién creado
  if (editingGroupId !== null) {
    const input = container.querySelector(`.group-rename-input[data-group-id="${editingGroupId}"]`);
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function renderAll() {
  renderEntryList();
  renderStats();
}

/* ==========================================================================
   Acciones: ordenamiento de la lista (talle / nombre / grupo, asc-desc)
   ========================================================================== */

function updateSortButtonUI() {
  const sizeBtn = document.getElementById("sortSizeBtn");
  const nameBtn = document.getElementById("sortNameBtn");
  const sizeArrow = document.getElementById("sortSizeArrow");
  const nameArrow = document.getElementById("sortNameArrow");
  const indicator = document.getElementById("activeSortIndicator");

  sizeBtn.classList.toggle("is-active", sortState.field === "size");
  nameBtn.classList.toggle("is-active", sortState.field === "name");
  sizeBtn.setAttribute("aria-pressed", String(sortState.field === "size"));
  nameBtn.setAttribute("aria-pressed", String(sortState.field === "name"));

  sizeArrow.style.visibility = sortState.field === "size" ? "visible" : "hidden";
  nameArrow.style.visibility = sortState.field === "name" ? "visible" : "hidden";

  const activeArrow = sortState.field === "size" ? sizeArrow : sortState.field === "name" ? nameArrow : null;
  if (activeArrow) {
    activeArrow.classList.toggle("fa-arrow-up", sortState.direction === "asc");
    activeArrow.classList.toggle("fa-arrow-down", sortState.direction === "desc");
  }

  // El orden por grupo no tiene botón propio (se activa clickeando la etiqueta
  // en la lista), así que se muestra en un indicador de texto aparte.
  if (sortState.field === "group") {
    indicator.textContent = sortState.direction === "asc" ? "Orden: Grupo ▲" : "Orden: Grupo ▼";
  } else {
    indicator.textContent = "";
  }
}

function handleSortClick(field) {
  if (sortState.field === field) {
    sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
  } else {
    sortState.field = field;
    sortState.direction = "asc";
  }

  updateSortButtonUI();
  renderEntryList();
}

/* ==========================================================================
   Acción: vaciar toda la lista
   ========================================================================== */

function handleClearList() {
  if (state.entries.length === 0) return;

  const confirmed = window.confirm(
    `¿Seguro que querés borrar toda la lista? Se van a eliminar ${state.entries.length} persona(s). Esta acción no se puede deshacer.`
  );

  if (!confirmed) return;

  state.entries = [];
  saveState(state);
  renderAll();
}

/* ==========================================================================
   Acciones: agregar entrada (resuelve o crea el grupo según el color elegido)
   ========================================================================== */

/**
 * Busca un grupo existente con ese color. Si no existe, crea uno nuevo
 * con nombre incremental automático ("Grupo 2", "Grupo 3", ...).
 * @param {string} color
 * @returns {number} id del grupo (existente o recién creado)
 */
function resolveGroupIdForColor(color) {
  const existing = state.groups.find((g) => g.color === color);
  if (existing) return existing.id;

  const newGroup = {
    id: state.nextGroupId,
    name: `Grupo ${state.nextGroupNumber}`,
    color,
  };

  state.groups.push(newGroup);
  state.nextGroupId += 1;
  state.nextGroupNumber += 1;

  return newGroup.id;
}

function handleAddEntry(event) {
  event.preventDefault();

  const nameInput = document.getElementById("nameInput");
  const sizeInput = document.getElementById("sizeInput");
  const colorInput = document.querySelector('input[name="groupColor"]:checked');

  const name = nameInput.value.trim();
  const size = sizeInput.value;

  if (!name || !size || !colorInput) return;

  const groupId = resolveGroupIdForColor(colorInput.value);

  state.entries.push({
    id: state.nextEntryId,
    name,
    size,
    groupId,
    createdAt: new Date().toISOString(),
  });
  state.nextEntryId += 1;

  saveState(state);
  renderAll();

  document.getElementById("entryForm").reset();
  nameInput.focus();
}

/* ==========================================================================
   Acciones sobre la lista: eliminar entrada individual / ordenar por grupo
   ========================================================================== */

function handleListClick(event) {
  const removeBtn = event.target.closest(".entry-remove");
  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    state.entries = state.entries.filter((e) => e.id !== id);
    saveState(state);
    renderAll();
    return;
  }

  const groupTag = event.target.closest(".entry-group-tag");
  if (groupTag) {
    handleSortClick("group");
  }
}

/* ==========================================================================
   Acciones: renombrar grupo (directamente en Estadísticas)
   ========================================================================== */

function handleStatsClick(event) {
  const tag = event.target.closest(".stat-tag");
  if (!tag || event.target.classList.contains("group-rename-input")) return;

  editingGroupId = Number(tag.dataset.groupId);
  renderStats();
}

function commitGroupRename(input) {
  const groupId = Number(input.dataset.groupId);
  const newName = input.value.trim();
  const group = state.groups.find((g) => g.id === groupId);

  if (group && newName) {
    group.name = newName;
  }

  editingGroupId = null;
  saveState(state);
  renderAll();
}

function handleStatsFocusOut(event) {
  if (!event.target.classList.contains("group-rename-input")) return;
  commitGroupRename(event.target);
}

function handleStatsKeydown(event) {
  if (!event.target.classList.contains("group-rename-input")) return;

  if (event.key === "Enter") {
    event.preventDefault();
    event.target.blur(); // dispara handleStatsFocusOut, que guarda
  }

  if (event.key === "Escape") {
    editingGroupId = null;
    renderStats();
  }
}

/* ==========================================================================
   Inicialización
   ========================================================================== */

function init() {
  renderAll();

  document.getElementById("entryForm").addEventListener("submit", handleAddEntry);
  document.getElementById("entryList").addEventListener("click", handleListClick);

  document.getElementById("statsList").addEventListener("click", handleStatsClick);
  document.getElementById("statsList").addEventListener("focusout", handleStatsFocusOut);
  document.getElementById("statsList").addEventListener("keydown", handleStatsKeydown);

  document.getElementById("sortSizeBtn").addEventListener("click", () => handleSortClick("size"));
  document.getElementById("sortNameBtn").addEventListener("click", () => handleSortClick("name"));
  document.getElementById("clearListBtn").addEventListener("click", handleClearList);
  updateSortButtonUI();

  document.getElementById("exportBtn").addEventListener("click", () => downloadSQLExport(state));
}

document.addEventListener("DOMContentLoaded", init);