"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

function formatCurrency(num: number): string {
  return num.toLocaleString("id-ID");
}

function parseCurrency(str: string): number {
  return Number(str.replace(/\D/g, "")) || 0;
}

export function CurrencyInput({ value, onChange, className }: CurrencyInputProps) {
  const [display, setDisplay] = useState(formatCurrency(value));

  useEffect(() => {
    setDisplay(formatCurrency(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const num = parseCurrency(raw);
    setDisplay(formatCurrency(num));
    onChange(num);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    if (value === 0) {
      setDisplay("");
    }
    e.target.select();
  }

  function handleBlur() {
    setDisplay(formatCurrency(value));
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
      <Input
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputMode="numeric"
        className={cn("pl-9", className)}
      />
    </div>
  );
}
