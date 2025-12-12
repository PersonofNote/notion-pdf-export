// Types for API requests and responses
export interface NotionPageData {
  pageId: string;
  title: string;
  properties: Record<string, string>;
  blocks: any[];
}

export interface LetterheadData {
  logoUrl?: string;
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface FetchNotionPageRequest {
  pageUrl: string;
  notionToken: string;
}

export interface GeneratePdfRequest {
  title: string;
  blocks: any[];
  letterhead: LetterheadData;
  properties?: Record<string, string>;
  hiddenProperties?: string[];
}

const API_BASE_URL = '/api';

/**
 * Fetch Notion page content and metadata
 */
export async function fetchNotionPage(
  pageUrl: string,
  notionToken: string
): Promise<NotionPageData> {
  const response = await fetch(`${API_BASE_URL}/notion/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
