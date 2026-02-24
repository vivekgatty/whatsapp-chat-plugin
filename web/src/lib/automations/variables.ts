/**
 * Resolves {{contact.name}}-style template variables against
 * a contact record or arbitrary data object.
 */
export function resolveVariables(
  mapping: Record<string, string>,
  data: Record<string, unknown>
): string[] {
  const result: string[] = [];

  const sortedKeys = Object.keys(mapping).sort((a, b) => Number(a) - Number(b));

  for (const key of sortedKeys) {
    const expression = mapping[key];
    result.push(resolveExpression(expression, data));
  }

  return result;
}

export function resolveExpression(expression: string, data: Record<string, unknown>): string {
  return expression.replace(/\{\{([^}]+)\}\}/g, (_match, path: string) => {
    const value = getNestedValue(data, path.trim());
    return value != null ? String(value) : "";
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

export function extractVariablePlaceholders(template: string): string[] {
  const matches = template.match(/\{\{(\d+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches)].sort();
}
