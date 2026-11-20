import { neighborhoods, ruralNeighborhoods, urbanNeighborhoods } from "@/lib/city-data";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

export function NeighborhoodSelect({ value, onChange, disabled = false, id }: Props) {
  const listed = neighborhoods.includes(value);
  return (
    <Select
      value={listed ? value : ""}
      onValueChange={onChange}
      disabled={disabled}
      name="neighborhood"
      required
    >
      <SelectTrigger id={id} aria-label="Barrio" className="form-field h-12">
        <SelectValue placeholder="Elige tu barrio" />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {[
          { label: "Barrios y zonas urbanas", options: urbanNeighborhoods },
          { label: "Barrios rurales", options: ruralNeighborhoods },
        ].map(({ label, options }) => (
          <SelectGroup key={label}>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
