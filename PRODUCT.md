# Product

## Register

product

## Users

Dueña del negocio familiar en Guatemala, usuaria no técnica. Usa el teléfono Android de gama baja instalado como PWA. Opera en la tienda bajo luz artificial todo el día procesando ventas, revisando stock y consultando reportes. No tiene experiencia con software de punto de venta. Necesita que cada acción se complete en 2 taps o menos.

## Product Purpose

POS web (PWA) para punto de venta, control de inventario y reportes básicos. Reemplaza el registro manual o la hoja de Excel. El éxito se mide en: venta procesada en menos de 30 segundos, cero errores por confusión de interfaz, funcionamiento fluido en dispositivos de gama baja.

## Brand Personality

Confiable, directo, accesible. Como WhatsApp: todo está donde esperás que esté. No intimida. No se ve como software de banco ni como dashboard corporativo.

## Anti-references

- Dashboards corporativos genéricos con gráficas azul marino que nadie entiende
- Apps bancarias frías y rígidas que parecen que vas a cometer un error en cada click
- Hojas de Excel / sistemas viejos con tablas de borde gris y texto pequeño
- Glassmorphism, blur effects, gradients pesados — la app corre en teléfonos de gama muy baja

## Design Principles

1. **2 taps máximo** — Cualquier acción crítica (cobrar, agregar producto, registrar ingreso) debe completarse en dos toques desde la pantalla principal.
2. **Los números mandan** — Precios, totales y cantidades deben ser el elemento más visible en cualquier pantalla. Jerarquía tipográfica extrema.
3. **Flat funcional** — Sin efectos de GPU (blur, backdrop-filter, gradients complejos). El dispositivo tiene que respirar.
4. **Feedback inmediato** — Cada acción tiene respuesta visual en menos de 100ms. Nada queda en el aire.
5. **Cero ambigüedad** — Labels claros, estados explícitos (vacío, cargando, error, éxito). Nunca dejar a la usuaria adivinando qué pasó.

## Accessibility & Inclusion

WCAG AA mínimo. Touch targets mínimo 52px (por encima del estándar de 44px, para uso con dedos en caja). Fuente mínima 16px. Sin dependencia de color como único indicador de estado (siempre ícono + color).
