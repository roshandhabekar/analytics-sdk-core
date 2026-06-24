/**
 * UrlValidator - Validates and sanitizes script URLs
 *
 * Constitutional Principle: Dynamic Script Loading Rules
 * - Only HTTPS URLs allowed
 * - Optional whitelist validation
 * - Never throws - returns validation result
 */

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

export class UrlValidator {
  private whitelist: string[] = [];

  /**
   * Set URL whitelist for additional security
   *
   * @param allowedDomains - Array of allowed domain patterns
   * @example
   * validator.setWhitelist([
   *   'www.googletagmanager.com',
   *   'cdn.clevertap.com',
   *   '*.analytics-cdn.com'
   * ]);
   */
  setWhitelist(allowedDomains: string[]): void {
    this.whitelist = allowedDomains;
  }

  /**
   * Validate a script URL
   *
   * @param url - URL to validate
   * @returns Validation result with error message if invalid
   *
   * Validation rules:
   * 1. Must be a valid URL
   * 2. Must use HTTPS protocol
   * 3. Must match whitelist if whitelist is configured
   */
  validate(url: string): UrlValidationResult {
    try {
      // Rule 1: Must be a valid URL
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return {
          valid: false,
          error: `Invalid URL format: ${url}`,
        };
      }

      // Rule 2: Must use HTTPS
      if (parsedUrl.protocol !== 'https:') {
        return {
          valid: false,
          error: `URL must use HTTPS protocol: ${url}`,
        };
      }

      // Rule 3: Must match whitelist (if configured)
      if (this.whitelist.length > 0) {
        const hostname = parsedUrl.hostname;
        const isWhitelisted = this.whitelist.some((pattern) =>
          this.matchHostname(hostname, pattern)
        );

        if (!isWhitelisted) {
          return {
            valid: false,
            error: `URL hostname not in whitelist: ${hostname}`,
          };
        }
      }

      return { valid: true };
    } catch (error) {
      // Never throw - return validation failure
      return {
        valid: false,
        error: `URL validation error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check if URL is valid (convenience method)
   *
   * @param url - URL to check
   * @returns true if valid
   */
  isValid(url: string): boolean {
    return this.validate(url).valid;
  }

  /**
   * Match hostname against pattern (supports wildcards)
   *
   * @param hostname - Hostname to match
   * @param pattern - Pattern (supports * wildcard)
   * @returns true if matches
   *
   * Examples:
   * - "*.example.com" matches "cdn.example.com", "api.example.com"
   * - "example.com" matches exactly "example.com"
   */
  private matchHostname(hostname: string, pattern: string): boolean {
    if (pattern === hostname) {
      return true;
    }

    // Support wildcard patterns
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2);
      return hostname.endsWith(`.${baseDomain}`) || hostname === baseDomain;
    }

    return false;
  }
}
