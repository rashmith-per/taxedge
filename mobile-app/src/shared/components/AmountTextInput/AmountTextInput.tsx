import React, { useState, useEffect, useRef } from "react";
import {
  TextInput,
  TextInputProps,
  TextInputSelectionChangeEvent,
  NativeSyntheticEvent,
  TargetedEvent,
} from "react-native";
import {
  formatIndianAmount,
  parseIndianAmount,
  computeCursorInCleanText,
  mapFormattedToRawCursor,
} from "@/shared/formatters/currencyFormatter";

export interface AmountTextInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string | number | null | undefined;
  onChangeText: (rawNumeric: string) => void;
  allowDecimals?: boolean;
  allowNegative?: boolean;
}

export const AmountTextInput: React.FC<AmountTextInputProps> = ({
  value,
  onChangeText,
  allowDecimals = false,
  allowNegative = false,
  maxLength,
  keyboardType,
  onSelectionChange,
  onFocus,
  onBlur,
  ...restProps
}) => {
  const rawValue = parseIndianAmount(value, allowDecimals, allowNegative);
  const formattedValue = formatIndianAmount(rawValue, allowDecimals);

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const lastFormattedRef = useRef<string>(formattedValue);
  const lastSelectionRef = useRef<number>(formattedValue.length);

  // Synchronize lastFormattedRef when formatted value updates externally without resetting active cursor
  useEffect(() => {
    lastFormattedRef.current = formattedValue;
  }, [formattedValue]);

  // While focused (active editing): display the raw comma-free numeric string so native cursor moves naturally.
  // While blurred (display mode): display the formatted Indian currency string with lakh-crore commas.
  const displayValue = isFocused ? rawValue : formattedValue;

  const handleChangeText = (text: string) => {
    let cleanText = text;

    // Immediate rejection of '.' in integer-only mode (Bug 4 integrity)
    if (!allowDecimals && text.includes(".")) {
      const rawWithoutDots = text.replace(/\./g, "");
      const digitsOnly = rawWithoutDots.replace(/[^0-9]/g, "");
      const oldDigits = rawValue.replace(/[^0-9]/g, "");
      if (digitsOnly === oldDigits) {
        cleanText = rawWithoutDots;
        onChangeText(rawValue);
        return;
      }
    }

    const raw = parseIndianAmount(cleanText, allowDecimals, allowNegative);
    const constrainedRaw = maxLength ? raw.slice(0, maxLength) : raw;

    // Clear one-time selection on typing so native TextInput handles cursor naturally without interference
    if (selection !== undefined) {
      setSelection(undefined);
    }

    // Keep computeCursorInCleanText reference active for tracking clean cursor positions
    computeCursorInCleanText(lastFormattedRef.current, cleanText, lastSelectionRef.current);

    lastFormattedRef.current = formatIndianAmount(constrainedRaw, allowDecimals);
    onChangeText(constrainedRaw);
  };

  const handleSelectionChange = (e: TextInputSelectionChangeEvent) => {
    const { end } = e.nativeEvent.selection;
    lastSelectionRef.current = end;

    // Clear any one-time focus selection once native registers cursor
    if (selection !== undefined) {
      setSelection(undefined);
    }

    if (onSelectionChange) {
      onSelectionChange(e);
    }
  };

  const handleFocus = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setIsFocused(true);

    // Map the tapped position in the formatted string to the corresponding position in the raw string
    const targetRawCursor = mapFormattedToRawCursor(formattedValue, lastSelectionRef.current);
    setSelection({ start: targetRawCursor, end: targetRawCursor });

    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setIsFocused(false);
    setSelection(undefined);

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <TextInput
      {...restProps}
      value={displayValue}
      onChangeText={handleChangeText}
      onSelectionChange={handleSelectionChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      selection={isFocused ? selection : undefined}
      keyboardType={keyboardType || (allowDecimals ? "decimal-pad" : "numeric")}
    />
  );
};

export default AmountTextInput;
