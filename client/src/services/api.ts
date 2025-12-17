// Types for API requests and responses
export interface NotionPageData {
  type: 'page';
  pageId: string;
  title: string;
  properties: Record<string, string>;
  blocks: any[];
}

export interface DatabaseSchema {
  [columnName: string]: {
    id: string;
    type: string;
  };
}

export interface DatabaseRow {
  id: string;
  properties: Record<string, any>;
}

export interface NotionDatabaseData {
  type: 'database';
  databaseId: string;
  title: string;
  schema: DatabaseSchema;
  rows: DatabaseRow[];
  icon?: string;
}

export type NotionResourceData = NotionPageData | NotionDatabaseData;

export interface LetterheadData {
  logoUrl?: string;
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface FetchNotionPageRequest {
  pageUrl: string;
  notionToken?: string;
}

export interface PageGeneratePdfRequest {
  type: 'page';
  title: string;
  blocks: any[];
  letterhead: LetterheadData;
  properties?: Record<string, string>;
  hiddenProperties?: string[];
}

export interface DatabaseGeneratePdfRequest {
  type: 'database';
  database: NotionDatabaseData;
  letterhead: LetterheadData;
  hiddenColumns?: string[];
}

export type GeneratePdfRequest = PageGeneratePdfRequest | DatabaseGeneratePdfRequest;

export interface AuthStatusResponse {
  authenticated: boolean;
  workspaceName?: string;
  workspaceIcon?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  type: 'page' | 'database';
  lastEditedTime: string;
  icon?: {
    type: string;
    emoji?: string;
    file?: { url: string };
    external?: { url: string };
  } | null;
}

export interface NotionPagesResponse {
  pages: NotionPage[];
  hasMore: boolean;
}

// Use environment variable for API URL, fallback to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

/**
 * Fetch Notion resource (page or database) content and metadata
 * Token is optional if user is authenticated via OAuth
 */
export async function fetchNotionPage(
  pageUrl: string,
  notionToken?: string
): Promise<NotionResourceData> {
  const response = await fetch(`${API_BASE_URL}/notion/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send cookies for session
    body: JSON.stringify({
      pageUrl,
      notionToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate and download a branded PDF
 */
export async function generatePdf(request: GeneratePdfRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/pdf/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Trigger download of a PDF blob
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert an image file to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Initiate OAuth flow - redirect to Notion authorization
 */
export function initiateOAuth(): void {
  window.location.href = `${API_BASE_URL}/auth/notion`;
}

/**
 * Check if user is authenticated via OAuth
 */
export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/status`, {
    method: 'GET',
    credentials: 'include', // Send cookies for session
  });

  if (!response.ok) {
    throw new Error('Failed to check authentication status');
  }

  return response.json();
}

/**
 * Logout and clear session
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Send cookies for session
  });

  if (!response.ok) {
    throw new Error('Failed to logout');
  }
}

/**
 * Fetch list of pages accessible to the authenticated user
 * Requires OAuth authentication
 */
export async function fetchAccessiblePages(): Promise<NotionPagesResponse> {
  const response = await fetch(`${API_BASE_URL}/notion/pages`, {
    method: 'GET',
    credentials: 'include', // Send cookies for session
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch pages');
  }

  return response.json();
}
