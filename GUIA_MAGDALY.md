# Guía de uso — Detalles Kairos
### Sistema POS Retail

---

## ¿Quién usa qué?

El sistema tiene dos tipos de usuario:

| | Magdaly (ADMIN) | Ayudante (CAJERO) |
|---|---|---|
| Registrar ventas | ✓ | ✓ |
| Registrar gastos | ✓ | ✓ |
| Cerrar caja al final del día | ✓ | ✓ |
| Ver reportes | ✓ | ✓ |
| Agregar productos | ✓ | — |
| Registrar compras de mercancía | ✓ | — |
| Ajustar inventario | ✓ | — |
| Gestionar usuarios | ✓ | — |

---

## Cómo entrar al sistema

1. Abra el navegador y vaya a: **pos-retail-theta.vercel.app**
2. Escriba su **usuario** y su **contraseña**
3. Toque **Ingresar**

> Si olvidó su contraseña, llame a Jorge para que se la restablezca.

> Si el sistema le pide entrar de nuevo, es porque pasó mucho tiempo o se cerró el navegador. Solo vuelva a poner su usuario y contraseña.

---

## Las secciones del sistema

**El ayudante (CAJERO) ve 3 botones abajo:**

| Botón | Para qué sirve |
|---|---|
| **POS** | Registrar ventas |
| **Reportes** | Ver ventas, registrar gastos |
| **Config** | Cerrar caja, cambiar contraseña |

**Magdaly (ADMIN) ve 5 botones abajo:**

| Botón | Para qué sirve |
|---|---|
| **POS** | Registrar ventas |
| **Inventario** | Ver productos, ajustar cantidades |
| **Compras** | Registrar mercancía que llegó |
| **Reportes** | Ver ventas, gastos, utilidades |
| **Config** | Cerrar caja, usuarios, configuración |

---

## 1. Cómo hacer una venta (POS)

Esto es lo que van a hacer la mayor parte del día.

1. Toque **POS** (abajo a la izquierda)
2. Busque el producto:
   - Escriba el nombre en el cuadro de búsqueda, o
   - Toque el ícono del escáner y escanee el código de barras del producto
3. Toque el botón **+** para agregar el producto al carrito
4. Repita para cada producto que lleva el cliente
5. Toque el botón verde **Cobrar**
6. Elija cómo paga el cliente: **Efectivo**, **Tarjeta** o **Transferencia**
7. Si paga en efectivo, escriba cuánto le dio — el sistema calcula el cambio solo
8. Toque **Confirmar cobro**
9. Aparece el comprobante. Toque **Nueva venta** para empezar de nuevo

**¿Quiere poner más de una unidad del mismo producto?**
Toque **+** varias veces, o use los botones + y − que aparecen cuando ya está en el carrito.

**¿Se equivocó con el precio?**
En el carrito, toque el precio del producto para cambiarlo.

**¿Quiere quitar un producto del carrito?**
Toque el ícono de basura al lado del producto.

**¿El producto no tiene código de barras o quiere poner un precio especial?**
Use la opción **Producto libre / precio especial** que aparece debajo del buscador.

**¿Se equivocó en una venta ya cobrada?**
Vaya a Reportes → Ventas → toque el ícono de basura rojo al lado de esa venta.

---

## 2. Cómo registrar un gasto

Use esto para anotar cualquier pago del negocio: alquiler, luz, agua, pago a empleados, compra de bolsas, etc.

> Esto NO es para registrar mercancía que llegó. Para eso use el módulo Compras (solo Magdaly).

1. Toque **Reportes** (abajo)
2. Toque la pestaña **Gastos**
3. Toque el botón **+ Nuevo**
4. Llene:
   - **Descripción**: qué fue el gasto (ej: "Pago de luz")
   - **Monto**: cuánto pagó
   - **Categoría**: el tipo de gasto
   - **Fecha**: el día del gasto (ya viene con hoy)
