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
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  useEffect(() => {
    console.log(pages)},[pages])
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
        setSelectedPageIds([response.pages[0].id]);
      }
    } catch (err) {
      setPagesError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoadingPages(false);
    }
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds(prev => {
      if (prev.includes(pageId)) {
        return prev.filter(id => id !== pageId);
      } else {
        // Select
        return [...prev, pageId];
      }
    });
  };

  const selectAllPages = () => {
    setSelectedPageIds(pages.map(p => p.id));
  };

  const deselectAllPages = () => {
    // Keep first page selected
    if (pages.length > 0) {
      setSelectedPageIds([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authenticated) {
      // Use selected pages - pass URLs as comma-separated string
      const selectedPages = pages.filter(p => selectedPageIds.includes(p.id));
      if (selectedPages.length > 0) {
        // Pass multiple URLs joined by comma
        const urls = selectedPages.map(p => p.url).join(',');
        onFetch(urls);
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
    // Use different default icon for databases
    const defaultIcon = page.type === 'database' ? '📊' : '📄';

    if (!page.icon) return defaultIcon;
    if (page.icon.type === 'emoji') return page.icon.emoji || defaultIcon;
    return defaultIcon;
  };

  return (
    <div className="notion-url-input">
      <h2>Step 1: {!authenticated ? "Connect" : "Select Pages & Databases" }</h2>

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
            Select pages and/or databases from your workspace to export
          </p>

          {loadingPages ? (
            <div className="loading-pages">
              <div className="spinner"></div>
              <p>Loading your content...</p>
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
              <p>No pages or databases found. Make sure you've shared content with this integration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="page-select-header">
                  <label>Select Pages & Databases</label>
                  <div className="select-actions">
                    <button
                      type="button"
                      onClick={selectAllPages}
                      className="select-action-button"
                      disabled={loading}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllPages}
                      className="select-action-button"
                      disabled={loading}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="page-list">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`page-item ${selectedPageIds.includes(page.id) ? 'selected' : ''}`}
                      onClick={() => togglePageSelection(page.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPageIds.includes(page.id)}
                        readOnly
                        disabled={loading}
                        tabIndex={-1}
                      />
                      <span className="page-icon">{getPageIcon(page)}</span>
                      <span className="page-title">
                        {page.title}
                        {page.type === 'database' && (
                          <span className="page-type-badge">Database</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <small>
                  {selectedPageIds.length} item{selectedPageIds.length !== 1 ? 's' : ''} selected
                </small>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || selectedPageIds.length === 0}>
                {loading ? 'Loading...' : `Select ${selectedPageIds.length} Page${selectedPageIds.length !== 1 ? 's' : ''}`}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
