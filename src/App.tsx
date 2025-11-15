
import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"
import { Toaster as Sonner } from 'sonner';
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./auth/store/auth.store";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const App = () => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const queryClient = new QueryClient();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);


  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
      <Sonner />
      <Toaster />
    </QueryClientProvider>
  )
}
