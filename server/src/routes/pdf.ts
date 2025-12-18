import express, { Request, Response } from 'express';
import { generatePdf, type PdfGenerationRequest } from '../services/pdfGenerator';
import { validateLetterheadData, validatePropertyArray } from '../utils/validation';
import archiver from 'archiver';

const router = express.Router();

/**
 * POST /api/pdf/generate
 * Generate a branded PDF from Notion content (page or database)
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { type, title, blocks, database, letterhead, properties, hiddenProperties, hiddenColumns } = req.body;

    // Validate letterhead
    const letterheadValidation = validateLetterheadData(letterhead);
    if (!letterheadValidation.valid) {
      return res.status(400).json({
        error: 'Invalid letterhead data',
        message: letterheadValidation.error,
      });
    }

    // Validate hidden properties if present
    if (type === 'page' && hiddenProperties) {
      const propsValidation = validatePropertyArray(hiddenProperties);
      if (!propsValidation.valid) {
        return res.status(400).json({
          error: 'Invalid hidden properties',
          message: propsValidation.error,
        });
      }
    }

    // Validate hidden columns if present
    if (type === 'database' && hiddenColumns) {
      const colsValidation = validatePropertyArray(hiddenColumns);
      if (!colsValidation.valid) {
        return res.status(400).json({
          error: 'Invalid hidden columns',
          message: colsValidation.error,
        });
      }
    }

    let pdfRequest: PdfGenerationRequest;
    let filename: string;

    if (type === 'database') {
      // Database PDF generation
      if (!database) {
        return res.status(400).json({
          error: 'Missing required field: database',
        });
      }

      pdfRequest = {
        type: 'database',
        database,
        letterhead: letterheadValidation.sanitized!,
        hiddenColumns: hiddenColumns || [],
      };

      filename = database.title || 'database-export';
    } else {
      // Page PDF generation (default)
      if (!blocks || !Array.isArray(blocks)) {
        return res.status(400).json({
          error: 'Missing or invalid field: blocks must be an array',
        });
      }

      pdfRequest = {
        type: 'page',
        title: title || 'Untitled',
        blocks,
        letterhead: letterheadValidation.sanitized!,
        properties: properties || {},
        hiddenProperties: hiddenProperties || [],
      };

      filename = title || 'notion-export';
    }

    // Generate PDF
    const pdfBuffer = await generatePdf(pdfRequest);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}.pdf"`
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
 * Supports both pages and databases
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { pages, letterhead, hiddenProperties, hiddenColumns } = req.body;

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
      const item = pages[i];
      let pdfRequest: PdfGenerationRequest;
      let title: string;

      if (item.type === 'database') {
        // Database item
        pdfRequest = {
          type: 'database',
          database: item,
          letterhead,
          hiddenColumns: hiddenColumns || [],
        };
        title = item.title || `Database-${i + 1}`;
      } else {
        // Page item (default)
        pdfRequest = {
          type: 'page',
          title: item.title || `Untitled-${i + 1}`,
          blocks: item.blocks,
          letterhead,
          properties: item.properties || {},
          hiddenProperties: hiddenProperties || [],
        };
        title = item.title || `Untitled-${i + 1}`;
      }

      const pdfBuffer = await generatePdf(pdfRequest);

      // Sanitize filename
      const sanitizedTitle = title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      pdfBuffers.push({
        filename: `${sanitizedTitle}.pdf`,
        buffer: pdfBuffer,
      });

      console.log(`Generated PDF ${i + 1}/${pages.length}: ${title}`);
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
