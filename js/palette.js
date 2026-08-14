/**
 * palette.js
 * Paleta fija de 10 colores para identificar grupos, tomados de una
 * referencia de 10 prendas reales. El gris pizarra queda primero porque
 * es el color por defecto del primer grupo ("GRUPO").
 */

const GROUP_PALETTE = [
  { hex: "#565F6B", label: "Gris pizarra" },
  { hex: "#ADACA5", label: "Gris claro" },
  { hex: "#6F93B5", label: "Azul acero" },
  { hex: "#C0263B", label: "Rojo" },
  { hex: "#F1EFE8", label: "Blanco hueso" },
  { hex: "#1C1C1E", label: "Negro" },
  { hex: "#2A4FC4", label: "Azul eléctrico" },
  { hex: "#1B2740", label: "Navy" },
  { hex: "#33473C", label: "Verde bosque" },
  { hex: "#C9AB7C", label: "Beige arena" },
];

/**
 * Calcula si conviene texto claro u oscuro sobre un color de fondo,
 * usando luminancia relativa simple (para que las etiquetas siempre
 * se lean bien, sin importar cuán claro u oscuro sea el color de grupo).
 * @param {string} hex
 * @returns {"#1c1c1e"|"#f5f5f3"} color de texto sugerido
 */
function getContrastText(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1c1c1e" : "#f5f5f3";
}

/**
 * Convierte un color hex a rgba con la opacidad indicada. Se usa para
 * los chips de grupo: un tinte suave del color de grupo como fondo,
 * manteniendo el ícono de remera con el color sólido.
 * @param {string} hex
 * @param {number} alpha - 0 a 1
 * @returns {string} ej: "rgba(86, 95, 107, 0.12)"
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
