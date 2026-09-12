# TechStore - E-Commerce Frontend

Tienda en linea de productos tecnologicos construida con React e InsForge.

## Description

Aplicacion SPA para una tienda de tecnología con catálogo de productos, carrito de compras, flujo de checkout, historial de pedidos y panel de administración completo.

### Funcionalidades

- **Catálogo**: listado de productos con búsqueda y filtro por categoría
- **Detalle de producto**: información, specs y imágenes
- **Carrito**: agregar, modificar cantidad, eliminar items
- **Checkout**: formulario de envío y método de pago (sin procesamiento de pago real)
- **Pedidos**: confirmación, historial y gestión de estado
- **Auth**: registro, login, verificación de email, recuperación de contraseña, OAuth (Google, GitHub)
- **Perfil**: ver/editar datos, cambiar contraseña
- **Admin Dashboard**: estadísticas, gestión de productos, categorías, pedidos y usuarios con sidebar

## Tech Stack

| Category | Tool |
|----------|------|
| Framework | [React 19](https://react.dev/) |
| Bundler | [Vite 8](https://vite.dev/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| Backend | [InsForge](https://insforge.dev) (Auth, Database, Storage) |
| Language | JavaScript (ES Modules) |

## Getting Started

### Prerequisites

- Node.js 18+
- An InsForge project (or use the provided demo credentials)

### Install

```bash
cd vite-ecomerse
npm install
```

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Project Structure

```
vite-ecomerse/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard (sidebar, layout, pages)
│   │   ├── layout/         # Navbar, Footer, ProtectedRoute, Sidebar
│   │   ├── productos/      # ProductCard
│   │   └── ui/             # Button, FormField
│   ├── contexts/
│   │   └── AuthContext.jsx # Auth state management
│   ├── pages/
│   │   ├── admin/          # Admin pages (dashboard, products, categories, orders, users)
│   │   ├── carrito/        # Cart page
│   │   ├── checkout/       # Checkout + order confirmation
│   │   └── perfil/         # Profile, edit profile, change password, order history
│   ├── services/
│   │   ├── insforgeClient.js   # InsForge SDK singleton
│   │   ├── authService.js      # Auth functions (login, register, etc.)
│   │   ├── productosService.js # Products CRUD
│   │   ├── categoriasService.js# Categories CRUD
│   │   ├── pedidosService.js   # Orders CRUD
│   │   ├── carritoService.js   # Cart CRUD
│   │   └── adminService.js     # Admin operations (stats, users, role changes)
│   ├── App.jsx
│   └── main.jsx
├── .env.example
└── package.json
```

## Backend

This project uses [InsForge](https://insforge.dev) as backend:

- **Auth**: email/password + OAuth (Google, GitHub), email verification, password reset
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: product images (`product-images` bucket)

Database schema and seed data are in `migrations/`.
