import { createBrowserRouter } from "react-router";
import { LoginPage } from "./auth/pages/login/LoginPage";
import { RegisterPage } from "./auth/pages/register/RegisterPage";
import { WelcomePage } from "./pages/WelcomePage";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { ClientLayout } from "./client/layout/ClientLayout";
import { HomePageClient } from "./client/pages/home/HomePageClient";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { HomePageAdmin } from "./admin/pages/home/HomePageAdmin";
import { ProtectedRouteAdmin, ProtectedRouteClient, ProtectedRouteSuperAdmin } from "./components/routes/ProtectedRoute";
import { SuperAdminLayout } from "./superadmin/layout/SuperAdminLayout";
import { SuperAdminVendorsPage } from "./superadmin/pages/SuperAdminVendorsPage";
import { Navigate } from "react-router";
import { AdminProductsPage } from "./admin/pages/products/AdminProductsPage";
import { AdminOrdersPage } from "./admin/pages/orders/AdminOrdersPage";
import { ClientProductsPage } from "./client/pages/products/ClientProductsPage";
import { ClientOrdersPage } from "./client/pages/orders/ClientOrdersPage";
import { ClientPaymentsPage } from "./client/pages/payments/ClientPaymentsPage";
import { AdminCategoriesPage } from "./admin/pages/categories/AdminCategoriesPage";
import { ClientProfilePage } from "./client/pages/profile/ClientProfilePage";
import { AdminClientsPage } from "./admin/pages/clients/AdminClientsPage";
import { AdminClientDetailsPage } from "./admin/pages/clients/AdminClientDetailsPage";
import ForgotPasswordPage from "./auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./auth/pages/ResetPasswordPage";
import { AdminPaymentsPage } from "./admin/pages/payments/AdminPaymentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { PremiumPage } from "./pages/PremiumPage";

export const appRouter = createBrowserRouter([

  //Public Routers

  //Welcome Routers
  {
    index: true,
    element: <WelcomePage />,
  },

  //Auth Routers 
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />
      },
      {
        path: "reset-password/:token",
        element: <ResetPasswordPage />
      }
    ]
  },

  //Private Routers

  //Client Routers 
  {
    path: '/client',
    element: (
      <ProtectedRouteClient>
        <ClientLayout />
      </ProtectedRouteClient>
    ),
    children: [
      {
        index: true,
        element: <HomePageClient />
      },
      {
        path: 'productos',
        element: <ClientProductsPage />
      },
      {
        path: 'pedidos',
        element: <ClientOrdersPage />
      },
      {
        path: 'pagos',
        element: <ClientPaymentsPage />
      },
      {
        path: 'perfil',
        element: <ClientProfilePage />
      },
      {
        path: 'notificaciones',
        element: <NotificationsPage />
      },
      {
        path: 'premium',
        element: <PremiumPage />
      }

    ]
  },

  //Admin Routers 
  {
    path: '/admin',
    element: (
      <ProtectedRouteAdmin>
        <AdminLayout />
      </ProtectedRouteAdmin>
    ),
    children: [
      {
        index: true,
        element: <HomePageAdmin />
      },
      {
        path: 'productos',
        element: <AdminProductsPage />
      },
      {
        path: 'pedidos',
        element: <AdminOrdersPage />
      },
      {
        path: 'pagos',
        element: <AdminPaymentsPage />
      },
      {
        path: 'categorias',
        element: <AdminCategoriesPage />
      },
      {
        path: 'clientes',
        element: <AdminClientsPage />
      },
      {
        path: 'clientes/:id',
        element: <AdminClientDetailsPage />
      },
      {
        path: 'perfil',
        element: <ClientProfilePage />
      }

    ]
  },

  //Super Admin Routers
  {
    path: '/super-admin',
    element: (
      <ProtectedRouteSuperAdmin>
        <SuperAdminLayout />
      </ProtectedRouteSuperAdmin>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="vendedores" replace />
      },
      {
        path: 'vendedores',
        element: <SuperAdminVendorsPage />
      }
    ]
  }

]);