import puppeteer from 'puppeteer';
import { renderBlocks, getStyles } from './templateRenderer';
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

export interface LetterheadData {
  logoUrl?: string;
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PdfGenerationRequest {
  title: string;
  blocks: (BlockObjectResponse | PartialBlockObjectResponse)[];
  letterhead: LetterheadData;
  properties?: Record<string, string>;
  hiddenProperties?: string[];
}

/**
 * Generate letterhead HTML
 */
function generateLetterheadHtml(letterhead: LetterheadData): string {
  return `
    <div class="letterhead">
      <div class="letterhead-content">
        ${letterhead.logoUrl ? `<img src="${letterhead.logoUrl}" alt="Logo" class="letterhead-logo" />` : ''}
        <div class="letterhead-info">
          <div class="company-name">${letterhead.companyName}</div>
          ${letterhead.address ? `<div class="contact-line">${letterhead.address}</div>` : ''}
          <div class="contact-line">
            ${letterhead.phone ? `<span>${letterhead.phone}</span>` : ''}
            ${letterhead.phone && letterhead.email ? ' • ' : ''}
            ${letterhead.email ? `<span>${letterhead.email}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="letterhead-divider"></div>
    </div>
  `;
}

/**
 * Generate properties HTML (filtered based on hiddenProperties)
 */
function generatePropertiesHtml(
  properties?: Record<string, string>,
  hiddenProperties: string[] = []
): string {
  if (!properties || Object.keys(properties).length === 0) {
    return '';
  }

  const visibleProperties = Object.entries(properties).filter(
    ([key]) => !hiddenProperties.includes(key) && key !== 'title'
  );

  if (visibleProperties.length === 0) {
    return '';
  }

  const propertyRows = visibleProperties
    .map(([key, value]) => `
      <div class="property-row">
        <span class="property-label">${key}:</span>
        <span class="property-value">${value}</span>
      </div>
    `)
    .join('');

  return `
    <div class="properties-section">
      ${propertyRows}
    </div>
  `;
}

/**
 * Generate complete HTML document
 */
function generateHtmlDocument(request: PdfGenerationRequest): string {
  const letterheadHtml = generateLetterheadHtml(request.letterhead);
  const propertiesHtml = generatePropertiesHtml(request.properties, request.hiddenProperties);
  const contentHtml = renderBlocks(request.blocks);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${request.title}</title>
      ${getStyles()}
      <style>
        .letterhead {
          margin-bottom: 2em;
        }

        .letterhead-content {
          display: flex;
          align-items: flex-start;
          gap: 1em;
        }

        .letterhead-logo {
          max-width: 120px;
          max-height: 80px;
          object-fit: contain;
        }

        .letterhead-info {
          flex: 1;
        }

        .company-name {
          font-size: 1.5em;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.3em;
        }

        .contact-line {
          font-size: 0.9em;
          color: #6b6b6b;
          margin: 0.2em 0;
        }

        .letterhead-divider {
          border-top: 2px solid #e0e0e0;
          margin-top: 1em;
        }

        .properties-section {
          background: #f9f9f9;
          border: 1px solid #e9e9e7;
          border-radius: 4px;
          padding: 1em;
          margin: 1.5em 0;
        }

        .property-row {
          display: flex;
          margin: 0.4em 0;
          font-size: 0.9em;
        }

        .property-label {
          font-weight: 600;
          color: #6b6b6b;
          min-width: 140px;
        }

        .property-value {
          color: #37352f;
        }

        .page-title {
          font-size: 2.5em;
          font-weight: 700;
          margin: 0.5em 0 1em 0;
          color: #1a1a1a;
        }
      </style>
    </head>
    <body>
      ${letterheadHtml}
      ${request.title && request.title !== 'Untitled' ? `<h1 class="page-title">${request.title}</h1>` : ''}
      ${propertiesHtml}
      <div class="content">
        ${contentHtml}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF from request data
 */
export async function generatePdf(request: PdfGenerationRequest): Promise<Buffer> {
  let browser;

  try {
    // Generate HTML
    const html = generateHtmlDocument(request);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdf);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
