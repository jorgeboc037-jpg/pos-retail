# Design System — POS Retail Guatemala

## Theme

Dark mode por defecto. La dueña usa el teléfono en tienda bajo luz fluorescente durante horas. El dark mode reduce fatiga visual y hace que los números en blanco resalten contra el fondo oscuro.

No se ofrece toggle de tema en Fase 1.

## Color Palette

Estrategia: **Committed** — el surface oscuro lleva el 60% del espacio. Un solo acento funcional (verde) para acciones de confirmación.

```css
:root {
  /* Surfaces */
  --color-bg:         oklch(13% 0.008 250);   /* fondo principal */
  --color-surface:    oklch(19% 0.008 250);   /* cards, panels */
  --color-surface-2:  oklch(24% 0.008 250);   /* inputs, hover */

  /* Texto */
  --color-text:       oklch(94% 0.005 250);   /* texto principal */
  --color-text-muted: oklch(60% 0.008 250);   /* labels, subtítulos */
  --color-text-dim:   oklch(44% 0.008 250);   /* placeholders */

  /* Acento principal — verde esmeralda (Cobrar, Guardar, Confirmar) */
  --color-primary:    oklch(72% 0.17 145);
  --color-primary-fg: oklch(98% 0.005 145);

  /* Acento cálido — naranja (alertas, stock bajo) */
  --color-warning:    oklch(78% 0.16 55);
  --color-warning-fg: oklch(13% 0.008 250);

  /* Destructivo — rojo (eliminar, cancelar) */
  --color-danger:     oklch(62% 0.20 25);
  --color-danger-fg:  oklch(98% 0.005 25);

  /* Bordes */
  --color-border:     oklch(28% 0.008 250);
  --color-border-dim: oklch(22% 0.008 250);
}
```

## Typography

**Fuente:** Inter (misma que Claude — máxima legibilidad en pantallas de baja resolución).

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body { font-family: 'Inter', system-ui, sans-serif; }
```

**Escala:**
| Token | Size | Weight | Uso |
|---|---|---|---|
| `text-xs` | 12px | 400 | Timestamps, metadata |
| `text-sm` | 14px | 400/500 | Labels secundarios |
| `text-base` | 16px | 400 | Body, inputs |
| `text-lg` | 18px | 500 | Items de lista |
| `text-xl` | 20px | 600 | Subtítulos de sección |
| `text-2xl` | 24px | 700 | Títulos de página |
| `text-3xl` | 30px | 700 | Totales en POS |
| `text-4xl` | 36px | 700 | Total final de cobro |

**Números:** siempre `font-variant-numeric: tabular-nums` en precios, totales y cantidades.

## Spacing

Sistema 4/8dp. Tailwind base.

| Token | Value | Uso |
|---|---|---|
| `p-2` | 8px | Padding interno de badges |
| `p-3` | 12px | Padding de inputs |
| `p-4` | 16px | Padding de cards pequeñas |
| `p-5` | 20px | Padding estándar de secciones |
| `p-6` | 24px | Padding de modales |
| `gap-3` | 12px | Espacio entre items de lista |
| `gap-4` | 16px | Espacio entre secciones |

## Touch Targets

Mínimo absoluto: **52px de altura** en todos los elementos interactivos (por encima del estándar de 44px).

```css
.btn { min-height: 52px; }
.input { min-height: 52px; }
.list-item { min-height: 60px; }
.bottom-nav-item { min-height: 56px; min-width: 56px; }
```

`touch-action: manipulation` en toda la app para eliminar el delay de 300ms.

## Components

### Button
- Primary: bg `--color-primary`, texto `--color-primary-fg`, sin sombra
- Danger: bg `--color-danger`
- Ghost: sin fondo, borde `--color-border`
- Tamaño mínimo: `h-[52px] px-5 rounded-xl font-semibold`
- Estado pressed: `scale(0.97)` con `transition: transform 100ms ease-out`

### Card / Panel
- Background: `--color-surface`
- Border: `1px solid var(--color-border)` — sin sombra (box-shadow = GPU load)
- Border-radius: `rounded-xl` (12px)
- Sin glassmorphism, sin backdrop-filter

### Input
- Background: `--color-surface-2`
- Border: `1px solid var(--color-border)`
- Focus: border cambia a `--color-primary`
- Height: 52px mínimo
- Label siempre visible arriba (nunca solo placeholder)

### Badge
- Stock bajo: bg naranja `--color-warning`, texto oscuro
- Activo: bg verde `--color-primary`
- Inactivo: bg `--color-surface-2`, texto muted

### Bottom Navigation
- 4 items: POS / Productos / Reportes / Config
- Height: 64px + safe area inset
- Item activo: ícono + label en `--color-primary`
- Item inactivo: ícono + label en `--color-text-muted`
- Sin background blur — fondo sólido `--color-surface`

### Toast
- Posición: top-center (no bloquea el carrito abajo)
- Auto-dismiss: 3 segundos
- Sin animaciones complejas — fade + translate simple

## Motion

App corre en dispositivos de gama muy baja. Reglas estrictas:

- Solo `transform` y `opacity` — nunca `width`, `height`, `top`, `left`
- Duración máxima: 200ms
- Easing: `ease-out` para entrar, `ease-in` para salir
- Sin spring physics, sin bounce
- Respetar `prefers-reduced-motion: reduce`
- Sin animaciones de entrada en listas (stagger deshabilitado)

## Icons

Lucide React — trazo 1.5px, tamaño estándar 20px en nav / 24px en acciones.
Sin emojis como íconos funcionales.

## Anti-patterns (para este proyecto)

- `backdrop-filter: blur()` — PROHIBIDO
- `box-shadow` con blur > 4px — evitar
- Gradientes complejos (`from-X via-Y to-Z`) — evitar
- Animaciones en listas
- Nested cards
- Side-stripe borders (`border-left` colored)
- Gradient text
- Modal como primera solución (explorar inline primero)
