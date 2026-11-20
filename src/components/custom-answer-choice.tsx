import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { customAnswers, withCustomAnswer } from "@/lib/questionnaire";

type Props = {
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  label: string;
  id: string;
  disabled?: boolean;
  onValidityChange?: (valid: boolean) => void;
};

export function CustomAnswerChoice({
  values,
  options,
  onChange,
  label,
  id,
  disabled = false,
  onValidityChange,
}: Props) {
  const [text, setText] = useState(() => customAnswers(values, options).join("; "));
  const [enabled, setEnabled] = useState(() => customAnswers(values, options).length > 0);
  const valid = !enabled || Boolean(text.trim());

  useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  return (
    <div className="mt-4">
      <Button
        type="button"
        variant={enabled ? "selected" : "choice"}
        size="option"
        className="w-full"
        aria-pressed={enabled}
        aria-expanded={enabled}
        aria-controls={id}
        disabled={disabled}
        onClick={() => {
          setEnabled(!enabled);
          if (enabled) {
            setText("");
            onChange(withCustomAnswer(values, options, ""));
          }
        }}
      >
        <span className="flex-1 text-left">Otras</span>
        {enabled && <Check className="text-primary" />}
      </Button>
      {enabled && (
        <div className="mt-4">
          <label htmlFor={id} className="filter-label">
            {label}
          </label>
          <Input
            id={id}
            className="form-field"
            value={text}
            placeholder="Escribe tu opción"
            required
            disabled={disabled}
            onChange={(event) => {
              setText(event.target.value);
              onChange(withCustomAnswer(values, options, event.target.value));
            }}
          />
        </div>
      )}
    </div>
  );
}
