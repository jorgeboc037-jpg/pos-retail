export const USUARIO_DUMMY = {
  id: 1,
  nombre: 'María López',
  email: 'admin@negocio.gt',
  rol: 'ADMIN',
}

export const PRODUCTOS = [
  { id: 1, codigo: '7401051014890', nombre: 'Coca-Cola 600ml', precio: 8.50, stock: 48, categoria: 'Bebidas', imagen: null },
  { id: 2, codigo: '7501025423671', nombre: 'Arroz Diana 1lb', precio: 4.25, stock: 3, categoria: 'Granos', imagen: null },
  { id: 3, codigo: '7501031310426', nombre: 'Aceite Ideal 1L', precio: 18.00, stock: 12, categoria: 'Aceites', imagen: null },
  { id: 4, codigo: '7501234567890', nombre: 'Frijol negro 1lb', precio: 5.50, stock: 2, categoria: 'Granos', imagen: null },
  { id: 5, codigo: '7502234501234', nombre: 'Azúcar 1lb', precio: 3.75, stock: 20, categoria: 'Básicos', imagen: null },
  { id: 6, codigo: '7501055300051', nombre: 'Leche entera 1L', precio: 12.00, stock: 8, categoria: 'Lácteos', imagen: null },
  { id: 7, codigo: '7502001234567', nombre: 'Pan molde grande', precio: 14.50, stock: 5, categoria: 'Panadería', imagen: null },
  { id: 8, codigo: '7501006541236', nombre: 'Jabón de bañarse', precio: 6.00, stock: 15, categoria: 'Higiene', imagen: null },
  { id: 9, codigo: '7503012345678', nombre: 'Sal yodada 500g', precio: 2.50, stock: 30, categoria: 'Básicos', imagen: null },
  { id: 10, codigo: '7401051014907', nombre: 'Pepsi 600ml', precio: 8.00, stock: 0, categoria: 'Bebidas', imagen: null },
]

export const TRANSACCIONES = [
  {
    id: 1001,
    fecha: new Date(Date.now() - 1000 * 60 * 15),
    total: 26.75,
    metodo: 'Efectivo',
    items: [
      { nombre: 'Coca-Cola 600ml', cantidad: 2, precio: 8.50 },
      { nombre: 'Arroz Diana 1lb', cantidad: 2, precio: 4.25 },
      { nombre: 'Sal yodada 500g', cantidad: 1, precio: 2.50 },
    ],
  },
  {
    id: 1002,
    fecha: new Date(Date.now() - 1000 * 60 * 45),
    total: 18.00,
    metodo: 'Transferencia',
    items: [
      { nombre: 'Aceite Ideal 1L', cantidad: 1, precio: 18.00 },
    ],
  },
  {
    id: 1003,
    fecha: new Date(Date.now() - 1000 * 60 * 120),
    total: 44.50,
    metodo: 'Tarjeta',
    items: [
      { nombre: 'Leche entera 1L', cantidad: 2, precio: 12.00 },
      { nombre: 'Pan molde grande', cantidad: 1, precio: 14.50 },
      { nombre: 'Jabón de bañarse', cantidad: 1, precio: 6.00 },
    ],
  },
]

export const VENTAS_7_DIAS = [
  { dia: 'Lun', ventas: 320.50 },
  { dia: 'Mar', ventas: 418.00 },
  { dia: 'Mié', ventas: 290.75 },
  { dia: 'Jue', ventas: 520.00 },
  { dia: 'Vie', ventas: 680.25 },
  { dia: 'Sáb', ventas: 890.00 },
  { dia: 'Hoy', ventas: 89.25 },
]

export const INGRESOS_INVENTARIO = [
  { id: 1, fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), producto: 'Coca-Cola 600ml', cantidad: 50, costo: 6.00, total: 300.00, proveedor: 'Distribuidora Central' },
  { id: 2, fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), producto: 'Aceite Ideal 1L', cantidad: 24, costo: 14.00, total: 336.00, proveedor: 'Unilever GT' },
  { id: 3, fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), producto: 'Arroz Diana 1lb', cantidad: 100, costo: 3.20, total: 320.00, proveedor: 'Industrias Diana' },
]

export const USUARIOS = [
  { id: 1, nombre: 'María López', email: 'admin@negocio.gt', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Pedro García', email: 'cajero@negocio.gt', rol: 'CAJERO', activo: true },
  { id: 3, nombre: 'Ana Pérez', email: 'inventario@negocio.gt', rol: 'INVENTARIO', activo: false },
]

export const formatQ = (num) =>
  `Q${Number(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

export const formatFecha = (fecha) => {
  const d = new Date(fecha)
  const ahora = new Date()
  const diff = Math.floor((ahora - d) / 60000)
  if (diff < 1) return 'Ahora mismo'
  if (diff < 60) return `Hace ${diff} min`
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })
}
