import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

/**
 * Extract page ID from various Notion URL formats
 * Supports:
 * - https://www.notion.so/Page-Title-abc123def456
 * - https://www.notion.so/workspace/abc123def456
 * - https://notion.so/abc123def456?v=...
 * - abc123def456 (raw ID with or without hyphens)
 */
export function extractPageId(url: string): string {
  // Remove any query parameters
  const urlWithoutQuery = url.split('?')[0];

  // If it's already a UUID-like string (with or without hyphens), return it
  const cleanUrl = urlWithoutQuery.replace(/-/g, '');
  const uuidRegex = /^[a-f0-9]{32}$/i;
  if (uuidRegex.test(cleanUrl)) {
    return cleanUrl;
  }

  // Extract from URL - try different patterns
  // Pattern 1: URL with page title (most common)
  let matches = urlWithoutQuery.match(/(?:https?:\/\/)?(?:www\.)?notion\.so\/.*?([a-f0-9]{32})/i);
  if (matches && matches[1]) {
    return matches[1];
  }

  // Pattern 2: URL with hyphens in ID
  matches = urlWithoutQuery.match(/(?:https?:\/\/)?(?:www\.)?notion\.so\/.*?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (matches && matches[1]) {
    return matches[1].replace(/-/g, '');
  }

  // Pattern 3: Just the ID at the end
  matches = urlWithoutQuery.match(/([a-f0-9]{32})$/i);
  if (matches && matches[1]) {
    return matches[1];
  }

  // Pattern 4: ID with hyphens at the end
  matches = urlWithoutQuery.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  if (matches && matches[1]) {
    return matches[1].replace(/-/g, '');
  }

  throw new Error('Invalid Notion URL or page ID. Please paste the full URL from your browser.');
}

/**
 * Format page ID with hyphens for Notion API
 * Converts: abc123def456... to abc123de-f456-...
 */
function formatPageId(pageId: string): string {
  const cleaned = pageId.replace(/-/g, '');
  return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
}

/**
 * Fetch a Notion page with all its content blocks
 */
export async function fetchNotionPage(pageUrl: string, token: string) {
  try {
    const notion = new Client({ auth: token });

    // Extract and format page ID
    const rawPageId = extractPageId(pageUrl);
    const pageId = formatPageId(rawPageId);

    console.log('Fetching Notion page:', pageId);

    // Fetch page metadata
    const page = await notion.pages.retrieve({ page_id: pageId });

    // Fetch all blocks (content)
    const blocksResponse = await notion.blocks.children.list({
      block_id: pageId
    });

    // Extract title from page properties
    let title = 'Untitled';
    if ('properties' in page) {
      const pageWithProps = page as PageObjectResponse;
      // Try to find title property
      const titleProp = Object.values(pageWithProps.properties).find(
        prop => prop.type === 'title'
      );
      if (titleProp && titleProp.type === 'title' && titleProp.title.length > 0) {
        title = titleProp.title[0].plain_text;
      }
    }

    // Extract properties for filtering
    const properties: Record<string, string> = {};
    if ('properties' in page) {
      const pageWithProps = page as PageObjectResponse;
      Object.entries(pageWithProps.properties).forEach(([key, value]) => {
        if (value.type === 'created_by' || value.type === 'last_edited_by') {
          properties[key] = 'User';
        } else if (value.type === 'created_time' || value.type === 'last_edited_time') {
          if (value.type === 'created_time') {
            properties[key] = value.created_time;
          } else if (value.type === 'last_edited_time') {
            properties[key] = value.last_edited_time;
          }
        } else if (value.type === 'select' && value.select) {
          properties[key] = value.select.name;
        } else if (value.type === 'multi_select') {
          properties[key] = value.multi_select.map(s => s.name).join(', ');
        } else if (value.type === 'status' && value.status) {
          properties[key] = value.status.name;
        } else if (value.type === 'date' && value.date) {
          properties[key] = value.date.start;
        } else if (value.type === 'checkbox') {
          properties[key] = value.checkbox ? 'Yes' : 'No';
        } else if (value.type === 'number' && value.number !== null) {
          properties[key] = value.number.toString();
        } else if (value.type === 'url' && value.url) {
          properties[key] = value.url;
        } else if (value.type === 'email' && value.email) {
          properties[key] = value.email;
        } else if (value.type === 'phone_number' && value.phone_number) {
          properties[key] = value.phone_number;
        }
      });
    }

    return {
      pageId: rawPageId,
      title,
      properties,
      blocks: blocksResponse.results as (BlockObjectResponse | PartialBlockObjectResponse)[],
    };
  } catch (error: any) {
    console.error('Error fetching Notion page:', error);

    if (error.code === 'object_not_found') {
      throw new Error(
        'Page not found. To fix: (1) Open the page in Notion, (2) Click "..." menu → "Connections" or "Add connections", (3) Add your integration to that specific page. Note: Sharing a parent page is not enough - you must share the exact page you want to export.'
      );
    } else if (error.code === 'unauthorized') {
      throw new Error('Invalid Notion token. Make sure you copied the entire "Internal Integration Secret" from notion.so/my-integrations');
    } else if (error.code === 'restricted_resource') {
      throw new Error('Access restricted. Open the page in Notion, click "..." → "Add connections", and select your integration.');
    } else if (error.message?.includes('is a database')) {
      throw new Error(
        'Database export not supported yet. To export database content: (1) Create a new Notion page, (2) Type "/linked" and create a linked database view, (3) Export that page instead. Or open a specific database row and export that individual page.'
      );
    }

    throw new Error(`Failed to fetch Notion page: ${error.message}`);
  }
}
