import { create } from 'zustand'
import { api } from '../services/api'

export const useStore = create((set, get) => ({
  // Auth
  usuario: null,
  cargandoAuth: true,

  verificarSesion: async () => {
    try {
      const usuario = await api.get('/api/auth/me')
      set({ usuario, cargandoAuth: false })
    } catch {
      set({ usuario: null, cargandoAuth: false })
    }
  },

  login: async (username, password) => {
    const usuario = await api.post('/api/auth/login', { username, password })
    set({ usuario })
  },

  logout: async () => {
    try { await api.post('/api/auth/logout', {}) } catch {}
    set({ usuario: null, carrito: [] })
  },

  // Carrito POS
  carrito: [],

  agregarAlCarrito: (producto) => {
    const { carrito } = get()
    const existente = carrito.find((i) => i.id === producto.id && !i.esLibre)
    if (existente) {
      set({ carrito: carrito.map((i) => i.id === producto.id && !i.esLibre ? { ...i, cantidad: i.cantidad + 1 } : i) })
    } else {
      set({ carrito: [...carrito, { ...producto, cantidad: 1, precioEditado: null }] })
    }
  },

  quitarDelCarrito: (id) => {
    const { carrito } = get()
    const item = carrito.find((i) => i.id === id && !i.esLibre)
    if (!item) return
    if (item.cantidad > 1) {
      set({ carrito: carrito.map((i) => i.id === id && !i.esLibre ? { ...i, cantidad: i.cantidad - 1 } : i) })
    } else {
      set({ carrito: carrito.filter((i) => !(i.id === id && !i.esLibre)) })
    }
  },

  eliminarDelCarrito: (id) =>
    set({ carrito: get().carrito.filter((i) => i.id !== id) }),

  eliminarPorIndice: (idx) =>
    set({ carrito: get().carrito.filter((_, i) => i !== idx) }),

  editarPrecio: (idx, nuevoPrecio) =>
    set({
      carrito: get().carrito.map((item, i) =>
        i === idx ? { ...item, precioEditado: nuevoPrecio } : item
      ),
    }),

  vaciarCarrito: () => set({ carrito: [] }),

  totalCarrito: () =>
    get().carrito.reduce(
      (sum, i) => sum + (i.precioEditado ?? i.precio) * i.cantidad,
      0
    ),
}))
