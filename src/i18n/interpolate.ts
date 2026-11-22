/** Client-safe twin of the server helper: replaces `{key}` tokens in dictionary strings. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => (key in values ? String(values[key]) : token));
}
