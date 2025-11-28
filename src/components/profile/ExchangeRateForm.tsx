import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FamilyApi } from "@/api/family.api";

interface ExchangeRateFormProps {
   initialRates?: {
      tasaBs: number;
      tasaPesos: number;
      clientCurrency?: string;
   };
}

export const ExchangeRateForm = ({ initialRates }: ExchangeRateFormProps) => {
   const [tasaBs, setTasaBs] = useState(initialRates?.tasaBs || 0);
   const [tasaPesos, setTasaPesos] = useState(initialRates?.tasaPesos || 0);
   const [clientCurrency, setClientCurrency] = useState(initialRates?.clientCurrency || "VES");
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
         await FamilyApi.put('/exchange-rates/update', {
            tasaBs: Number(tasaBs),
            tasaPesos: Number(tasaPesos),
            clientCurrency
         });
         toast.success("Tasas de cambio actualizadas correctamente");
      } catch (error: any) {
         console.error(error);
         toast.error(error.response?.data?.msg || "Error al actualizar tasas");
      } finally {
         setLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="tasaBs">Tasa Bolívares (Bs)</Label>
               <Input
                  id="tasaBs"
                  type="number"
                  step="0.01"
                  value={tasaBs}
                  onChange={(e) => setTasaBs(Number(e.target.value))}
                  required
                  maxLength={7}
                  onInput={(e) => {
                     if (e.currentTarget.value.length > 7) {
                        e.currentTarget.value = e.currentTarget.value.slice(0, 7);
                     }
                  }}
               />
            </div>
            <div className="space-y-2">
               <Label htmlFor="tasaPesos">Tasa Pesos (COP)</Label>
               <Input
                  id="tasaPesos"
                  type="number"
                  step="1"
                  value={tasaPesos}
                  onChange={(e) => setTasaPesos(Number(e.target.value))}
                  required
                  maxLength={7}
                  onInput={(e) => {
                     if (e.currentTarget.value.length > 7) {
                        e.currentTarget.value = e.currentTarget.value.slice(0, 7);
                     }
                  }}
               />
            </div>
            <div className="space-y-2 md:col-span-2">
               <Label htmlFor="clientCurrency">Moneda para Clientes</Label>
               <select
                  id="clientCurrency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={clientCurrency}
                  onChange={(e) => setClientCurrency(e.target.value)}
               >
                  <option value="VES">Bolívares (VES)</option>
                  <option value="USD">Dólares (USD)</option>
                  <option value="COP">Pesos (COP)</option>
               </select>
               <p className="text-xs text-muted-foreground">
                  Esta es la moneda que verán tus clientes en la tienda.
               </p>
            </div>
         </div>
         <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Tasas"}
         </Button>
      </form>
   );
};
