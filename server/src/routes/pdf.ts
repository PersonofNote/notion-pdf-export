import express, { Request, Response } from 'express';
import { generatePdf, type PdfGenerationRequest } from '../services/pdfGenerator';
import archiver from 'archiver';

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

/**
 * POST /api/pdf/batch
 * Generate multiple PDFs and return as a zip file
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { pages, letterhead, hiddenProperties } = req.body;

    // Validation
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid field: pages must be a non-empty array',
      });
    }

    if (!letterhead || !letterhead.companyName) {
      return res.status(400).json({
        error: 'Missing required field: letterhead.companyName',
      });
    }

    console.log(`Generating ${pages.length} PDFs...`);

    // Generate all PDFs
    const pdfBuffers: { filename: string; buffer: Buffer }[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pdfRequest: PdfGenerationRequest = {
        title: page.title || `Untitled-${i + 1}`,
        blocks: page.blocks,
        letterhead,
        properties: page.properties || {},
        hiddenProperties: hiddenProperties || [],
      };

      const pdfBuffer = await generatePdf(pdfRequest);

      // Sanitize filename
      const sanitizedTitle = (page.title || `Untitled-${i + 1}`)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      pdfBuffers.push({
        filename: `${sanitizedTitle}.pdf`,
        buffer: pdfBuffer,
      });

      console.log(`Generated PDF ${i + 1}/${pages.length}: ${page.title}`);
    }

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Set response headers for zip download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="notion-exports.zip"');

    // Pipe archive to response
    archive.pipe(res);

    // Add all PDFs to archive
    for (const { filename, buffer } of pdfBuffers) {
      archive.append(buffer, { name: filename });
    }

    // Finalize archive
    await archive.finalize();

    console.log(`Zip file created with ${pdfBuffers.length} PDFs`);
  } catch (error: any) {
    console.error('Error in /api/pdf/batch:', error);

    return res.status(500).json({
      error: error.message || 'Failed to generate PDFs',
    });
  }
});

export default router;
