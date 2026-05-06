export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value : undefined;
}

export function hasSheetsConfig(): boolean {
  return Boolean(getOptionalEnv("GOOGLE_SHEETS_SPREADSHEET_ID") && getOptionalEnv("GOOGLE_SERVICE_ACCOUNT_JSON"));
}

