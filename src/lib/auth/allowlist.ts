/**
 * Allowlist de e-mails autorizados a acessar o painel admin.
 * Ver docs/architecture/auth-strategy.md.
 */
export function parseAllowlist(csv: string): string[] {
  return csv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAllowedEmail(email: string | null | undefined, allowlistCsv: string): boolean {
  if (!email) return false;
  const allowlist = parseAllowlist(allowlistCsv);
  return allowlist.includes(email.trim().toLowerCase());
}
