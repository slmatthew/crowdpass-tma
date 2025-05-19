import { FC } from "react";
import { Button, Caption } from "@telegram-apps/telegram-ui";

interface SimpleCounterProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const SimpleCounter: FC<SimpleCounterProps> = ({ value, min, max, onChange }) => {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button size="s" onClick={decrement} disabled={value <= min}>-</Button>
      <Caption>{value}</Caption>
      <Button size="s" onClick={increment} disabled={value >= max}>+</Button>
    </div>
  );
};