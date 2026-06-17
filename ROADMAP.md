# Roadmap — POS Retail

## Completado

### Fase 1
- Login con roles ADMIN / CAJERO
- Registro de ventas (POS) con escáner de código de barras
- Módulo de gastos
- Reportes con export a PDF / Excel
- Protección de rutas admin

### Fase 2
- Cierre de caja (apertura/resumen del día, diferencia de efectivo)
- Libro de compras (proveedor, NIT, número de factura)
- Información del negocio, cambio de contraseña
- Borrar cierre con verificación de contraseña admin

### Fase 3
- Inventario completo: Catálogo, Ajustes (positivo/negativo), Kardex
- Compras con líneas de producto vía RPC atómica (stock + kardex)
- Costo promedio congelado por venta
- Permisos refinados: CAJERO ve Reportes/Config con vista limitada

## Fase 4 — candidatas (sin decidir)

No hay registro escrito de qué se planeó para esta fase. Recuperado de
memoria parcial en sesión de chat (2026-06-17):

- **Fotos de producto** — agregar imagen al catálogo (Supabase Storage
  es la opción obvia ya que la DB ya vive ahí).
- **Sección financiera** — ampliar Reportes más allá de Resumen/Caja:
  posibles candidatos son márgenes por producto, tendencias, flujo de
  caja.
- **Algo más "crítico"** — Jorge recordó que había una tercera prioridad
  más importante que las dos anteriores, pero no logró recordar cuál.
  Pendiente de definir.

Actualizar esta sección en cuanto se decida el alcance real de Fase 4.
