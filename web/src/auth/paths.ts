function getRawValue(input: unknown): string | null {
  if (Array.isArray(input)) {
    return typeof input[0] === 'string' ? input[0] : null;
  }

  return typeof input === 'string' ? input : null;
}

function hasScheme(path: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path);
}

export function sanitizeNextPath(raw: unknown, fallback = '/inbox'): string {
  const candidate = getRawValue(raw);
  if (!candidate) {
    return fallback;
  }

  if (!candidate.startsWith('/')) {
    return fallback;
  }

  if (candidate.startsWith('//')) {
    return fallback;
  }

  if (hasScheme(candidate)) {
    return fallback;
  }

  if (candidate.includes('\\')) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, 'https://placeholder.local');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
