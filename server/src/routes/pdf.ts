import express, { Request, Response } from 'express';
import { generatePdf, type PdfGenerationRequest } from '../services/pdfGenerator';

const router = express.Router();

/**
 * POST /api/pdf/generate
 * Generate a branded PDF from Notion content
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { title, blocks, letterhead, properties, hiddenProperties } = req.body;

    // Validation
    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({
        error: 'Missing or invalid field: blocks must be an array',
      });
    }

    if (!letterhead || !letterhead.companyName) {
      return res.status(400).json({
        error: 'Missing required field: letterhead.companyName',
      });
    }

    // Prepare request
    const pdfRequest: PdfGenerationRequest = {
      title: title || 'Untitled',
      blocks,
      letterhead,
      properties: properties || {},
      hiddenProperties: hiddenProperties || [],
    };

    // Generate PDF
    const pdfBuffer = await generatePdf(pdfRequest);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(title || 'notion-export')}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error in /api/pdf/generate:', error);

    return res.status(500).json({
      error: error.message || 'Failed to generate PDF',
    });
  }
});

export default router;
