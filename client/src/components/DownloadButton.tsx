import './DownloadButton.css';

interface DownloadButtonProps {
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
  onReset: () => void;
}

export default function DownloadButton({
  onGenerate,
  loading,
  error,
  onReset
}: DownloadButtonProps) {
  return (
    <div className="download-button">
      <h2>Step 4: Generate PDF</h2>
      <p className="description">
        Click the button below to generate and download your branded PDF.
      </p>

      <div className="generation-section">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={loading}
          className="generate-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating PDF...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Generate & Download PDF
            </>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={loading}
          className="reset-button"
        >
          Start Over
        </button>
      </div>

      <div className="info-box">
        <h3>What happens next?</h3>
        <ul>
          <li>Your Notion content will be converted to HTML</li>
          <li>The letterhead and contact info will be added</li>
          <li>Selected properties will be included in the document</li>
          <li>A professional PDF will be generated and downloaded</li>
        </ul>
        <p className="note">
          <strong>Note:</strong> PDF generation may take 5-10 seconds depending on page size.
        </p>
      </div>
    </div>
  );
}
