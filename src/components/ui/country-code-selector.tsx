import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

interface CountryCodeSelectorProps {
   value: string;
   onChange: (value: string) => void;
}

const countries = [
   { code: "+58", name: "Venezuela", flag: "🇻🇪" },
   { code: "+57", name: "Colombia", flag: "🇨🇴" },
   { code: "+51", name: "Perú", flag: "🇵🇪" },
   { code: "+55", name: "Brasil", flag: "🇧🇷" },
   { code: "+1", name: "EE.UU", flag: "🇺🇸" },
];

export const CountryCodeSelector = ({ value, onChange }: CountryCodeSelectorProps) => {
   return (
      <Select value={value} onValueChange={onChange}>
         <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="País" />
         </SelectTrigger>
         <SelectContent>
            {countries.map((country) => (
               <SelectItem key={country.code} value={country.code}>
                  <span className="mr-2">{country.flag}</span>
                  {country.code}
               </SelectItem>
            ))}
         </SelectContent>
      </Select>
   );
};
