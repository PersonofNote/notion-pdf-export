# Legal Pages for Notion OAuth

## Overview

Privacy Policy and Terms of Use pages have been added to meet Notion OAuth integration requirements.

## Page URLs

Once deployed, provide these URLs to Notion OAuth configuration:

- **Privacy Policy**: `https://your-domain.com/privacy`
- **Terms of Use**: `https://your-domain.com/terms`

For local development:
- **Privacy Policy**: `http://localhost:5173/privacy`
- **Terms of Use**: `http://localhost:5173/terms`

## Files Created

### Frontend Pages
1. **`client/src/pages/PrivacyPolicy.tsx`**
   - Comprehensive privacy policy covering data collection, usage, storage, and user rights
   - Covers OAuth authentication, content processing, session management, and localStorage
   - Includes sections on security measures, third-party services, and GDPR considerations

2. **`client/src/pages/TermsOfUse.tsx`**
   - Standard terms of use for the service
   - Covers acceptable use, user obligations, service limitations, and disclaimers
   - Includes rate limiting policy, content limitations, and liability disclaimers
   - Beta testing disclaimer included

### Updated Files
3. **`client/src/main.tsx`**
   - Added React Router with BrowserRouter
   - Created routes for `/`, `/privacy`, and `/terms`

4. **`client/src/App.tsx`**
   - Added footer links to Privacy Policy and Terms of Use

## Key Legal Points Covered

### Privacy Policy
- **Data Collection**: OAuth tokens, Notion content (temporary), letterhead data (localStorage), server logs
- **Data Usage**: PDF generation, authentication, session management, abuse prevention
- **Data Storage**:
  - Temporary in-memory processing for Notion content
  - Session cookies for OAuth tokens (encrypted)
  - localStorage for letterhead (client-side only)
  - Server logs retained for 30 days
- **Data Sharing**: Only with Notion API (for OAuth) and when required by law
- **Security**: HTTPS, encrypted sessions, input validation, rate limiting, timeout protection
- **User Rights**: Revoke OAuth, clear localStorage, request data deletion

### Terms of Use
- **Service Description**: Notion to PDF export with custom branding
- **User Obligations**: Account security, lawful use, content responsibility
- **Acceptable Use**: No unauthorized access, no automated abuse, no malicious content
- **Service Limitations**:
  - Rate limits (100 general/15min, 10 PDF/min, 5 batch/min, 30 Notion/min)
  - Content limits (30s timeout, 10MB images, 100 rows per database)
- **Disclaimers**: "As is" service, no warranties, limitation of liability
- **Beta Testing**: Notice that service is in beta with potential bugs

## Navigation

Both legal pages include:
- Back navigation to main app
- Cross-links between Privacy Policy and Terms of Use
- Clean, professional styling matching the app
- Last updated date (December 18, 2025)

## Deployment Checklist

When deploying, ensure:
- [ ] Legal page URLs are accessible at `/privacy` and `/terms`
- [ ] Update Notion OAuth configuration with production URLs
- [ ] Review and customize legal language if needed (consult legal counsel for production use)
- [ ] Update "Last Updated" dates if content changes
- [ ] Verify all navigation links work correctly
- [ ] Test that pages are mobile-responsive

## Notes

- **Legal Disclaimer**: These are standard templates suitable for beta testing. For production deployment with significant user base, consult with legal counsel to ensure compliance with applicable laws (GDPR, CCPA, etc.).
- **Contact Information**: Currently references "GitHub repository issues page" - update with actual contact information before production deployment.
- **Customization**: Review and customize based on your specific deployment, business structure, and legal requirements.

## React Router Configuration

The app now uses React Router v6 with the following structure:

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfUse />} />
  </Routes>
</BrowserRouter>
```

All routes are client-side, so ensure your web server is configured to serve `index.html` for all routes (not just `/`).
