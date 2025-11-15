import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { toast } from "sonner";
import { useAuthStore } from "@/auth/store/auth.store";
import { useAuthRedirect } from "@/auth/hook/useAuth";

export const LoginPage = () => {

  useAuthRedirect();

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    // No necesitas 'setIsLoading(false)' aquí si ya está en el 'finally'
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const result = await login(email, password);

      //console.log(result);

      if (!result.ok) {
        const errorMsg =
          typeof result.msg === "string"
            ? result.msg
            : (result.msg && typeof result.msg === "object" && "message" in result.msg)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? String((result.msg as any).message)
              : "Error en el inicio de sesión";

        toast.error(errorMsg);
        return;
      }

      if (result.user.role !== "admin") {
        navigate("/client");
        return;
      }

      toast.success(result.msg || "Inicio de sesión exitoso");
      navigate("/admin");

    } catch (error: unknown) {
      console.error("Error inesperado en handleSubmit:", error);
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (<CustomFullScreenLoading />)}

      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/30 px-4">
        <div className="w-full max-w-md animate-in fade-in duration-500">
          <Card className="border-border shadow-medium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    required
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 cursor-pointer"
                >
                  Acceder
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4 flex flex-col">
                <Link to={'/auth/register'} className="text-sm">
                  ¿No tienes cuenta?
                </Link>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ← Volver al inicio
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

