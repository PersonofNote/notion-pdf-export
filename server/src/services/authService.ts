import crypto from 'crypto';
import { OAuthTokens } from '../types/oauth';

/**
 * Generate a random state string for CSRF protection
 */
export function generateRandomState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate Notion OAuth authorization URL
 */
export function generateAuthUrl(state: string): string {
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('NOTION_CLIENT_ID and NOTION_REDIRECT_URI must be set in environment variables');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    owner: 'user',
    state: state,
    redirect_uri: redirectUri,
  });

  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<OAuthTokens> {
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const redirectUri = process.env.NOTION_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('OAuth environment variables not configured');
  }

  // Create Basic Auth header
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to exchange code for token: ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }

  const tokens = await response.json() as OAuthTokens;
  return tokens;
}

/**
 * Validate that required OAuth environment variables are set
 */
export function validateOAuthConfig(): { valid: boolean; error?: string } {
  const { NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, NOTION_REDIRECT_URI } = process.env;

  if (!NOTION_CLIENT_ID) {
    return { valid: false, error: 'NOTION_CLIENT_ID is not set' };
  }

  if (!NOTION_CLIENT_SECRET) {
    return { valid: false, error: 'NOTION_CLIENT_SECRET is not set' };
  }

  if (!NOTION_REDIRECT_URI) {
    return { valid: false, error: 'NOTION_REDIRECT_URI is not set' };
  }

  return { valid: true };
}
