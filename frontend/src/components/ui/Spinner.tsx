interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const dims = size === "sm" ? "16px" : size === "lg" ? "40px" : "24px";
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: dims,
        height: dims,
        border: "2px solid var(--border)",
        borderTop: "2px solid var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
