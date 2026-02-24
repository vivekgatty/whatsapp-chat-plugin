/**
 * Resolves {{contact.name}}-style placeholders in a string.
 * Used in quick replies, automation messages, and template previews.
 */
export function resolveTemplatePlaceholders(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, path: string) => {
    const value = resolvePath(context, path.trim());
    return value != null ? String(value) : "";
  });
}

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Returns a list of available variable tokens for the UI autocomplete.
 */
export function getAvailableVariables(): { token: string; label: string }[] {
  return [
    { token: "{{contact.name}}", label: "Contact Name" },
    { token: "{{contact.phone}}", label: "Contact Phone" },
    { token: "{{contact.email}}", label: "Contact Email" },
    { token: "{{contact.profile_name}}", label: "WhatsApp Profile Name" },
    { token: "{{contact.city}}", label: "Contact City" },
    { token: "{{contact.lifecycle_stage}}", label: "Lifecycle Stage" },
    { token: "{{agent.display_name}}", label: "Agent Name" },
    { token: "{{workspace.name}}", label: "Business Name" },
    { token: "{{order.order_number}}", label: "Order Number" },
    { token: "{{order.total_amount}}", label: "Order Total" },
    { token: "{{order.status}}", label: "Order Status" },
  ];
}
