/**
 * Input validation and sanitization utilities
 */

/**
 * Validate Notion URL format
 */
export function validateNotionUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required and must be a string' };
  }

  if (url.length > 500) {
    return { valid: false, error: 'URL is too long (max 500 characters)' };
  }

  // Check if it's a valid Notion URL or ID
  const notionUrlPattern = /^(https?:\/\/)?(www\.)?notion\.so\//i;
  const uuidPattern = /^[a-f0-9]{32}$/i;
  const uuidWithHyphensPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

  if (!notionUrlPattern.test(url) && !uuidPattern.test(url) && !uuidWithHyphensPattern.test(url)) {
    return { valid: false, error: 'Invalid Notion URL or page ID format' };
  }

  return { valid: true };
}

/**
 * Validate and sanitize letterhead data
 */
export function validateLetterheadData(letterhead: any): { valid: boolean; error?: string; sanitized?: any } {
  if (!letterhead || typeof letterhead !== 'object') {
    return { valid: false, error: 'Letterhead data must be an object' };
  }

  const { companyName, address, phone, email, logoUrl } = letterhead;

  // Company name is required
  if (!companyName || typeof companyName !== 'string') {
    return { valid: false, error: 'Company name is required' };
  }

  if (companyName.trim().length === 0) {
    return { valid: false, error: 'Company name cannot be empty' };
  }

  if (companyName.length > 200) {
    return { valid: false, error: 'Company name is too long (max 200 characters)' };
  }

  // Validate optional fields
  if (address && typeof address !== 'string') {
    return { valid: false, error: 'Address must be a string' };
  }

  if (address && address.length > 500) {
    return { valid: false, error: 'Address is too long (max 500 characters)' };
  }

  if (phone && typeof phone !== 'string') {
    return { valid: false, error: 'Phone must be a string' };
  }

  if (phone && phone.length > 50) {
    return { valid: false, error: 'Phone is too long (max 50 characters)' };
  }

  if (email && typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  if (email && email.length > 200) {
    return { valid: false, error: 'Email is too long (max 200 characters)' };
  }

  // Validate logo URL if present
  if (logoUrl) {
    if (typeof logoUrl !== 'string') {
      return { valid: false, error: 'Logo URL must be a string' };
    }

    // Check if it's a data URL (base64)
    if (logoUrl.startsWith('data:')) {
      if (logoUrl.length > 10 * 1024 * 1024) {
        return { valid: false, error: 'Logo is too large (max 10MB)' };
      }

      // Validate image format
      if (!logoUrl.match(/^data:image\/(png|jpeg|jpg|gif|svg\+xml|webp);base64,/i)) {
        return { valid: false, error: 'Invalid image format. Supported: PNG, JPEG, GIF, SVG, WebP' };
      }
    } else if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      // External URL
      if (logoUrl.length > 2000) {
        return { valid: false, error: 'Logo URL is too long (max 2000 characters)' };
      }
    } else {
      return { valid: false, error: 'Logo must be a data URL or HTTP(S) URL' };
    }
  }

  // Sanitize: trim strings and remove any potential HTML/script tags
  const sanitized = {
    companyName: sanitizeString(companyName),
    address: address ? sanitizeString(address) : undefined,
    phone: phone ? sanitizeString(phone) : undefined,
    email: email ? sanitizeString(email) : undefined,
    logoUrl: logoUrl || undefined,
  };

  return { valid: true, sanitized };
}

/**
 * Sanitize string by trimming and removing HTML tags
 */
function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"']/g, ''); // Remove potentially dangerous characters
}

/**
 * Validate array of property names
 */
export function validatePropertyArray(properties: any): { valid: boolean; error?: string } {
  if (!Array.isArray(properties)) {
    return { valid: false, error: 'Properties must be an array' };
  }

  if (properties.length > 100) {
    return { valid: false, error: 'Too many properties (max 100)' };
  }

  for (const prop of properties) {
    if (typeof prop !== 'string') {
      return { valid: false, error: 'All properties must be strings' };
    }

    if (prop.length > 200) {
      return { valid: false, error: 'Property name is too long (max 200 characters)' };
    }
  }

  return { valid: true };
}

/**
 * Validate Notion token format
 */
export function validateNotionToken(token: string): { valid: boolean; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Notion token is required' };
  }

  if (token.length < 10 || token.length > 500) {
    return { valid: false, error: 'Invalid token length' };
  }

  // Basic format check (tokens usually start with 'secret_' or 'ntn_')
  if (!token.match(/^(secret_|ntn_)/)) {
    return { valid: false, error: 'Invalid token format' };
  }

  return { valid: true };
}
