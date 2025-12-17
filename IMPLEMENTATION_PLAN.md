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

## Post-MVP Features

### Feature: Database Support (Priority: High)

**Goal:** Allow users to export Notion databases to PDF with formatted tables

**Current Limitation:**
- App returns error: "Provided ID is a database, not a page"
- Users must create linked database views or export individual rows

**Implementation Plan:**

#### Backend Changes

**1. Update notionService.ts**
- [ ] Add `fetchNotionDatabase()` function
  - Use `notion.databases.retrieve()` to get database metadata
  - Use `notion.databases.query()` to fetch all rows (handle pagination)
  - Extract database schema (column names, types)
  - Return structured data with rows and schema

- [ ] Add `detectResourceType()` helper
  - Try fetching as page first
  - If error.message includes "is a database", fetch as database instead
  - Return type: 'page' | 'database'

- [ ] Update `fetchNotionPage()` to handle both
  ```typescript
  export async function fetchNotionResource(url: string, token: string) {
    const resourceType = await detectResourceType(pageId, token);
    if (resourceType === 'database') {
      return await fetchNotionDatabase(pageId, token);
    }
    return await fetchNotionPage(pageId, token);
  }
  ```

**2. Create databaseRenderer.ts**
- [ ] Render database rows as HTML table
  ```typescript
  export function renderDatabaseTable(rows, schema): string
  ```
- [ ] Support column types:
  - Title, Text, Number
  - Select, Multi-select
  - Date, Checkbox
  - Person, URL, Email, Phone
- [ ] Add table styling (borders, headers, alternating rows)
- [ ] Handle long content (text wrapping, max widths)
- [ ] Support filtering/sorting if view info available

**3. Update pdfGenerator.ts**
- [ ] Detect if data is database vs page
- [ ] For databases:
  - Render database title
  - Render table with databaseRenderer
  - Apply letterhead above table
  - Handle wide tables (landscape orientation option?)
- [ ] Add pagination for large databases (split across pages)

**4. Update API routes**
- [ ] `POST /api/notion/fetch` - Return type: 'page' | 'database'
- [ ] Frontend can adjust UI based on type
- [ ] Database response includes: rows, schema, viewMetadata

#### Frontend Changes

**5. Update TypeScript types**
- [ ] Add `NotionDatabaseData` interface
  ```typescript
  interface NotionDatabaseData {
    databaseId: string;
    title: string;
    schema: DatabaseSchema;
    rows: DatabaseRow[];
    type: 'database';
  }
  ```

**6. Update PropertyFilter.tsx**
- [ ] For databases: Show database column toggles instead of properties
- [ ] Allow hiding specific columns from export
- [ ] Show column types (Title, Select, Date, etc.)

**7. Optional: Add DatabasePreview.tsx**
- [ ] Show preview of table before PDF generation
- [ ] Display first 10 rows
- [ ] Show which columns are visible/hidden

#### Technical Considerations

**Pagination:**
- Notion API returns max 100 results per query
- Need to handle pagination for large databases
- Consider max limit (e.g., 500 rows for MVP)

**Table Layout:**
- Wide databases may need landscape orientation
- Option to auto-rotate or warn user
- Column width calculation based on content

**Performance:**
- Database queries can be slow (100+ rows)
- Add loading progress indicator
- Consider streaming/chunking for very large databases

**Data Types:**
- Complex types (Relation, Rollup, Formula) need special handling
- Images in database cells - render as [Image] placeholder for MVP
- Files - render as links or placeholders

#### Testing Checklist
- [ ] Fetch database with 10 rows
- [ ] Fetch database with 100+ rows (pagination)
- [ ] Export database with all column types
- [ ] Hide specific columns
- [ ] Handle empty database
- [ ] Handle database with very wide tables
- [ ] Test with linked databases
- [ ] Test error handling for restricted databases

#### Estimated Effort
- Backend: 4-6 hours
- Frontend: 2-3 hours
- Testing: 2 hours
- **Total: ~8-11 hours**

---

### Feature: OAuth Integration (Priority: Medium)

**Goal:** Allow users to authenticate with Notion OAuth instead of manually creating integrations and pasting tokens

**Current Limitation:**
- Users must create a Notion integration at notion.so/my-integrations
- Users must manually share pages with the integration
- Users must copy/paste the secret token each time
- Token is not persisted between sessions

**Benefits of OAuth:**
- One-click "Connect with Notion" button
- Automatic page access (no manual sharing needed)
- Secure token storage
- Tokens persist across sessions
- Better user experience
- Can request specific permissions (read pages, read databases)

**Implementation Plan:**

#### Prerequisites

