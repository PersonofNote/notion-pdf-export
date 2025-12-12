MVP Architecture: Notion Branded PDF Exporter
Product Overview
Web application that converts Notion pages into branded PDFs with custom letterheads, filtered properties, and company styling.
Tech Stack

Frontend: React + TypeScript (Vite)
Backend: Node.js + Express
PDF Generation: Puppeteer (HTML → PDF with precise layout control)
Notion Integration: @notionhq/client
Storage: Local filesystem (MVP), upgrade to S3 later
Auth: Simple API key initially, OAuth for scale

Core User Flow

User pastes Notion page URL
User uploads logo image + enters contact info (letterhead content)
User selects which properties to hide (creator, dates, etc.)
Click "Generate PDF"
System fetches Notion content, renders HTML with branding, exports PDF
User downloads branded PDF

System Architecture
Components
1. Frontend (/client)
src/
├── components/
│   ├── NotionUrlInput.tsx          # Step 1: URL input with validation
│   ├── LetterheadEditor.tsx        # Step 2: Logo upload + contact info
│   ├── PropertyFilter.tsx          # Step 3: Checkboxes for property visibility
│   ├── PdfPreview.tsx              # Live preview of PDF layout
│   └── DownloadButton.tsx          # Trigger generation + download
├── services/
│   └── api.ts                      # API client for backend calls
└── App.tsx                         # Main routing/state management
2. Backend (/server)
src/
├── routes/
│   ├── notion.ts                   # POST /api/notion/fetch - get page content
│   └── pdf.ts                      # POST /api/pdf/generate - create PDF
├── services/
│   ├── notionService.ts            # Notion API wrapper
│   ├── pdfGenerator.ts             # Puppeteer PDF generation
│   └── templateRenderer.ts         # Convert Notion blocks → HTML
├── templates/
│   └── letterhead.html             # HTML template with {{variables}}
└── server.ts                       # Express app setup
Data Flow
[User Input] 
    ↓
[Frontend: Collect URL + branding]
    ↓
[POST /api/notion/fetch]
    ↓
[notionService: Fetch page via Notion API]
    ↓
[Return: Notion blocks + metadata]
    ↓
[Frontend: Display property filter options]
    ↓
[POST /api/pdf/generate with filtered properties]
    ↓
[templateRenderer: Convert Notion blocks → HTML]
    ↓
[Inject letterhead (logo + contact) into HTML]
    ↓
[Puppeteer: Render HTML → PDF]
    ↓
[Return: PDF file stream]
    ↓
[Frontend: Trigger download]
API Endpoints
POST /api/notion/fetch
Request:
json{
  "pageUrl": "https://notion.so/page-id",
  "notionToken": "user's integration token"
}
Response:
json{
  "pageId": "abc123",
  "title": "Invoice Template",
  "properties": {
    "Created by": "John Doe",
    "Created time": "2024-01-15",
    "Status": "Active"
  },
  "blocks": [/* Notion block objects */]
}
POST /api/pdf/generate
Request:
json{
  "pageId": "abc123",
  "blocks": [/* filtered Notion blocks */],
  "letterhead": {
    "logoUrl": "data:image/png;base64,...",
    "companyName": "Acme Corp",
    "address": "123 Main St",
    "phone": "(555) 123-4567",
    "email": "info@acme.com"
  },
  "hiddenProperties": ["Created by", "Created time"],
  "notionToken": "user's integration token"
}
```

**Response:**
```
Content-Type: application/pdf
[Binary PDF data]
Key Implementation Details
Notion API Integration
typescript// services/notionService.ts
import { Client } from '@notionhq/client';

export async function fetchPage(pageId: string, token: string) {
  const notion = new Client({ auth: token });
  
  // Get page metadata
  const page = await notion.pages.retrieve({ page_id: pageId });
  
  // Get all blocks (content)
  const blocks = await notion.blocks.children.list({ 
    block_id: pageId 
  });
  
  return { page, blocks: blocks.results };
}
PDF Generation
typescript// services/pdfGenerator.ts
import puppeteer from 'puppeteer';
import { renderTemplate } from './templateRenderer';

export async function generatePdf(data: PdfRequest) {
  // Render Notion blocks to HTML
  const contentHtml = renderTemplate(data.blocks);
  
  // Inject letterhead
  const fullHtml = `
    <html>
      <head><style>${letterheadStyles}</style></head>
      <body>
        <div class="letterhead">
          <img src="${data.letterhead.logoUrl}" />
          <div class="contact">
            ${data.letterhead.companyName}<br/>
            ${data.letterhead.address}<br/>
            ${data.letterhead.phone}
          </div>
        </div>
        <div class="content">${contentHtml}</div>
      </body>
    </html>
  `;
  
  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(fullHtml);
  const pdf = await page.pdf({ 
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm' }
  });
  await browser.close();
  
  return pdf;
}
Template Rendering
typescript// services/templateRenderer.ts
export function renderTemplate(blocks: NotionBlock[]) {
  return blocks.map(block => {
    switch(block.type) {
      case 'paragraph':
        return `<p>${block.paragraph.rich_text[0]?.plain_text}</p>`;
      case 'heading_1':
        return `<h1>${block.heading_1.rich_text[0]?.plain_text}</h1>`;
      case 'heading_2':
        return `<h2>${block.heading_2.rich_text[0]?.plain_text}</h2>`;
      case 'bulleted_list_item':
        return `<li>${block.bulleted_list_item.rich_text[0]?.plain_text}</li>`;
      // Add more block types as needed
      default:
        return '';
    }
  }).join('\n');
}
```

## MVP Limitations (Intentional)
- **No user accounts**: Pass Notion token per-request
- **No template storage**: Re-enter letterhead each time
- **Basic block support**: Paragraph, headings, lists only (no databases, embeds)
- **Single page only**: No multi-page or linked page support
- **No caching**: Fresh API calls each time
- **Local file storage**: PDFs not persisted (generate on demand)

## Post-MVP Enhancements (Do NOT build these yet)

### High Priority
- **Database support** - Export Notion databases as formatted tables in PDF (see IMPLEMENTATION_PLAN.md for detailed plan)
  - Fetch database rows via `notion.databases.query()`
  - Render as HTML tables with column filtering
  - Handle pagination for large databases
  - Support landscape orientation for wide tables

### Medium Priority
- **OAuth integration** - One-click "Connect with Notion" instead of manual token entry (see IMPLEMENTATION_PLAN.md for detailed plan)
  - Implement OAuth 2.0 flow with Notion API
  - Session-based token storage with express-session
  - Optional: Database for persistent storage
  - Backward compatible with manual token option
  - Estimated: 8-10 hours (session-only) or 15-22 hours (with database)
- User accounts + saved templates (requires OAuth + database)
- Support for complex blocks (callouts, images, embeds)
- Batch export (multiple pages → single PDF)

### Lower Priority
- Custom CSS styling beyond letterhead
- Template marketplace

## Environment Variables
```
# .env
NOTION_CLIENT_ID=xxx          # For future OAuth
NOTION_CLIENT_SECRET=xxx      # For future OAuth
PORT=3000
NODE_ENV=development
Deployment (MVP)

Frontend: Vercel/Netlify
Backend: Railway/Render (needs Puppeteer support)
Estimated cost: $0-5/month initially

Success Metrics (Track These)

Page fetch success rate
PDF generation time (target: <5 seconds)
Error rate by block type (identify unsupported blocks)
User dropoff point in flow

Development Timeline

Day 1: Notion API integration + basic block rendering
Day 2: PDF generation + letterhead injection
Day 3: Frontend UI + polish + deployment

Testing Checklist

 Fetch public Notion page
 Fetch page with integration token
 Render paragraph, heading, list blocks correctly
 Logo uploads and displays in PDF
 Contact info formats properly
 Properties filter correctly (show/hide)
 PDF downloads successfully
 Handle 404 for invalid Notion URLs
 Handle API rate limits gracefully


Ready to hand off? Agent should start with Notion API exploration and basic block → HTML conversion before touching PDF generation.