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
import { AdminPaymentsPage } from "./admin/pages/payments/AdminPaymentsPage";
import { ClientProductsPage } from "./client/pages/products/ClientProductsPage";
import { ClientOrdersPage } from "./client/pages/orders/ClientOrdersPage";
import { ClientPaymentsPage } from "./client/pages/payments/ClientPaymentsPage";

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
      }

    ]
  }

]);