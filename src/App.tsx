import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"
import { Toaster as Sonner } from 'sonner';
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./auth/store/auth.store";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { checkBackendHealth } from "./api/family.api";
import { ServerWakeUp } from "./components/ui/server-wake-up";

export const App = () => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const [isServerWakingUp, setIsServerWakingUp] = useState(false);
  const queryClient = new QueryClient();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    const checkServer = async () => {
      // Start a timer to show the message if the request takes too long
      const timeoutId = setTimeout(() => {
        setIsServerWakingUp(true);
      }, 1500); // 1.5s threshold

      await checkBackendHealth();

      // If request finishes, clear timeout and hide message
      clearTimeout(timeoutId);
      setIsServerWakingUp(false);
    };

    checkServer();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      {isServerWakingUp && <ServerWakeUp />}
      <RouterProvider router={appRouter} />
      <Sonner />
      <Toaster />
    </QueryClientProvider>
  )
}
