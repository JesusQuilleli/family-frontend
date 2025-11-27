import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyReferralCodeAction } from '@/admin/actions/referral/get-my-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';

export const ReferralLinkCard = () => {
   const [copied, setCopied] = useState(false);

   const { data: referralData, isLoading } = useQuery({
      queryKey: ['my-referral-code'],
      queryFn: getMyReferralCodeAction,
   });

   const referralUrl = referralData
      ? `${window.location.origin}/auth/register?ref=${referralData.code}`
      : '';

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(referralUrl);
         setCopied(true);
         toast.success('Link copiado al portapapeles');
         setTimeout(() => setCopied(false), 2000);
      } catch (error) {
         toast.error('Error al copiar el link');
      }
   };

   const handleWhatsAppShare = () => {
      const message = encodeURIComponent(
         `¡Únete a mi tienda! Regístrate usando este link:\n${referralUrl}`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
   };

   if (isLoading) {
      return (
         <Card>
            <CardHeader>
               <CardTitle>Link de Invitación</CardTitle>
               <CardDescription>Cargando...</CardDescription>
            </CardHeader>
         </Card>
      );
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Share2 className="w-5 h-5" />
               Link de Invitación
            </CardTitle>
            <CardDescription>
               Comparte este link para que tus clientes se registren en tu tienda
            </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            {/* Código de Referido */}
            <div>
               <label className="text-sm font-medium mb-2 block">Tu Código de Referido</label>
               <div className="flex gap-2">
                  <Input
                     value={referralData?.code || ''}
                     readOnly
                     className="font-mono text-lg font-bold text-center"
                  />
               </div>
            </div>

            {/* URL Completa */}
            <div>
               <label className="text-sm font-medium mb-2 block">Link de Invitación</label>
               <div className="flex gap-2">
                  <Input
                     value={referralUrl}
                     readOnly
                     className="font-mono text-sm"
                  />
                  <Button
                     onClick={handleCopy}
                     variant="outline"
                     size="icon"
                     className="flex-shrink-0"
                  >
                     {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                     ) : (
                        <Copy className="w-4 h-4" />
                     )}
                  </Button>
               </div>
            </div>

            {/* Estadísticas */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
               <Users className="w-5 h-5 text-muted-foreground" />
               <div>
                  <p className="text-sm font-medium">Clientes Registrados</p>
                  <p className="text-2xl font-bold">{referralData?.usedCount || 0}</p>
               </div>
            </div>

            {/* Botones de Compartir */}
            <div className="flex gap-2">
               <Button onClick={handleCopy} className="flex-1" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
               </Button>
               <Button onClick={handleWhatsAppShare} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir por WhatsApp
               </Button>
            </div>
         </CardContent>
      </Card>
   );
};
