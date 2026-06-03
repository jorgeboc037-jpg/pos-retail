# Guía Técnica — POS Retail

Esta guía explica en simple cómo está montado el sistema, qué hace cada parte, y qué hacer si algo falla.

---

## ¿Qué es este sistema?

Un punto de venta (POS) para una tienda retail familiar en Guatemala. Tiene dos partes:

- **La app que usan en la tienda** — la que abrís en el teléfono o computadora para vender
- **El servidor que guarda todo** — corre en internet las 24 horas y guarda productos, ventas, usuarios

---

## Las 3 plataformas que usamos

### 1. Vercel — la app (frontend)
- **¿Qué es?** El sitio web que el cajero y el admin usan
- **URL:** https://pos-retail-theta.vercel.app
- **Repo GitHub:** github.com/jorgeboc037-jpg/pos-retail
- **¿Cuándo se actualiza?** Automático cada vez que hacés push al repo en GitHub
- **Variable importante:** `VITE_API_URL` = la URL del backend en Railway

### 2. Railway — el servidor (backend)
- **¿Qué es?** El cerebro del sistema. Recibe el login, guarda ventas, controla permisos
- **URL:** https://pos-backend-production-483f.up.railway.app
- **Repo GitHub:** github.com/jorgeboc037-jpg/pos-backend (privado)
- **¿Cuándo se actualiza?** Automático cada vez que hacés push al repo en GitHub
- **Para verificar que está vivo:** abrí https://pos-backend-production-483f.up.railway.app/health — debe mostrar `{"ok":true}`

### 3. Supabase — la base de datos
- **¿Qué es?** Donde se guardan todos los datos: usuarios, productos, ventas, inventario
- **Cuenta:** jorgedanielboc@gmail.com
- **Proyecto:** "POS Retail"
- **No tocás nada aquí** a menos que haya un problema grave

---

## Variables de entorno — qué son y por qué importan

Las "variables de entorno" son configuraciones secretas que el servidor necesita para funcionar. Son como contraseñas de configuración. Nunca van en el código directamente.

### En Railway (backend):
| Variable | Para qué sirve |
|---|---|
| `SUPABASE_URL` | La dirección de tu base de datos |
| `SUPABASE_SERVICE_KEY` | La llave para que el servidor acceda a la DB |
| `JWT_SECRET` | Firma los tokens de sesión de los usuarios |
| `NODE_ENV` | Le dice al servidor que está en producción (no en desarrollo) |
| `FRONTEND_URL` | Le dice al servidor desde qué dominio puede recibir requests (seguridad CORS) |

### En Vercel (frontend):
| Variable | Para qué sirve |
|---|---|
| `VITE_API_URL` | Le dice a la app dónde está el servidor |

---

## Usuarios del sistema

Hay dos roles:

- **ADMIN** — acceso total (vos y tu mamá)
- **CAJERO** — solo puede usar el POS para vender

### Cómo crear usuarios:
1. Entrás con tu cuenta admin
2. Vas a la sección "Usuarios"
3. Le das "Nuevo" y llenás nombre, username, contraseña y rol

### Usuario inicial:
- Username: `admin`
- Password: `admin123`
- **Cambialo apenas podás**

---

## Qué hacer si algo falla

### "La app no carga"
→ Revisá que Vercel esté bien en vercel.com. Si el deploy falló, redeploy.

### "No puedo hacer login / error de red"
→ Primero verificá que el backend esté vivo: abrí https://pos-backend-production-483f.up.railway.app/health
- Si responde `{"ok":true}` → el problema es CORS, revisá que `FRONTEND_URL` en Railway sea exactamente `https://pos-retail-theta.vercel.app`
- Si no responde → el servidor cayó, revisá Railway y redeploy

### "El servidor cayó en Railway"
1. Entrás a railway.app
2. Abrís el proyecto → pos-backend
3. Revisás los logs en la pestaña "Deployments"
4. Si hay error, buscás el mensaje y lo mandás a quien te ayuda

### "Perdí una variable de entorno"
- Las variables de Railway están en: Railway → pos-backend → Variables
- Las variables de Vercel están en: Vercel → pos-retail → Settings → Environment Variables

---

## El flujo completo cuando alguien vende algo

1. El cajero abre la app en el teléfono
2. La app le pide login → manda usuario y contraseña al servidor en Railway
3. Railway verifica en Supabase que el usuario existe → devuelve un token de sesión
4. El cajero busca productos → Railway los trae de Supabase
5. El cajero hace la venta → Railway guarda la transacción en Supabase
6. Todo queda registrado con fecha, hora, cajero y detalle

---

## GitHub — los repositorios

| Repo | Qué contiene | Visibilidad |
|---|---|---|
| github.com/jorgeboc037-jpg/pos-retail | La app (frontend) | Público |
| github.com/jorgeboc037-jpg/pos-backend | El servidor | Privado |

**Regla:** nunca subás el archivo `.env` a GitHub. Ese archivo tiene las llaves secretas y está bloqueado por `.gitignore`.
