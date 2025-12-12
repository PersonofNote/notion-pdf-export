import express, { Request, Response } from 'express';
import { fetchNotionPage } from '../services/notionService';

const router = express.Router();

/**
 * POST /api/notion/fetch
 * Fetch Notion page content and metadata
 */
router.post('/fetch', async (req: Request, res: Response) => {
  try {
    const { pageUrl, notionToken } = req.body;

    // Validation
    if (!pageUrl) {
      return res.status(400).json({
        error: 'Missing required field: pageUrl',
      });
    }

    if (!notionToken) {
      return res.status(400).json({
        error: 'Missing required field: notionToken',
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
