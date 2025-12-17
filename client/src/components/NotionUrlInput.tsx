import { useState, useEffect } from 'react';
import OAuthButton from './OAuthButton';
import { fetchAccessiblePages, type NotionPage } from '../services/api';
import './NotionUrlInput.css';

interface NotionUrlInputProps {
  onFetch: (url: string, token?: string) => void;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
}

export default function NotionUrlInput({ onFetch, loading, error, authenticated }: NotionUrlInputProps) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [showManualToken, setShowManualToken] = useState(false);

  // Page selector state
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Fetch pages when authenticated
  useEffect(() => {
    if (authenticated) {
      loadPages();
    }
  }, [authenticated]);

  const loadPages = async () => {
    setLoadingPages(true);
    setPagesError(null);
    try {
      const response = await fetchAccessiblePages();
      setPages(response.pages);
      // Auto-select first page if available
      if (response.pages.length > 0) {
        setSelectedPageId(response.pages[0].id);
      }
    } catch (err) {
      setPagesError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoadingPages(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authenticated) {
      // Use selected page from dropdown
      const selectedPage = pages.find(p => p.id === selectedPageId);
      if (selectedPage) {
        onFetch(selectedPage.url);
      }
    } else {
      // Manual URL input
      if (url.trim()) {
        // If authenticated via OAuth, don't need token
        // Otherwise, require manual token
        if (authenticated || token.trim()) {
          onFetch(url.trim(), token.trim() || undefined);
        }
      }
    }
  };

  const getPageIcon = (page: NotionPage) => {
    if (!page.icon) return '📄';
    if (page.icon.type === 'emoji') return page.icon.emoji || '📄';
    return '📄';
  };

  return (
    <div className="notion-url-input">
      <h2>Step 1: Connect & Enter Page URL</h2>

      {!authenticated ? (
        <>
          <p className="description">
            Choose how you want to authenticate with Notion
          </p>

          <div className="auth-options">
            <div className="auth-option">
              <h3>Option 1: Connect with Notion (Recommended)</h3>
              <p className="option-description">
                One-click authentication. No need to create integrations or share pages manually.
              </p>
              <OAuthButton disabled={loading} />
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="auth-option">
              <h3>Option 2: Use Integration Token</h3>
              <p className="option-description">
                Use your own Notion integration token.
              </p>
              {!showManualToken ? (
                <button
                  type="button"
                  className="show-manual-button"
                  onClick={() => setShowManualToken(true)}
                >
                  Use Manual Token
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="manual-token-form">
                  <div className="form-group">
                    <label htmlFor="notion-url">Notion Page URL</label>
                    <input
                      id="notion-url"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.notion.so/Page-Title-abc123..."
                      disabled={loading}
                      required
                    />
                    <small>Example: https://www.notion.so/My-Page-abc123def456</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notion-token">Notion Integration Token</label>
                    <input
                      id="notion-token"
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="secret_xxxxxxxxxxxxxxxxxxxxx"
                      disabled={loading}
                      required
                    />
                    <small>
                      Create an integration at{' '}
                      <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">
                        notion.so/my-integrations
                      </a>
                    </small>
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || !url.trim() || !token.trim()}>
                    {loading ? 'Fetching...' : 'Fetch Page'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="description">
            Select a page from your workspace to export
          </p>

          {loadingPages ? (
            <div className="loading-pages">
              <div className="spinner"></div>
              <p>Loading your pages...</p>
            </div>
          ) : pagesError ? (
            <div className="error-message">
              {pagesError}
              <button onClick={loadPages} className="retry-button">
                Retry
              </button>
            </div>
          ) : pages.length === 0 ? (
            <div className="no-pages-message">
              <p>No pages found. Make sure you've shared pages with this integration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="page-select">Select a Page</label>
                <select
                  id="page-select"
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  disabled={loading}
                  required
                  className="page-select"
                >
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {getPageIcon(page)} {page.title}
                    </option>
                  ))}
                </select>
                <small>Showing recently edited pages from your workspace</small>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !selectedPageId}>
                {loading ? 'Fetching...' : 'Fetch Page'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
