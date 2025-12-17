import express, { Request, Response } from 'express';
import { fetchNotionResource } from '../services/notionService';
import { Client } from '@notionhq/client';

const router = express.Router();

/**
 * POST /api/notion/fetch
 * Fetch Notion page or database content and metadata
 * Automatically detects whether the URL is a page or database
 */
router.post('/fetch', async (req: Request, res: Response) => {
  try {
    const { pageUrl, notionToken: bodyToken } = req.body;

    // Validation
    if (!pageUrl) {
      return res.status(400).json({
        error: 'Missing required field: pageUrl',
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

    // Fetch resource from Notion (page or database)
    const resourceData = await fetchNotionResource(pageUrl, notionToken);

    return res.json(resourceData);
  } catch (error: any) {
    console.error('Error in /api/notion/fetch:', error);

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
    const response = await notion.search({
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
      page_size: 100, // Get up to 100 items
    });

    // Format the results
    const pages = response.results.map((item: any) => {
      let title = 'Untitled';
      let type = item.object; // 'page' or 'database'

      if (type === 'database') {
        // Database title
        if (item.title && item.title.length > 0) {
          title = item.title.map((t: any) => t.plain_text).join('');
        }
      } else if (type === 'page' && item.properties) {
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
        type, // 'page' or 'database'
        lastEditedTime: item.last_edited_time,
        icon: item.icon,
      };
    });

    return res.json({
      pages,
      hasMore: response.has_more,
    });
  } catch (error: any) {
    console.error('Error in /api/notion/pages:', error);

    return res.status(500).json({
      error: error.message || 'Failed to fetch pages',
    });
  }
});

export default router;
