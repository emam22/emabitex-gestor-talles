# emabitex — gestor de talles por grupo

Proyecto de portfolio: una app para armar listas de personas con su talle de indumentaria, agrupadas por color, con estadísticas en vivo y exportación directa a **MySQL**. Construida con **HTML, CSS y JavaScript puro**, sin frameworks ni backend — todo corre en el navegador y persiste en `localStorage`.

## Funcionalidades

- Alta de personas: nombre + talle (XS a 3XL) + grupo.
- Grupos identificados por color: el primer grupo ("GRUPO") toma **gris pizarra** por defecto; cada grupo nuevo toma automáticamente el siguiente color disponible de una paleta fija de 10 tonos, y el usuario le pone el nombre que quiera.
- Listado a la izquierda, con etiqueta de color por persona.
- Estadísticas por grupo (a la derecha, debajo del formulario): cantidad de personas y desglose por talle, mostrando solo los talles que tengan al menos una persona cargada.
- Exportación a `.sql`: genera un archivo con `CREATE TABLE` (para `grupos` y `prendas`, con clave foránea entre ambas) + los `INSERT` correspondientes, listo para importar en MySQL.
- Persistencia automática en `localStorage`: no se pierde nada al recargar la página.

## Paleta de grupos

Los 10 colores fueron tomados de una referencia real de prendas, para que las etiquetas se vean naturales y no como colores "de sistema":

| # | Color | Hex |
|---|---|---|
| 1 (default) | Gris pizarra | `#565F6B` |
| 2 | Gris claro | `#ADACA5` |
| 3 | Azul acero | `#6F93B5` |
| 4 | Rojo | `#C0263B` |
| 5 | Blanco hueso | `#F1EFE8` |
| 6 | Negro | `#1C1C1E` |
| 7 | Azul eléctrico | `#2A4FC4` |
| 8 | Navy | `#1B2740` |
| 9 | Verde bosque | `#33473C` |
| 10 | Beige arena | `#C9AB7C` |

## Modelo de datos (para MySQL)

```sql
CREATE TABLE grupos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7) NOT NULL
);

CREATE TABLE prendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  talle ENUM('XS','S','M','L','XL','2XL','3XL') NOT NULL,
  grupo_id INT NOT NULL,
  creado_en DATETIME NOT NULL,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id)
);
```

## Cómo importar el export en MySQL

```bash
mysql -u tu_usuario -p tu_base_de_datos < emabitex-talles-2026-08-05.sql
```

Esto crea ambas tablas (si no existían) y carga los datos tal como estaban en el navegador al momento de exportar.

## Stack

- HTML5 semántico
- CSS3 (variables, Grid, Flexbox) — estética sutil y neutra, el color vive solo en las etiquetas de grupo
- JavaScript (ES6+, `localStorage`, generación de archivos con `Blob` + `URL.createObjectURL`)

## Estructura del proyecto

```
emabitex/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── palette.js   → paleta de 10 colores + helper de contraste de texto
│   ├── storage.js   → persistencia en localStorage
│   ├── export.js    → generación y descarga del archivo .sql
│   └── app.js        → orquestación: alta, borrado, grupos, estadísticas
├── img/
│   └── logoEM.png   → ⚠️ agregar antes de subir el repo (ver img/README.md)
└── README.md
```

> ⚠️ **Importante:** el archivo `img/logoEM.png` no viene incluido en este export — hay que agregarlo a mano en esa carpeta antes de subir el repo, porque es un logo personal. Se usa como favicon (`<head>`) y en el header del `<body>`, al lado del nombre "emabitex".

## Cómo correrlo localmente

Abrí `index.html` directamente en el navegador. No necesita servidor ni build.

---

## Plan de desarrollo (etapas de commits)

1. **`chore: estructura inicial del proyecto`**
   Carpetas (`css/`, `js/`, `img/`), `.gitignore`, `README.md`.

2. **`feat: estructura HTML (header, lista, formulario, estadísticas)`**
   `index.html` completo con el layout de dos columnas.

3. **`style: identidad visual sutil`**
   `css/style.css`: paleta neutra de la interfaz, layout responsive.

4. **`feat: paleta de colores de grupo y persistencia`**
   `js/palette.js` + `js/storage.js`.

5. **`feat: alta y borrado de personas en la lista`**
   Lógica principal en `js/app.js`: formulario, render del listado.

6. **`feat: creación de grupos nuevos con color automático`**
   Lógica de `newGroupBox` dentro de `js/app.js`.

7. **`feat: estadísticas por grupo y talle`**
   Render de `statsList` en `js/app.js`.

8. **`feat: exportación a SQL para MySQL`**
   `js/export.js`: generación del archivo `.sql` con `CREATE TABLE` + `INSERT`.

9. **`docs: README final`**
   Documentación completa, incluida la nota sobre `logoEM.png`.

---

## Autor

**Emanuel Mendez** 🇦🇷