5. Toque **Guardar**

---

## 3. Cómo hacer el cierre de caja (al final del día)

Haga esto cuando cierre el negocio. Sirve para comparar el dinero que debería haber en la caja contra lo que hay físicamente.

1. Toque **Config** (abajo a la derecha)
2. Toque **Cerrar Caja**
3. El sistema muestra el resumen del día: ventas, gastos y utilidad
4. Cuente el dinero en efectivo que tiene físicamente en la caja
5. Escriba ese monto en **Efectivo contado**
6. El sistema calcula automáticamente si sobra o falta dinero
7. Si quiere, escriba una nota (ej: "Se encontraron Q5 de más")
8. Toque **Cerrar Caja**

El sistema guarda el cierre. Magdaly puede consultarlo en Reportes → Caja.

> Solo se puede hacer un cierre por día. Si necesita corregirlo, llame a Jorge.

---

## 4. Cómo registrar una compra de mercancía (solo Magdaly)

Cada vez que llega mercancía de un proveedor, regístrela aquí. Esto actualiza el inventario automáticamente.

1. Toque **Compras** (abajo)
2. Toque **Nueva compra** (arriba a la derecha)
3. Llene los datos:
   - **Fecha**: el día que llegó la mercancía
   - **Proveedor**: el nombre de quien le vendió
   - **NIT del proveedor**: está en la factura. Si no tiene, déjelo vacío
   - **N° de factura**: el número de la factura. Si no tiene, déjelo vacío
4. Toque **Siguiente**
5. Agregue los productos que llegaron:
   - Busque el producto por nombre o escanee su código de barras
   - Tóquelo para seleccionarlo
   - Escriba la **cantidad** que llegó y el **costo** que pagó por cada uno
   - Toque **Agregar**
   - Repita con cada producto
6. Toque **Guardar compra**

El inventario se actualiza solo.

---

## 5. Cómo cargar el inventario por primera vez (solo Magdaly)

Esto se hace **una sola vez** al iniciar el sistema. La tienda tiene mercancía pero el sistema todavía no sabe nada. Hay que registrar cada producto y luego decirle cuántas unidades hay.

**Antes de empezar, tenga a la mano para cada producto:**
- El nombre del producto
- El precio de venta
- Cuántas unidades tiene físicamente
- El código de barras (si tiene)

**Para cada producto, haga estos dos pasos:**

**Paso 1 — Crear el producto:**

1. Toque **Inventario** (abajo) → pestaña **Catálogo**
2. Toque **Nuevo producto**
3. Escriba el nombre y espere a que el sistema busque si ya existe
4. Si no existe, llene:
   - **Nombre** del producto
   - **Precio** de venta
   - **Código de barras** (si tiene) — puede escanearlo
   - **Categoría** (opcional, ej: "Peluches", "Bisutería")
5. Toque **Guardar**

**Paso 2 — Poner la cantidad que tiene:**

1. Toque la pestaña **Ajustes**
2. Toque **Nuevo ajuste**
3. Busque el producto que acaba de crear
4. Elija **Sumar unidades**
5. Escriba cuántas unidades tiene físicamente
6. En **Motivo** escriba: `Inventario inicial`
7. Toque **Guardar**

Repita estos dos pasos con cada producto.

> **Consejo:** Si tiene muchos productos, trabaje por sección de la tienda. Por ejemplo: primero todos los peluches, luego todos los llaveros. Así es más fácil y no se pierde.

> El sistema le asigna un código interno (SKU) automáticamente. No tiene que escribirlo.

---

## 6. Cómo agregar un producto nuevo (solo Magdaly)

Cuando llega un producto que nunca ha tenido:

1. Toque **Inventario** (abajo) → pestaña **Catálogo**
2. Toque el botón **Nuevo producto**
3. El sistema le pedirá que busque primero si ya existe. Escriba el nombre y espere
4. Si no existe, llene los datos:
   - **Nombre** del producto
   - **Precio** de venta
   - **Código de barras** (si tiene) — puede escanearlo directamente
   - **Categoría** (opcional)
