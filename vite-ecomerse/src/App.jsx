import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import CatalogoPage from "./pages/catalogo/CatalogoPage";
import LoginPage from "./pages/auth/LoginPage";
import RegistroPage from "./pages/auth/RegistroPage";
import RecuperarPasswordPage from "./pages/auth/RecuperarPasswordPage";
import RestablecerPasswordPage from "./pages/auth/RestablecerPasswordPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PerfilPage from "./pages/perfil/PerfilPage";
import EditarPerfilPage from "./pages/perfil/EditarPerfilPage";
import CambiarPasswordPage from "./pages/perfil/CambiarPasswordPage";
import HistorialPedidosPage from "./pages/perfil/HistorialPedidosPage";
import CarritoPage from "./pages/carrito/CarritoPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import ConfirmacionPedidoPage from "./pages/checkout/ConfirmacionPedidoPage";
import PagoExitoPage from "./pages/checkout/PagoExitoPage";
import PagoCanceladoPage from "./pages/checkout/PagoCanceladoPage";
import ProductoDetallePage from "./pages/productos/ProductoDetallePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductosPage from "./pages/admin/AdminProductosPage";
import AdminProductoFormPage from "./pages/admin/AdminProductoFormPage";
import AdminCategoriasPage from "./pages/admin/AdminCategoriasPage";
import AdminPedidosPage from "./pages/admin/AdminPedidosPage";
import AdminPedidoDetallePage from "./pages/admin/AdminPedidoDetallePage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";
import PedidoDetalleClientePage from "./pages/perfil/PedidoDetalleClientePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/producto/:id" element={<ProductoDetallePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
        <Route path="/reset-password" element={<RestablecerPasswordPage />} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/editar-perfil" element={<ProtectedRoute><EditarPerfilPage /></ProtectedRoute>} />
        <Route path="/cambiar-password" element={<ProtectedRoute><CambiarPasswordPage /></ProtectedRoute>} />
        <Route path="/historial-pedidos" element={<ProtectedRoute><HistorialPedidosPage /></ProtectedRoute>} />
        <Route path="/carrito" element={<ProtectedRoute><CarritoPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/pedido/confirmacion" element={<ProtectedRoute><ConfirmacionPedidoPage /></ProtectedRoute>} />
        <Route path="/pago-exito" element={<ProtectedRoute><PagoExitoPage /></ProtectedRoute>} />
        <Route path="/pago-cancelado" element={<ProtectedRoute><PagoCanceladoPage /></ProtectedRoute>} />
        <Route path="/pedido-detalle/:id" element={<ProtectedRoute><PedidoDetalleClientePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute rolRequerido="admin"><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/productos" element={<AdminProductosPage />} />
        <Route path="/admin/productos/nuevo" element={<AdminProductoFormPage />} />
        <Route path="/admin/productos/:id/editar" element={<AdminProductoFormPage />} />
        <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
        <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
        <Route path="/admin/pedidos/:id" element={<AdminPedidoDetallePage />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
      </Route>
    </Routes>
  );
}
