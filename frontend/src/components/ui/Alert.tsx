interface AlertProps {
  type: "error" | "success";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const isError = type === "error";
  return (
    <div
      role="alert"
      style={{
        padding: "12px 16px",
        border: `1px solid ${isError ? "var(--red)" : "var(--green)"}`,
        background: isError ? "var(--red-dim)" : "var(--green-dim)",
        color: isError ? "var(--red)" : "var(--green)",
        fontSize: "13px",
        fontFamily: "var(--font-mono)",
        lineHeight: 1.5,
      }}
    >
      {isError ? "✗ " : "✓ "}
      {message}
    </div>
  );
}
