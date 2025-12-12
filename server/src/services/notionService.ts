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
 * - https://notion.so/abc123def456
 * - abc123def456 (raw ID)
 */
export function extractPageId(url: string): string {
  // If it's already a UUID-like string, return it
  const uuidRegex = /^[a-f0-9]{32}$/i;
  const cleanUrl = url.replace(/-/g, '');
  if (uuidRegex.test(cleanUrl)) {
    return cleanUrl;
  }

  // Extract from URL
  const matches = url.match(/(?:https?:\/\/)?(?:www\.)?notion\.so\/.*-([a-f0-9]{32})/i);
  if (matches && matches[1]) {
    return matches[1];
  }

  // Try to extract just the ID at the end
  const endMatches = url.match(/([a-f0-9]{32})$/i);
  if (endMatches && endMatches[1]) {
    return endMatches[1];
  }

  throw new Error('Invalid Notion URL or page ID');
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
      throw new Error('Page not found. Check the URL and make sure your integration has access to this page.');
    } else if (error.code === 'unauthorized') {
      throw new Error('Invalid Notion token or insufficient permissions.');
    } else if (error.code === 'restricted_resource') {
      throw new Error('Access restricted. Make sure the integration is added to this page.');
    }

    throw new Error(`Failed to fetch Notion page: ${error.message}`);
  }
}
