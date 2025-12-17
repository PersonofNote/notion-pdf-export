import { BlocksRenderer } from './BlockRenderer';
import type { NotionPageData, LetterheadData } from '../services/api';
import './PreviewDocument.css';

interface PreviewDocumentProps {
  pages: NotionPageData[];
  letterhead: LetterheadData;
  hiddenProperties: string[];
  onBack: () => void;
  onContinue: () => void;
}

export default function PreviewDocument({
  pages,
  letterhead,
  hiddenProperties,
  onBack,
  onContinue
}: PreviewDocumentProps) {
  return (
    <div className="preview-document">
      <h2>Step 3: Preview Your Document{pages.length > 1 ? 's' : ''}</h2>
      <p className="description">
        Review how your {pages.length > 1 ? 'PDFs' : 'PDF'} will look before generating.
        {pages.length > 1 && ' Each page will be exported as a separate PDF.'}
      </p>

      <div className="preview-container">
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="preview-page">
            {pages.length > 1 && (
              <div className="page-number">
                Page {pageIndex + 1} of {pages.length}
              </div>
            )}

            <div className="preview-content">
              {/* Letterhead */}
              <div className="letterhead">
                {letterhead.logoUrl && (
                  <div className="logo">
                    <img src={letterhead.logoUrl} alt="Logo" />
                  </div>
                )}
                <div className="contact-info">
                  <h1 className="company-name">{letterhead.companyName}</h1>
                  {letterhead.address && <p>{letterhead.address}</p>}
                  <div className="contact-details">
                    {letterhead.phone && <span>{letterhead.phone}</span>}
                    {letterhead.email && <span>{letterhead.email}</span>}
                  </div>
                </div>
              </div>

              <hr className="letterhead-divider" />

              {/* Page Title */}
              <h2 className="page-title">{page.title || 'Untitled'}</h2>

              {/* Properties */}
              {Object.keys(page.properties).length > 0 && (
                <div className="properties">
                  {Object.entries(page.properties).map(([key, value]) => {
                    if (hiddenProperties.includes(key)) return null;
                    return (
                      <div key={key} className="property">
                        <strong>{key}:</strong> {value}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Blocks */}
              <div className="blocks">
                <BlocksRenderer blocks={page.blocks} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="preview-actions">
        <button onClick={onBack} className="back-button">
          Back
        </button>
        <button onClick={onContinue} className="continue-button">
          Continue to Generate
        </button>
      </div>

      {pages.length > 1 && (
        <p className="preview-note">
          Note: Showing preview for all {pages.length} pages. Each will be generated as a separate PDF in the zip file.
        </p>
      )}
    </div>
  );
}
