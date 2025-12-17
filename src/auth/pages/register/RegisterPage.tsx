import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";
import { useState, useEffect } from "react";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { useAuthRedirect } from "@/auth/hook/useAuth";
import { validateReferralCodeAction } from "@/auth/actions/validate-referral";
import { Info, Eye, EyeOff, Loader2 } from "lucide-react";
import { CountryCodeSelector } from "@/components/ui/country-code-selector";


export const RegisterPage = () => {

  useAuthRedirect();

  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  // Inicializamos isValidating en true si hay un ref en la URL para evitar parpadeos
  const [isValidating, setIsValidating] = useState(() => !!searchParams.get('ref'));
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("+58");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const { register } = useAuthStore();

  // Capturar código de referido de la URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setIsValidating(true); // Asegurar que se muestre loading si cambia el searchParams detectado
      validateReferralCodeAction(refCode).then((result) => {
        if (result.valid) {
          setReferralCode(refCode);
          setAdminName(result.adminName || null);
        }
      }).finally(() => {
        setIsValidating(false);
      });
    } else {
      setIsValidating(false);
    }
  }, [searchParams]);

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

    const fullPhone = `${countryCode} ${phone}`;

    const result = await register(name, email, password, fullPhone, referralCode || undefined);

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

      {isValidating && (
        <CustomFullScreenLoading />
      )}

      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/30 px-4">
        <div className="w-full max-w-md animate-in fade-in duration-500">
          <Card className="border-border shadow-medium">
            <CardContent>
              {referralCode ? (
                <>
                  {adminName && (
                    <Alert className="mb-4 border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Te estás registrando como cliente de <strong>{adminName}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
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
                      <div className="flex gap-2">
                        <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                        <Input
                          id="phone"
                          type="number"
                          name="phone"
                          placeholder="412987654"
                          required
                          className="transition-all duration-200 focus:scale-[1.01] flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          required
                          className="transition-all duration-200 focus:scale-[1.01] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="••••••••"
                          required
                          className="transition-all duration-200 focus:scale-[1.01] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        "Registrarse"
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">¿Quieres abrir tu propia tienda?</h3>
                    <p className="text-muted-foreground text-sm">
                      El registro para vendedores se gestiona directamente con nosotros.
                      Contáctanos para adquirir tu plan.
                    </p>
                  </div>

                  <a
                    href="https://wa.me/584124742535?text=Hola,%20quiero%20abrir%20mi%20tienda%20en%20App%20Family"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Contactar por WhatsApp
                  </a>

                  <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ¿Tienes un código de invitación?
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Si te invitó una tienda, usa el enlace que te enviaron para registrarte.
                  </p>
                </div>
              )}

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

