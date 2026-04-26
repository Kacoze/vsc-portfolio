export function parseTerminalCommand(raw: string): { cmd: string; args: string[] } {
  const parts = raw.trim().split(/\s+/).filter(Boolean)
  return { cmd: parts[0]?.toLowerCase() ?? '', args: parts.slice(1) }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

export function esc(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] ?? c))
}
