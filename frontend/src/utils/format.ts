export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
