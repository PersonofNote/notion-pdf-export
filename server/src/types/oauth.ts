/**
 * OAuth-related TypeScript types
 */

// Extend express-session to include custom session data
declare module 'express-session' {
  interface SessionData {
    notionToken?: string;
    workspaceId?: string;
    workspaceName?: string;
    workspaceIcon?: string;
    oauthState?: string;
    botId?: string;
  }
}

// Notion OAuth token response
export interface OAuthTokens {
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
  duplicated_template_id?: string;
}

// Notion user object
export interface NotionUser {
  object: 'user';
  id: string;
  name?: string;
  avatar_url?: string;
  type?: 'person' | 'bot';
  person?: {
    email?: string;
  };
}

// Auth status response
export interface AuthStatusResponse {
  authenticated: boolean;
  workspaceName?: string;
  workspaceIcon?: string;
}
