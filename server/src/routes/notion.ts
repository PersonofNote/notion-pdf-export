import express, { Request, Response } from 'express';
import { fetchNotionPage } from '../services/notionService';
import { Client } from '@notionhq/client';

const router = express.Router();

/**
 * POST /api/notion/fetch
 * Fetch Notion page content and metadata
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

    // Fetch page from Notion
    const pageData = await fetchNotionPage(pageUrl, notionToken);

    return res.json(pageData);
  } catch (error: any) {
    console.error('Error in /api/notion/fetch:', error);

    return res.status(500).json({
      error: error.message || 'Failed to fetch Notion page',
    });
  }
});

/**
 * GET /api/notion/pages
 * Get list of pages accessible to the authenticated user
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

    // Search for all pages the integration has access to
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
      page_size: 100, // Get up to 100 pages
    });

    // Format the results
    const pages = response.results.map((page: any) => {
      // Extract title from page properties
      let title = 'Untitled';
      if (page.properties) {
        // Find the title property
        const titleProp = Object.values(page.properties).find(
          (prop: any) => prop.type === 'title'
        ) as any;

        if (titleProp?.title && titleProp.title.length > 0) {
          title = titleProp.title.map((t: any) => t.plain_text).join('');
        }
      }

      return {
        id: page.id,
        title,
        url: page.url,
        lastEditedTime: page.last_edited_time,
        icon: page.icon,
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
