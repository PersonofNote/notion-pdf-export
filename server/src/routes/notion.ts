import express, { Request, Response } from 'express';
import { fetchNotionResource } from '../services/notionService';
import { Client } from '@notionhq/client';
import { validateNotionUrl, validateNotionToken } from '../utils/validation';
import { log } from '../utils/logger';

const router = express.Router();

/**
 * POST /api/notion/fetch
 * Fetch Notion page or database content and metadata
 * Automatically detects whether the URL is a page or database
 */
router.post('/fetch', async (req: Request, res: Response) => {
  try {
    const { pageUrl, notionToken: bodyToken } = req.body;

    // Validate page URL
    const urlValidation = validateNotionUrl(pageUrl);
    if (!urlValidation.valid) {
      return res.status(400).json({
        error: 'Invalid page URL',
        message: urlValidation.error,
      });
    }

    // Get token from session or request body
    // Session token takes precedence (OAuth flow)
    const notionToken = req.session?.notionToken || bodyToken;

    if (!notionToken) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please provide a Notion token or authenticate via OAuth',
      });
    }

    // Validate token format if it's from request body
    if (bodyToken) {
      const tokenValidation = validateNotionToken(bodyToken);
      if (!tokenValidation.valid) {
        return res.status(400).json({
          error: 'Invalid token',
          message: tokenValidation.error,
        });
      }
    }

    // Fetch resource from Notion (page or database)
    const resourceData = await fetchNotionResource(pageUrl, notionToken);

    log.notionApi('Resource fetched successfully', { type: resourceData.type });
    return res.json(resourceData);
  } catch (error: any) {
    log.error('Error in /api/notion/fetch', error instanceof Error ? error : new Error(error));

    return res.status(500).json({
      error: error.message || 'Failed to fetch Notion resource',
    });
  }
});

/**
 * GET /api/notion/pages
 * Get list of pages and databases accessible to the authenticated user
 * Requires OAuth authentication (session token)
 */
router.get('/pages', async (req: Request, res: Response) => {
  try {
    // Get token from session (OAuth only)
    const notionToken = req.session?.notionToken;

    if (!notionToken) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please authenticate via OAuth to access this endpoint',
      });
    }

    // Initialize Notion client
    const notion = new Client({ auth: notionToken });

    // Search for all pages and databases the integration has access to
    // Fetch multiple pages to get more results
    const allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 5; // Fetch up to 500 items (100 per page)

    while (hasMore && pageCount < MAX_PAGES) {
      const response = await notion.search({
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
      pageCount++;
    }

    // Check if results were truncated
    const truncated = hasMore && pageCount >= MAX_PAGES;
    if (truncated) {
      log.warn('Pages/databases list truncated', {
        fetchedCount: allResults.length,
        limit: MAX_PAGES * 100,
      });
    }

    // Log what we're getting from Notion for debugging
    console.log('\n=== Notion Search Results ===');
    allResults.forEach((item: any, index: number) => {
      console.log(`\nItem ${index + 1}:`, {
        id: item.id,
        object: item.object,
        parent: item.parent,
        title: item.object === 'database'
          ? (item.title?.[0]?.plain_text || 'Untitled Database')
          : (item.properties?.title?.title?.[0]?.plain_text || 'Untitled')
      });
    });
    console.log('=== End Search Results ===\n');

    // Format the results, excluding database row pages
    const pages = allResults
      .filter((item: any) => {
        // Include databases and data sources (data_source is what Notion returns for databases)
        if (item.object === 'database' || item.object === 'data_source') {
          console.log(`✓ Including database/data_source: ${item.title?.[0]?.plain_text || item.title || 'Untitled'}`);
          return true;
        }

        // For pages, check if they're database rows
        if (item.object === 'page') {
          // Database rows have parent.type === 'data_source_id' or 'database_id'
          const isDatabaseRow =
            item.parent?.type === 'data_source_id' ||
            item.parent?.type === 'database_id';

          if (isDatabaseRow) {
            console.log(`✗ Excluding database row: ${item.properties?.title?.title?.[0]?.plain_text || 'Untitled'}`);
            return false;
          }

          console.log(`✓ Including page: ${item.properties?.title?.title?.[0]?.plain_text || 'Untitled'}`);
          return true;
        }

        // Exclude anything else
        console.log(`✗ Excluding unknown object type: ${item.object}`);
        return false;
      })
      .map((item: any) => {
        let title = 'Untitled';
        let type = item.object; // 'page', 'database', or 'data_source'

        // Normalize data_source to database for frontend consistency
        if (type === 'data_source') {
          type = 'database';
        }

        if (item.object === 'database' || item.object === 'data_source') {
          // Database/data_source title
          if (item.title && Array.isArray(item.title) && item.title.length > 0) {
            title = item.title.map((t: any) => t.plain_text).join('');
          } else if (typeof item.title === 'string' && item.title) {
            title = item.title;
          }
        } else if (item.object === 'page' && item.properties) {
          // Page title
          const titleProp = Object.values(item.properties).find(
            (prop: any) => prop.type === 'title'
          ) as any;

          if (titleProp?.title && titleProp.title.length > 0) {
            title = titleProp.title.map((t: any) => t.plain_text).join('');
          }
        }

        return {
          id: item.id,
          title,
          url: item.url,
          type, // 'page' or 'database' (data_source normalized to database)
          lastEditedTime: item.last_edited_time,
          icon: item.icon,
        };
      });

    log.notionApi('Fetched accessible pages', {
      count: pages.length,
      truncated,
    });

    return res.json({
      pages,
      hasMore: truncated,
      totalCount: allResults.length,
      truncated,
    });
  } catch (error: any) {
    log.error('Error in /api/notion/pages', error instanceof Error ? error : new Error(error));

    return res.status(500).json({
      error: error.message || 'Failed to fetch pages',
    });
  }
});

export default router;
