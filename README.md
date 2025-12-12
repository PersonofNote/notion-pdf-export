# Notion Branded PDF Exporter

Web application that converts Notion pages into branded PDFs with custom letterheads, filtered properties, and company styling.

## Project Overview

This tool allows users to:
1. Paste a Notion page URL
2. Upload a logo and add contact information (letterhead)
3. Select which properties to hide (creator, dates, etc.)
4. Generate and download a professionally branded PDF

## Tech Stack

**Frontend:** React + TypeScript + Vite
**Backend:** Node.js + Express + TypeScript
**PDF Generation:** Puppeteer
**Notion Integration:** @notionhq/client

## Project Structure

```
notion_pdf_export/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client services
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic (Notion, PDF generation)
│   │   ├── templates/     # HTML templates for PDF
│   │   └── server.ts      # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── ARCHITECTURE.md         # Detailed architecture documentation
├── IMPLEMENTATION_PLAN.md  # Development checklist
└── README.md              # This file
```

## Development Status

### ✅ Phase 1: Project Foundation - COMPLETE
- [x] Project structure setup (client + server directories)
- [x] Backend initialized (Node.js + Express + TypeScript)
- [x] Frontend initialized (React + Vite + TypeScript)
- [x] Backend dependencies installed (Express, Notion client, Puppeteer, CORS)
- [x] Frontend dependencies installed (React, Vite, TypeScript)
- [x] Environment variables configured

### ✅ Phase 2: Backend Core - COMPLETE
- [x] Notion API service integration (notionService.ts)
- [x] Template renderer (Notion blocks → HTML) (templateRenderer.ts)
- [x] PDF generator (Puppeteer) (pdfGenerator.ts)
- [x] API routes (/api/notion/fetch, /api/pdf/generate)
- [x] Express server with CORS and error handling

### 🚧 Phase 3: Frontend UI - IN PROGRESS
- [x] API service client (native fetch) (api.ts)
- [x] NotionUrlInput component (Step 1: URL + token input)
- [x] LetterheadEditor component (Step 2: Logo + contact info)
- [x] PropertyFilter component (Step 3: Show/hide properties)
- [x] DownloadButton component (Step 4: Generate & download)
- [ ] App.tsx with state management (orchestrating all components)

### 📋 Phase 4: Testing & Polish - UPCOMING
- [ ] Integration testing
- [ ] Error handling
- [ ] Documentation updates

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A Notion account with integration token (for testing)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

### Frontend Setup
*(Coming soon - will be added when frontend is initialized)*

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Notion API (for future OAuth)
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
```

## Development Workflow

### Running Locally

**Backend (Server):**
```bash
cd server
npm run dev
```

**Frontend (Client):**
```bash
cd client
npm run dev
```

### Building for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
```

## API Endpoints

### `POST /api/notion/fetch`
Fetch Notion page content and metadata.

**Request:**
```json
{
  "pageUrl": "https://notion.so/page-id",
  "notionToken": "secret_xxxxx"
}
```

**Response:**
```json
{
  "pageId": "abc123",
  "title": "Page Title",
  "properties": {
    "Created by": "John Doe",
    "Created time": "2024-01-15"
  },
  "blocks": [...]
}
```

### `POST /api/pdf/generate`
Generate a branded PDF from Notion content.

**Request:**
```json
{
  "pageId": "abc123",
  "blocks": [...],
  "letterhead": {
    "logoUrl": "data:image/png;base64,...",
    "companyName": "Acme Corp",
    "address": "123 Main St",
    "phone": "(555) 123-4567",
    "email": "info@acme.com"
  },
  "hiddenProperties": ["Created by", "Created time"],
  "notionToken": "secret_xxxxx"
}
```

**Response:**
Binary PDF file

## MVP Limitations

This is an MVP with intentional scope limits:
- ❌ No user accounts (token passed per-request)
- ❌ No template storage (re-enter letterhead each time)
- ❌ Basic block support only (paragraphs, headings, lists)
- ❌ Single page only (no multi-page support)
- ❌ No caching (fresh API calls each time)
- ❌ PDFs generated on-demand (not persisted)

## Troubleshooting

### Common Issues

**"Cannot find module" errors:**
```bash
cd server
npm install
```

**TypeScript compilation errors:**
```bash
cd server
npm run build
```

**Port already in use:**
Change `PORT` in `.env` to a different value (e.g., 3001)

## Contributing

This is a client project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved
