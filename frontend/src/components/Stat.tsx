import React from "react";

interface StatProps {
  label: string;
  value: string | number;
}

export function Stat({ label, value }: StatProps) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}