import React from "react";
import { useContent } from "../context/ContentContext";

interface EditableTextProps {
  value: string;
  onChange: (v: string) => void;
  as?: "input" | "textarea" | "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
}

export default function EditableText({
  value,
  onChange,
  as = "span",
  className = "",
}: EditableTextProps) {
  const { isEditing } = useContent();

  if (isEditing) {
    if (as === "textarea") {
      return (
        <textarea
          className={`border rounded p-2 w-full ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        className={`border rounded p-2 ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Affichage en mode lecture (read-only)
  if (as === "input") {
    return (
      <input
        className={className}
        value={value}
        readOnly
        tabIndex={-1}
        style={{ pointerEvents: "none", background: "transparent", border: "none" }}
      />
    );
  }
  if (as === "textarea") {
    return (
      <textarea
        className={className}
        value={value}
        readOnly
        tabIndex={-1}
        style={{ pointerEvents: "none", background: "transparent", border: "none" }}
      />
    );
  }
  return React.createElement(as, { className }, value);
}