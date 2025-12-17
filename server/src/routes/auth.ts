import express, { Request, Response } from 'express';
import { generateRandomState, generateAuthUrl, exchangeCodeForToken, validateOAuthConfig } from '../services/authService';
import { AuthStatusResponse } from '../types/oauth';

const router = express.Router();

/**
 * GET /api/auth/notion
 * Initiate OAuth flow - redirect to Notion authorization page
 */
router.get('/notion', (req: Request, res: Response) => {
  try {
    // Validate OAuth configuration
    const configCheck = validateOAuthConfig();
    if (!configCheck.valid) {
      return res.status(500).json({
        error: 'OAuth not configured',
        message: configCheck.error,
      });
    }

    // Generate and store state for CSRF protection
    const state = generateRandomState();
    req.session!.oauthState = state;

    console.log('🔐 OAuth Initiate - Generated state:', state);
    console.log('🍪 Session data:', req.session);

    // Generate authorization URL
    const authUrl = generateAuthUrl(state);
    console.log('🔗 Redirecting to:', authUrl);

    // Redirect user to Notion authorization page (cookie-session auto-saves)
    res.redirect(authUrl);
  } catch (error: any) {
    console.error('Error initiating OAuth:', error);
    res.status(500).json({
      error: 'Failed to initiate OAuth',
      message: error.message,
    });
  }
});

/**
 * GET /api/auth/notion/callback
 * Handle OAuth callback from Notion
 */
router.get('/notion/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    console.log('🔄 OAuth Callback received');
    console.log('🍪 Session data:', req.session);
    console.log('📨 Received state:', state);
    console.log('💾 Stored state:', req.session?.oauthState);
    console.log('🔑 Code received:', !!code);

    // Check if user denied authorization
    if (error) {
      console.error('❌ OAuth error:', error);
      return res.redirect(`${process.env.CLIENT_URL}?error=access_denied`);
    }

    // Validate required parameters
    if (!code || typeof code !== 'string') {
      console.error('❌ Missing authorization code');
      return res.status(400).json({
        error: 'Missing authorization code',
      });
    }

    if (!state || typeof state !== 'string') {
      console.error('❌ Missing state parameter');
      return res.status(400).json({
        error: 'Missing state parameter',
      });
    }

    // Verify state (CSRF protection)
    if (state !== req.session?.oauthState) {
      console.error('❌ State mismatch!');
      console.error('   Received:', state);
      console.error('   Expected:', req.session?.oauthState);
      return res.status(400).json({
        error: 'Invalid state parameter',
        message: 'Possible CSRF attack detected',
      });
    }

    console.log('✅ State verified successfully');

    // Clear the state after verification
    if (req.session) {
      delete req.session.oauthState;
    }

    // Exchange code for access token
    const tokens = await exchangeCodeForToken(code);

    // Store tokens and workspace info in session
    if (req.session) {
      req.session.notionToken = tokens.access_token;
      req.session.workspaceId = tokens.workspace_id;
      req.session.workspaceName = tokens.workspace_name;
      req.session.workspaceIcon = tokens.workspace_icon;
      req.session.botId = tokens.bot_id;
    }

    console.log('OAuth successful:', {
      workspaceId: tokens.workspace_id,
      workspaceName: tokens.workspace_name,
    });

    // Redirect back to the app
    res.redirect(`${process.env.CLIENT_URL}?auth=success`);
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=oauth_failed`);
  }
});

/**
 * POST /api/auth/logout
 * Clear session and log out user
 */
router.post('/logout', (req: Request, res: Response) => {
  // With cookie-session, set to null to clear (cast needed for TypeScript)
  (req as any).session = null;
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/status
 * Check if user is authenticated
 */
router.get('/status', (req: Request, res: Response) => {
  const authenticated = !!req.session?.notionToken;

  const response: AuthStatusResponse = {
    authenticated,
    workspaceName: req.session?.workspaceName,
    workspaceIcon: req.session?.workspaceIcon,
  };

  res.json(response);
});

export default router;
