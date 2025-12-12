import { useState } from 'react';
import './NotionUrlInput.css';

interface NotionUrlInputProps {
  onFetch: (url: string, token: string) => void;
  loading: boolean;
  error: string | null;
}

export default function NotionUrlInput({ onFetch, loading, error }: NotionUrlInputProps) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && token.trim()) {
      onFetch(url.trim(), token.trim());
    }
  };

  return (
    <div className="notion-url-input">
      <h2>Step 1: Enter Notion Page URL</h2>
      <p className="description">
        Paste the URL of the Notion page you want to export and your integration token.
      </p>

      <form onSubmit={handleSubmit}>
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
    </div>
  );
}
