import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordInput({ id, label = "Contraseña", value, onChange, newPassword = false, disabled = false }: { id: string; label?: string; value: string; onChange: (value: string) => void; newPassword?: boolean; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div>
    <label htmlFor={id} className="filter-label">{label}</label>
    <div className="relative">
      <Input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={newPassword ? "new-password" : "current-password"} required minLength={newPassword ? 8 : undefined} maxLength={128} disabled={disabled} className="h-12 pr-12" />
      <Button type="button" variant="ghost" size="icon" className="absolute top-1.5 right-1.5" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>{visible ? <EyeOff /> : <Eye />}</Button>
    </div>
  </div>;
}