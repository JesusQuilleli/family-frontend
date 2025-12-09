import { usdToBs, usdToPesos } from "@/helpers/converts.prices.bs";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatCurrencyBs, formatCurrencyPesos } from "@/helpers/format-currency";

interface PriceDisplayProps {
   price: number;
   className?: string;
   showBase?: boolean;
   showOnly?: 'USD' | 'VES' | 'COP';
}

export const PriceDisplay = ({ price, className = "", showBase = true, showOnly }: PriceDisplayProps) => {
   const { user } = useProfile();

   // Default rates if not available (fallback to 0 or hardcoded if preferred, but 0 indicates loading/missing)
   const tasaBs = user?.exchangeRates?.tasaBs || 0;
   const tasaPesos = user?.exchangeRates?.tasaPesos || 0;
   const clientCurrency = user?.exchangeRates?.clientCurrency || 'VES';

   const priceInBs = usdToBs(price, tasaBs);
   const priceInPesos = usdToPesos(price, tasaPesos);

   // Determine what to show
   // If showOnly is explicitly passed, use it.
   // Otherwise, if user is a client, use their admin's preference (clientCurrency).
   // If user is admin, show all (or default behavior).

   let currencyToShow = showOnly;

   if (!currencyToShow && user?.role === 'cliente') {
      currencyToShow = clientCurrency;
   }

   // If still no specific currency to show (e.g. admin view), show all
   if (!currencyToShow) {
      // ✅ Admin View Preference Logic
      if (user?.role === 'admin' && user?.exchangeRates?.adminViewPreference === 'COP_TO_BS') {
         const tasaCopToBs = user?.exchangeRates?.tasaCopToBs || 1;
         const priceInBsFromCop = priceInPesos / tasaCopToBs;
         return (
            <div className={`flex flex-col ${className}`}>
               {showBase && <span className="text-green-600 font-bold">{formatCurrency(price)}</span>}
               <span className="text-blue-600 font-medium text-sm">
                  {formatCurrencyBs(priceInBsFromCop)} <span className="text-[10px] text-muted-foreground">(desde COP)</span>
               </span>
               <span className="text-orange-600 font-medium text-xs">
                  {formatCurrencyPesos(priceInPesos)} <span className="text-[10px]">COP</span>
               </span>
            </div>
         );
      }

      // Default Admin View (USD -> Bs)
      return (
         <div className={`flex flex-col ${className}`}>
            {showBase && <span className="text-green-600 font-bold">{formatCurrency(price)}</span>}
            <span className="text-blue-600 font-medium text-sm">{formatCurrencyBs(priceInBs)}</span>
            <span className="text-orange-600 font-medium text-xs">
               {formatCurrencyPesos(priceInPesos)} <span className="text-[10px]">COP</span>
            </span>
         </div>
      );
   }

   // Show specific currency
   // Show specific currency
   if (currencyToShow === 'COP') {
      const tasaCopToBs = user?.exchangeRates?.tasaCopToBs || 0;
      const isAdminOrEmployee = user?.role !== 'cliente';
      const showBsFromCop = tasaCopToBs > 0 && isAdminOrEmployee;
      const priceInBsFromCop = showBsFromCop ? priceInPesos / tasaCopToBs : 0;

      return (
         <div className={`flex flex-col ${className}`}>
            <span className="text-orange-600 font-medium">
               {formatCurrencyPesos(priceInPesos)} <span className="text-xs">COP</span>
            </span>
            {showBsFromCop && (
               <span className="text-blue-600 font-medium text-xs">
                  {formatCurrencyBs(priceInBsFromCop)}
                  {isAdminOrEmployee && ` (Tasa: ${tasaCopToBs})`}
               </span>
            )}
         </div>
      );
   }

   return (
      <div className={`flex flex-col ${className}`}>
         {currencyToShow === 'USD' && <span className="text-green-600 font-bold">{formatCurrency(price)}</span>}
         {currencyToShow === 'VES' && <span className="text-blue-600 font-medium">{formatCurrencyBs(priceInBs)}</span>}
      </div>
   );
};