5. Toque **Guardar**
6. Después registre la compra en el módulo **Compras** — eso actualiza el inventario solo.

> El sistema le asigna un código interno (SKU) automáticamente. No tiene que escribirlo.

---

## 7. Cómo usar los ajustes de inventario (solo Magdaly)

Los ajustes sirven para tres situaciones:

- **Inventario inicial** — cuando cargó la tienda por primera vez (ver sección 5).
- **Conteo físico** — cuenta la tienda y el número no coincide con lo que dice el sistema. Por ejemplo: el sistema dice 10 peluches pero físicamente hay 8. Se restan 2.
- **Corrección de error** — se registró mal una compra o se cometió un error en algún ajuste anterior.

**Cómo hacer un ajuste:**

1. Toque **Inventario** → pestaña **Ajustes**
2. Toque **Nuevo ajuste**
3. Busque el producto
4. Elija:
   - **Sumar unidades** si el sistema tiene menos de lo que hay físicamente
   - **Restar unidades** si el sistema tiene más de lo que hay físicamente
5. Escriba cuántas unidades y el motivo (ej: "Conteo físico", "Inventario inicial", "Error en compra")
6. Toque **Guardar**

> **Consejo:** Haga un conteo físico de vez en cuando — una vez al mes está bien. Así detecta pérdidas o errores antes de que se acumulen.

---

## 8. Cómo ver los reportes (Magdaly ve todo, el ayudante ve ventas y gastos)

1. Toque **Reportes** (abajo)
2. Elija el período: **Hoy**, **Esta semana**, **Este mes**, o fechas específicas
3. Navegue entre las pestañas:
   - **Ventas**: todo lo que se vendió — con gráfico y lista
   - **Gastos**: todos los gastos registrados
   - **Compras** *(solo Magdaly)*: las compras de mercancía
   - **Resumen**: cuánto entró, cuánto se gastó y cuánto se ganó
   - **Caja**: historial de cierres de caja

**Para descargar el reporte:**
Toque **PDF** o **Excel** arriba a la derecha. El PDF se puede compartir por WhatsApp.

---

## 9. Cómo cambiar su contraseña

1. Toque **Config** (abajo a la derecha)
2. Toque **Cambiar contraseña**
3. Escriba su contraseña actual y la nueva dos veces
4. Toque **Guardar**

---

## Cosas importantes

**El sistema descuenta el inventario solo** cada vez que se registra una venta. No hay que hacer nada extra.

**Si vende algo y el sistema dice que no hay stock**, registre primero una compra con esa mercancía, o llame a Jorge.

**El sistema no guarda nada en el celular.** Todo está en internet. Si cambia de celular, solo vuelva a entrar con su usuario y contraseña.

**Si el sistema no abre o da error**, ciérrelo y vuelva a entrar. Si el problema sigue, llame a Jorge.

---

## Resumen del día a día

### El ayudante (CAJERO)

| Momento | Qué hace |
|---|---|
| Al abrir el negocio | Entra con su usuario y contraseña |
| Cuando vende | POS → busca el producto → Cobrar |
| Cuando paga algo del negocio | Reportes → Gastos → + Nuevo |
| Al cerrar el negocio | Config → Cerrar Caja |

### Magdaly (ADMIN)

| Momento | Qué hace |
|---|---|
| Al abrir el negocio | Entra con su usuario y contraseña |
| Cuando vende | POS → busca el producto → Cobrar |
| Cuando paga algo del negocio | Reportes → Gastos → + Nuevo |
| Cuando llega mercancía | Compras → Nueva compra |
| Al cerrar el negocio | Config → Cerrar Caja |
| Cuando quiere ver cómo va el negocio | Reportes → Resumen |

---

*Guía preparada por Jorge — cualquier duda llámeme.*
