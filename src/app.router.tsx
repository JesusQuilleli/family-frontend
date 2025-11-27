import { createBrowserRouter } from "react-router";
import { LoginPage } from "./auth/pages/login/LoginPage";
import { RegisterPage } from "./auth/pages/register/RegisterPage";
import { WelcomePage } from "./pages/WelcomePage";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { ClientLayout } from "./client/layout/ClientLayout";
import { HomePageClient } from "./client/pages/home/HomePageClient";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { HomePageAdmin } from "./admin/pages/home/HomePageAdmin";
import { ProtectedRouteAdmin, ProtectedRouteClient } from "./components/routes/ProtectedRoute";
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
    element: <ClientLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRouteClient>
            <HomePageClient />
          </ProtectedRouteClient>)
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

    ]
  },

  //Admin Routers 
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRouteAdmin>
            <HomePageAdmin />
          </ProtectedRouteAdmin>)
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
  }

]);