**1. Register Notion OAuth Application**
- [ ] Go to https://www.notion.so/my-integrations
- [ ] Create new integration (Public or Internal)
- [ ] Set OAuth redirect URI: `https://yourdomain.com/api/auth/notion/callback` (or `http://localhost:3000/api/auth/notion/callback` for dev)
- [ ] Note down:
  - OAuth client ID
  - OAuth client secret
  - Authorization URL
- [ ] Set required capabilities:
  - Read content
  - Read user information (optional, for personalization)

**2. Choose Storage Solution**
- [ ] For MVP: Use session storage or encrypted cookies
- [ ] For production: Use database (PostgreSQL, MongoDB, or Redis)
- [ ] Store: userId, accessToken, workspaceId, expiresAt (if tokens expire)

#### Backend Changes

**3. Add Authentication Dependencies**
```bash
npm install express-session
npm install @types/express-session --save-dev
# Optional: For encrypted storage
npm install bcrypt cookie-parser
npm install @types/bcrypt @types/cookie-parser --save-dev
```

**4. Create auth service (server/src/services/authService.ts)**
- [ ] `generateAuthUrl()` - Build Notion OAuth authorization URL
  ```typescript
  export function generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.NOTION_CLIENT_ID!,
      response_type: 'code',
      owner: 'user',
      state: state, // CSRF protection
      redirect_uri: process.env.NOTION_REDIRECT_URI!,
    });
    return `https://api.notion.com/v1/oauth/authorize?${params}`;
  }
  ```

- [ ] `exchangeCodeForToken()` - Exchange auth code for access token
  ```typescript
  export async function exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });
    return response.json();
  }
  ```

- [ ] `storeTokens()` - Save tokens securely
- [ ] `getStoredToken()` - Retrieve user's token
- [ ] `revokeToken()` - Handle logout/disconnect

**5. Create auth routes (server/src/routes/auth.ts)**
- [ ] `GET /api/auth/notion` - Initiate OAuth flow
  ```typescript
  router.get('/notion', (req, res) => {
    const state = generateRandomState(); // CSRF token
    req.session.oauthState = state;
    const authUrl = generateAuthUrl(state);
    res.redirect(authUrl);
  });
  ```

- [ ] `GET /api/auth/notion/callback` - Handle OAuth callback
  ```typescript
  router.get('/notion/callback', async (req, res) => {
    const { code, state } = req.query;

    // Verify state (CSRF protection)
    if (state !== req.session.oauthState) {
      return res.status(400).send('Invalid state');
    }

    // Exchange code for token
    const tokens = await exchangeCodeForToken(code);

    // Store tokens
    req.session.notionToken = tokens.access_token;
    req.session.workspaceId = tokens.workspace_id;

    // Redirect back to app
    res.redirect('/');
  });
  ```

- [ ] `POST /api/auth/logout` - Clear stored tokens
- [ ] `GET /api/auth/status` - Check if user is authenticated

**6. Update session middleware (server/src/server.ts)**
```typescript
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
}));
```

**7. Update existing API routes**
- [ ] Modify `/api/notion/fetch` to use session token if available
  ```typescript
  const token = req.session.notionToken || req.body.notionToken;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  ```
- [ ] Same for `/api/pdf/generate`

**8. Add TypeScript types**
```typescript
// Extend express-session
declare module 'express-session' {
  interface SessionData {
    notionToken?: string;
    workspaceId?: string;
    oauthState?: string;
  }
}

