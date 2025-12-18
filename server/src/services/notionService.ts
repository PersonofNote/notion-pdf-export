import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
  DatabaseObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

export type ResourceType = 'page' | 'database';

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

export interface NotionPageData {
  type: 'page';
  pageId: string;
  title: string;
  properties: Record<string, string>;
  blocks: (BlockObjectResponse | PartialBlockObjectResponse)[];
}

export interface NotionDatabaseData {
  type: 'database';
  id: string;
  title: string;
  firstRow: DatabaseRow;
  rowCount: number;
  schema: DatabaseSchema;
  rows: DatabaseRow[];
  icon?: string;
}

export type NotionResourceData = NotionPageData | NotionDatabaseData;

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
 * Detect if a resource is a page or database
 */
export async function detectResourceType(resourceId: string, token: string): Promise<ResourceType> {
  const notion = new Client({ auth: token });
  const formattedId = formatPageId(resourceId);

  try {
    // Try to fetch as page first
    await notion.pages.retrieve({ page_id: formattedId });
    return 'page';
  } catch (error: any) {
    // If it fails with "is a database" error, it's a database
    if (error.message?.includes('is a database') || error.code === 'object_not_found') {
      try {
        // Verify it's actually a database
        await notion.databases.retrieve({ database_id: formattedId });
        return 'database';
      } catch (dbError: any) {
        // If both fail, re-throw original error
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Extract property value as string for display
 */
function extractPropertyValue(property: any): string {
  if (!property) return '';

  switch (property.type) {
    case 'title':
      return property.title.map((t: any) => t.plain_text).join('');
    case 'rich_text':
      return property.rich_text.map((t: any) => t.plain_text).join('');
    case 'number':
      return property.number !== null ? property.number.toString() : '';
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select.map((s: any) => s.name).join(', ');
    case 'status':
      return property.status?.name || '';
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox ? 'Yes' : 'No';
    case 'url':
      return property.url || '';
    case 'email':
      return property.email || '';
    case 'phone_number':
      return property.phone_number || '';
    case 'people':
      return property.people.map((p: any) => p.name || 'Unknown').join(', ');
    case 'files':
      return property.files.map((f: any) => f.name).join(', ');
    case 'created_time':
      return property.created_time;
    case 'last_edited_time':
      return property.last_edited_time;
    case 'created_by':
      return 'User';
    case 'last_edited_by':
      return 'User';
    default:
      return '';
  }
}

/**
 * Fetch a Notion database with all its rows
 */
export async function fetchNotionDatabase(databaseUrl: string, token: string): Promise<NotionDatabaseData> {
  try {
    const notion = new Client({ auth: token });

    // Extract and format database ID
    const rawDatabaseId = extractPageId(databaseUrl); // Same extraction logic works for databases
    const databaseId = formatPageId(rawDatabaseId);

    console.log('Fetching Notion database:', databaseId);

    // Fetch database metadata
    const database = await notion.databases.retrieve({ database_id: databaseId }) as any;

    console.log('Database object:', {
      id: database.id,
      object: database.object,
      title: database.title
    });

    // Extract title
    let title = 'Untitled Database';
    if (database.title && database.title.length > 0) {
      title = database.title[0].plain_text;
    }

    // Extract icon
    let icon: string | undefined;
    if (database.icon) {
      if (database.icon.type === 'emoji') {
        icon = database.icon.emoji;
      }
    }

    // Extract schema (column definitions)
    const schema: DatabaseSchema = {};
    const dbProperties = (database as any).properties || {};
    Object.entries(dbProperties).forEach(([name, property]: [string, any]) => {
      schema[name] = {
        id: property.id || '',
        type: property.type || 'unknown'
      };
    });

    // Fetch all rows (with pagination)
    // Use search API to find all pages that are children of this database
    const rows: DatabaseRow[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 5; // Limit to 500 rows (100 per page) for MVP

    while (hasMore && pageCount < MAX_PAGES) {
      try {
        console.log('Searching for database rows with parent ID:', databaseId);
        const response: any = await notion.search({
          filter: {
            value: 'page',
            property: 'object'
          },
          start_cursor: startCursor,
          page_size: 100
        });
        console.log('Search response received, total results:', response.results?.length);

        // Debug: Log what we're getting
        response.results.forEach((item: any, idx: number) => {
          console.log(`Result ${idx}:`, {
            id: item.id,
            object: item.object,
            parent: item.parent
          });
        });

        // Filter for pages that are children of this database
        const databaseRows = response.results.filter((page: any) => {
          // Check both database_id and data_source_id parent types
          // Also normalize IDs by removing hyphens for comparison
          const normalizedDatabaseId = databaseId.replace(/-/g, '');
          const normalizedParentId = (page.parent?.database_id || page.parent?.data_source_id || '').replace(/-/g, '');

          const isChildOfDatabase =
            (page.parent?.type === 'database_id' || page.parent?.type === 'data_source_id') &&
            normalizedParentId === normalizedDatabaseId;

          if (isChildOfDatabase) {
            console.log('✓ Found database row:', page.properties?.title?.title?.[0]?.plain_text || page.id);
          }

          return isChildOfDatabase;
        });

        console.log('Filtered to database rows:', databaseRows.length);

        // Process rows
        databaseRows.forEach((page: any, idx: number) => {
          if ('properties' in page) {
            if (idx === 0) {
              // Debug first row to see property structure
              console.log('First row properties:', JSON.stringify(page.properties, null, 2));
            }

            const rowData: Record<string, string> = {};
            Object.entries(page.properties).forEach(([name, property]) => {
              const value = extractPropertyValue(property);
              rowData[name] = value;
              if (idx === 0) {
                console.log(`  ${name}: "${value}" (type: ${(property as any)?.type})`);
              }
            });

            rows.push({
              id: page.id,
              properties: rowData
            });
          }
        });

        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
        pageCount++;
      } catch (queryError: any) {
        console.error('Error searching for database rows:', queryError);
        throw new Error(`Failed to query database rows: ${queryError.message}`);
      }
    }

    console.log(`Fetched ${rows.length} rows from database`);

    return {
      type: 'database',
      id: rawDatabaseId,
      title,
      schema,
      rows,
      firstRow: rows[0],
      rowCount: rows.length,
      icon
    };
  } catch (error: any) {
    console.error('Error fetching Notion database:', error);

    if (error.code === 'object_not_found') {
      throw new Error(
        'Database not found. To fix: (1) Open the database in Notion, (2) Click "..." menu → "Connections" or "Add connections", (3) Add your integration to that database.'
      );
    } else if (error.code === 'unauthorized') {
      throw new Error('Invalid Notion token. Make sure you copied the entire "Internal Integration Secret" from notion.so/my-integrations');
    } else if (error.code === 'restricted_resource') {
      throw new Error('Access restricted. Open the database in Notion, click "..." → "Add connections", and select your integration.');
    }

    throw new Error(`Failed to fetch Notion database: ${error.message}`);
  }
}

/**
 * Fetch a Notion page with all its content blocks
 */
export async function fetchNotionPage(pageUrl: string, token: string): Promise<NotionPageData> {
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
      type: 'page',
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
      // Resource is a database, not a page - let caller handle this
      throw error;
    }

    throw new Error(`Failed to fetch Notion page: ${error.message}`);
  }
}

/**
 * Fetch a Notion resource (page or database) automatically detecting the type
 */
export async function fetchNotionResource(url: string, token: string): Promise<NotionResourceData> {
  try {
    const resourceId = extractPageId(url);
    const resourceType = await detectResourceType(resourceId, token);

    if (resourceType === 'database') {
      return await fetchNotionDatabase(url, token);
    } else {
      return await fetchNotionPage(url, token);
    }
  } catch (error: any) {
    console.error('Error fetching Notion resource:', error);
    throw error;
  }
}
