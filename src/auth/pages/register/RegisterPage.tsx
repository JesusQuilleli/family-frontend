import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";
import { useState } from "react";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { useAuthRedirect } from "@/auth/hook/useAuth";


export const RegisterPage = () => {

  useAuthRedirect();

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const name = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;


    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const result = await register(name, email, password, phone);

    console.log(result);

    if (!result.ok) {
      alert(result.msg || "Error en el registro");
      return;
    }

    if (result.role !== "admin") {
      navigate("/client");
    };

    toast.success(result.msg || "Registro exitoso"
    );

    navigate("/admin");

    setIsLoading(false);

  };

  return (
    <>

      {isLoading && (
        <CustomFullScreenLoading />
      )}

      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/30 px-4">
        <div className="w-full max-w-md animate-in fade-in duration-500">
          <Card className="border-border shadow-medium">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
              <CardDescription className="text-center">
                Completa el formulario para registrarte
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
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    required
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    type="number"
                    name="phone"
                    placeholder="+58 412987654"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  Registrarse
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4 flex flex-col">
                <Link to="/auth/login" className="text-sm">
                  ¿Ya tienes cuenta?
                </Link>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

