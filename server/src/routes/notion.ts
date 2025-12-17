import express, { Request, Response } from 'express';
import { fetchNotionPage } from '../services/notionService';

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

export default router;
