"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  className?: string;
}

export function NumberInput({ value, onChange, min = 0, className }: NumberInputProps) {
  const [display, setDisplay] = useState(String(value));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDisplay(raw);
    const num = Number(raw);
    if (!isNaN(num)) onChange(num);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  function handleBlur() {
    const num = Math.max(min, Number(display) || 0);
    onChange(num);
    setDisplay(String(num));
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(className)}
    />
  );
}
