# Notion PDF Exporter - Frontend

React + TypeScript frontend for the Notion Branded PDF Exporter application.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling

## Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── NotionUrlInput.tsx
│   │   ├── LetterheadEditor.tsx
│   │   ├── PropertyFilter.tsx
│   │   └── DownloadButton.tsx
│   ├── services/            # API client services
│   │   └── api.ts
│   ├── App.tsx              # Main application component
│   ├── App.css
│   ├── main.tsx             # Application entry point
│   └── index.css
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend communicates with the backend API running on `http://localhost:3000`.

Vite is configured to proxy `/api` requests to the backend server during development.

### API Endpoints Used

- `POST /api/notion/fetch` - Fetch Notion page content
- `POST /api/pdf/generate` - Generate branded PDF

## Components

### NotionUrlInput.tsx
Step 1 of the user flow. Handles:
- Notion URL input and validation
- Notion integration token input
- Fetching page data from the backend

### LetterheadEditor.tsx
Step 2 of the user flow. Handles:
- Logo image upload (converts to base64)
- Company contact information form
  - Company name
  - Address
  - Phone number
  - Email

### PropertyFilter.tsx
Step 3 of the user flow. Handles:
- Displaying available Notion page properties
- Checkboxes to show/hide properties in PDF
- Properties like "Created by", "Created time", "Status", etc.

### DownloadButton.tsx
Step 4 of the user flow. Handles:
- Triggering PDF generation
- Downloading the generated PDF file
- Loading states and error handling

## State Management

Application state is managed in `App.tsx` using React hooks:

```typescript
{
  notionUrl: string              // Notion page URL
  notionToken: string            // User's integration token
  pageData: NotionPageData | null  // Fetched page data
  letterhead: LetterheadData     // Logo and contact info
  hiddenProperties: string[]     // Properties to exclude from PDF
  currentStep: number            // Current step (1-4)
}
```

## User Flow

1. **Enter Notion URL** → User pastes Notion page URL and integration token
2. **Configure Letterhead** → User uploads logo and enters contact information
3. **Filter Properties** → User selects which page properties to hide
4. **Generate PDF** → User clicks generate and downloads the branded PDF

## Development Status

### ✅ Completed
- [x] Vite + React + TypeScript setup
- [x] Project structure
- [x] Development server configuration
- [x] API proxy configuration

### 🚧 In Progress
- [ ] Component development (NotionUrlInput, LetterheadEditor, etc.)
- [ ] API service client
- [ ] State management in App.tsx

### 📋 Upcoming
- [ ] Styling and UI polish
- [ ] Error handling and validation
- [ ] Loading states
- [ ] Responsive design

## Environment Variables

Create a `.env` file if needed for frontend configuration:

```env
VITE_API_URL=http://localhost:3000
```

Access in code with `import.meta.env.VITE_API_URL`

## TypeScript

The project uses strict TypeScript configuration. Type definitions for:
- React components
- API request/response types
- Application state
- Notion data structures

## Troubleshooting

### Port already in use
If port 5173 is taken, Vite will automatically try the next available port.

### API requests failing
Make sure the backend server is running on `http://localhost:3000`

### Hot reload not working
Try restarting the dev server with `npm run dev`

## Contributing

This is a client project. Follow the implementation plan in the root `IMPLEMENTATION_PLAN.md`.

## License

Proprietary - All rights reserved
