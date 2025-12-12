# Implementation Plan: Notion → Branded PDF Exporter

## Task Checklist

### Phase 1: Project Foundation
- [ ] Set up project structure (frontend + backend directories)
- [ ] Initialize backend: Node.js + Express + TypeScript
- [ ] Initialize frontend: React + TypeScript + Vite
- [ ] Install backend dependencies (express, @notionhq/client, puppeteer, cors)
- [ ] Install frontend dependencies (react, react-dom, axios/fetch client)
- [ ] Add environment variables and .env configuration

### Phase 2: Backend Core (Day 1-2)
- [ ] Create backend: notionService.ts for Notion API integration
- [ ] Create backend: templateRenderer.ts for Notion blocks → HTML conversion
- [ ] Create backend: pdfGenerator.ts for Puppeteer PDF generation
- [ ] Create backend API route: POST /api/notion/fetch
- [ ] Create backend API route: POST /api/pdf/generate
- [ ] Set up Express server with CORS and error handling

### Phase 3: Frontend UI (Day 2-3)
- [ ] Create frontend: api.ts service for backend communication
- [ ] Create frontend: NotionUrlInput.tsx component
- [ ] Create frontend: LetterheadEditor.tsx component (logo upload + contact info)
- [ ] Create frontend: PropertyFilter.tsx component
- [ ] Create frontend: DownloadButton.tsx component
- [ ] Create frontend: App.tsx with state management and user flow

### Phase 4: Testing & Polish (Day 3)
- [ ] Test Notion API integration with sample pages
- [ ] Test PDF generation with letterhead and branding
- [ ] Test complete user flow (URL → branding → filter → download)
- [ ] Add error handling for invalid URLs and API failures
- [ ] Create README with setup instructions

## Detailed Implementation Guide

### Phase 1: Project Foundation

**Directory Structure:**
```
notion_pdf_export/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── templates/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── .env
├── ARCHITECTURE.md
└── README.md
```

**Backend Dependencies:**
- express
- @notionhq/client
- puppeteer
- cors
- dotenv
- typescript
- @types/express
- @types/node
- ts-node

**Frontend Dependencies:**
- react
- react-dom
- typescript
- vite
- @vitejs/plugin-react

### Phase 2: Backend Core

**Priority Order:**
1. **notionService.ts** - Fetch page data from Notion API
2. **templateRenderer.ts** - Convert Notion blocks to HTML
3. **pdfGenerator.ts** - Generate PDF with Puppeteer
4. **API Routes** - Expose endpoints
5. **Express Server** - Wire everything together

**Key Implementation Details:**

**notionService.ts:**
- Use `@notionhq/client` to fetch page metadata
- Fetch all blocks from the page
- Return structured data with properties and blocks

**templateRenderer.ts:**
- Support block types: paragraph, heading_1, heading_2, heading_3, bulleted_list_item, numbered_list_item
- Convert each block to HTML string
- Handle rich text formatting (bold, italic, links)

**pdfGenerator.ts:**
- Use Puppeteer to render HTML
- Inject letterhead at top (logo + contact info)
- Filter out hidden properties
- Generate A4 PDF with proper margins
- Return binary PDF buffer

**API Endpoints:**
- `POST /api/notion/fetch` - Fetch Notion page content
- `POST /api/pdf/generate` - Generate branded PDF

### Phase 3: Frontend UI

**Component Order (User Flow):**
1. **NotionUrlInput.tsx** - Step 1: URL + token input
2. **LetterheadEditor.tsx** - Step 2: Logo upload + contact info
3. **PropertyFilter.tsx** - Step 3: Show/hide properties
4. **DownloadButton.tsx** - Step 4: Generate & download

**App.tsx State Management:**
```typescript
{
  notionUrl: string
  notionToken: string
  pageData: NotionPageData | null
  letterhead: LetterheadData
  hiddenProperties: string[]
  currentStep: number
}
```

**User Flow:**
1. Enter Notion URL + integration token → Fetch page
2. Upload logo + enter contact info
3. Select which properties to hide
4. Click "Generate PDF" → Download

### Phase 4: Testing & Polish

**Test Cases:**
- [ ] Fetch public Notion page
- [ ] Fetch page with integration token
- [ ] Render paragraph, heading, list blocks correctly
- [ ] Logo uploads and displays in PDF
- [ ] Contact info formats properly
- [ ] Properties filter correctly (show/hide)
- [ ] PDF downloads successfully
- [ ] Handle 404 for invalid Notion URLs
- [ ] Handle API rate limits gracefully

**Error Handling:**
- Invalid Notion URL format
- Invalid page ID
- Missing/invalid Notion token
- API rate limits
- Unsupported block types (graceful fallback)
- Network errors

## Environment Variables

```env
# .env
PORT=3000
NODE_ENV=development
NOTION_CLIENT_ID=xxx          # For future OAuth
NOTION_CLIENT_SECRET=xxx      # For future OAuth
```

## MVP Limitations (Intentional)
- No user accounts (pass token per-request)
- No template storage (re-enter letterhead each time)
- Basic block support only (paragraph, headings, lists)
- Single page only (no multi-page support)
- No caching (fresh API calls each time)
- Local generation only (PDFs not persisted)

## Post-MVP Features (DO NOT BUILD YET)
- User accounts + saved templates
- OAuth integration
- Complex blocks (databases, callouts, images)
- Batch export (multiple pages)
- Custom CSS styling
- Template marketplace

## Success Metrics
- Page fetch success rate
- PDF generation time (target: <5 seconds)
- Error rate by block type
- User dropoff point in flow

## Development Timeline
- **Day 1:** Notion API integration + basic block rendering
- **Day 2:** PDF generation + letterhead injection
- **Day 3:** Frontend UI + polish + deployment

## Next Steps
Start with Phase 1 (project setup) and Phase 2 (backend services), since frontend depends on working API endpoints.