interface OAuthTokens {
  access_token: string;
  token_type: 'bearer';
  bot_id: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_icon?: string;
  owner: {
    type: 'user';
    user: NotionUser;
  };
}
```

#### Frontend Changes

**9. Update api.ts**
- [ ] Add `initiateOAuth()` - Redirect to `/api/auth/notion`
  ```typescript
  export function initiateOAuth(): void {
    window.location.href = '/api/auth/notion';
  }
  ```

- [ ] Add `checkAuthStatus()` - Check if user is authenticated
  ```typescript
  export async function checkAuthStatus(): Promise<{ authenticated: boolean }> {
    const response = await fetch('/api/auth/status');
    return response.json();
  }
  ```

- [ ] Add `logout()` - Clear session
  ```typescript
  export async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  }
  ```

- [ ] Update `fetchNotionPage()` - Don't require token parameter if authenticated
  ```typescript
  export async function fetchNotionPage(pageUrl: string, notionToken?: string) {
    const response = await fetch(`${API_BASE_URL}/notion/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUrl,
        notionToken, // Optional if session exists
      }),
      credentials: 'include', // Send cookies
    });
    return response.json();
  }
  ```

**10. Create OAuthButton component (client/src/components/OAuthButton.tsx)**
```tsx
import { initiateOAuth } from '../services/api';

export default function OAuthButton() {
  return (
    <button onClick={initiateOAuth} className="oauth-button">
      <svg>{/* Notion logo */}</svg>
      Connect with Notion
    </button>
  );
}
```

**11. Update NotionUrlInput.tsx**
- [ ] Add OAuth button as alternative to token input
- [ ] Show "Connected as [workspace]" if authenticated
- [ ] Add "Disconnect" button to clear session
- [ ] Layout:
  ```
  Option 1: Connect with Notion (Recommended)
  [Connect with Notion button]

  Option 2: Use Integration Token
  [Show manual token input - collapsed by default]
  ```

**12. Update App.tsx**
- [ ] Check auth status on mount
  ```typescript
  useEffect(() => {
    checkAuthStatus().then(({ authenticated }) => {
      setState(prev => ({ ...prev, authenticated }));
    });
  }, []);
  ```
- [ ] Skip token input if already authenticated
- [ ] Show user info in header (workspace name, disconnect button)

**13. Add AuthStatus component (client/src/components/AuthStatus.tsx)**
- [ ] Show current connection status
- [ ] Display workspace name/icon if connected
- [ ] "Disconnect" button

#### Security Considerations

**14. Security Checklist**
- [ ] **CSRF Protection**: Use state parameter in OAuth flow
- [ ] **Secure Cookies**: Set httpOnly, secure flags
- [ ] **Token Encryption**: Encrypt tokens at rest in database
- [ ] **HTTPS Only**: Enforce HTTPS in production
- [ ] **Session Expiry**: Implement token refresh or re-auth
- [ ] **Environment Variables**: Store secrets in .env (never commit)
- [ ] **Rate Limiting**: Add rate limiting to auth endpoints
- [ ] **Validate Redirects**: Whitelist allowed redirect URIs

#### Database Schema (If Using Database)

**15. Users/Sessions Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  notion_user_id VARCHAR(255) UNIQUE,
  workspace_id VARCHAR(255),
  workspace_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notion_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  access_token TEXT NOT NULL, -- Encrypted
  token_type VARCHAR(50),
  bot_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- If tokens expire
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**16. Add database dependencies (if needed)**
```bash
# PostgreSQL
npm install pg
npm install @types/pg --save-dev

# Or MongoDB
npm install mongodb
npm install @types/mongodb --save-dev
```

#### Environment Variables

**17. Update .env**
```env
# Notion OAuth (from notion.so/my-integrations)
NOTION_CLIENT_ID=your_oauth_client_id
NOTION_CLIENT_SECRET=your_oauth_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback

# Session
SESSION_SECRET=generate_random_secret_key_here

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/notion_pdf_exporter
```

#### Testing Checklist

- [ ] OAuth flow works end-to-end
- [ ] State validation prevents CSRF attacks
- [ ] Tokens stored securely (encrypted)
- [ ] Session persists across page refreshes
- [ ] Logout clears session properly
- [ ] Error handling for OAuth failures (user denies, invalid code)
- [ ] Works with both OAuth and manual token (backward compatible)
- [ ] Multiple users can authenticate independently
- [ ] Token refresh works (if implementing)
- [ ] HTTPS redirect works in production

#### Migration Plan

**18. Backward Compatibility**
- [ ] Keep manual token option available
- [ ] Support both OAuth and manual tokens simultaneously
- [ ] Don't break existing users who use manual tokens
- [ ] Add feature flag to toggle OAuth on/off

**19. User Communication**
- [ ] Add banner: "New! Connect with Notion for easier access"
- [ ] Update README with OAuth instructions
- [ ] Add OAuth setup guide to docs

#### Deployment Considerations

**20. Production Setup**
- [ ] Register production OAuth app at notion.so
- [ ] Set production redirect URI
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up database (if using persistent storage)
- [ ] Enable secure cookies
- [ ] Add monitoring for auth failures
- [ ] Implement token refresh strategy

#### Estimated Effort

- **Backend OAuth Flow**: 4-6 hours
- **Token Storage & Security**: 2-3 hours
- **Frontend UI Changes**: 3-4 hours
- **Database Setup** (if needed): 2-3 hours
- **Testing & Security Review**: 3-4 hours
- **Documentation**: 1-2 hours

**Total: ~15-22 hours** (depending on storage choice)

**Quick MVP**: 8-10 hours (using session storage only, no database)

#### Alternative: Simplified OAuth (Session-Only)

For faster implementation without database:

- Use `express-session` with MemoryStore (dev) or Redis (prod)
- Store tokens in session only
- Tokens lost when server restarts (acceptable for MVP)
- No user accounts, just session-based auth
- Reduces complexity significantly (~8 hours total)

---

### Other Post-MVP Features
- User accounts + saved templates (requires database)
- Complex blocks (callouts, images, embeds)
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
