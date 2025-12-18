import { useEffect, useRef } from 'react';
import { BlocksRenderer } from './BlockRenderer';
import type { NotionResourceData, LetterheadData } from '../services/api';
import './PreviewDocument.css';

interface PreviewDocumentProps {
  pages: NotionResourceData[];
  letterhead: LetterheadData;
  hiddenProperties: string[];
  hiddenColumns: string[];
  onBack: () => void;
  onContinue: () => void;
}

// Generate letterhead HTML matching the backend
function generateLetterheadHtml(letterhead: LetterheadData): string {
  let html = '<div class="letterhead">';
  html += '  <div class="letterhead-content">';

  if (letterhead.logoUrl) {
    html += `    <img src="${letterhead.logoUrl}" alt="Logo" class="letterhead-logo">`;
  }

  html += '    <div class="letterhead-info">';
  html += `      <div class="company-name">${escapeHtml(letterhead.companyName)}</div>`;

  if (letterhead.address) {
    html += `      <div class="contact-line">${escapeHtml(letterhead.address)}</div>`;
  }

  const contactParts = [];
  if (letterhead.phone) contactParts.push(escapeHtml(letterhead.phone));
  if (letterhead.email) contactParts.push(escapeHtml(letterhead.email));
  if (contactParts.length > 0) {
    html += `      <div class="contact-line">${contactParts.join(' • ')}</div>`;
  }

  html += '    </div>';
  html += '  </div>';
  html += '  <div class="letterhead-divider"></div>';
  html += '</div>';

  return html;
}

// Generate database table HTML
function generateDatabaseTableHtml(resource: NotionResourceData, hiddenColumns: string[]): string {
  if (resource.type !== 'database') return '';

  const visibleColumns = Object.keys(resource.rows?.[0]?.properties || {}).filter(
    col => !hiddenColumns.includes(col)
  );

  if (visibleColumns.length === 0) {
    return '<p><em>No columns to display (all columns are hidden)</em></p>';
  }

  let html = '<div class="database-container">\n';
  html += `  <h2 class="database-title">${resource.icon || '📊'} ${escapeHtml(resource.title)}</h2>\n`;
  html += '  <table class="notion-database">\n';

  // Header
  html += '    <thead>\n      <tr>\n';
  visibleColumns.forEach(col => {
    const type = resource.schema[col]?.type || 'text';
    html += `        <th data-type="${type}">${escapeHtml(col)}</th>\n`;
  });
  html += '      </tr>\n    </thead>\n';

  // Body
  html += '    <tbody>\n';
  resource.rows.forEach((row, idx) => {
    const rowClass = idx % 2 === 0 ? 'even' : 'odd';
    html += `      <tr class="${rowClass}">\n`;
    visibleColumns.forEach(col => {
      const value = row.properties[col] || '';
      const type = resource.schema[col]?.type || 'text';
      html += `        <td data-type="${type}">${value ? escapeHtml(value) : '<span class="empty-cell">—</span>'}</td>\n`;
    });
    html += '      </tr>\n';
  });
  html += '    </tbody>\n  </table>\n</div>\n';

  return html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default function PreviewDocument({
  pages,
  letterhead,
  hiddenProperties,
  hiddenColumns,
  onBack,
  onContinue
}: PreviewDocumentProps) {
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Generate complete HTML document for preview
  const generatePreviewHtml = (resource: NotionResourceData): string => {
    const letterheadHtml = generateLetterheadHtml(letterhead);
    let contentHtml = '';

    if (resource.type === 'database') {
      contentHtml = generateDatabaseTableHtml(resource, hiddenColumns);
    } else {
      // For pages, we'll keep the React rendering for now
      return '';
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${resource.title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          html, body {
            width: 816px;
            max-width: 816px;
            overflow-x: hidden;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #37352f;
            margin: 0;
            padding: 2em;
            background: white;
            box-sizing: border-box;
          }

          .letterhead { margin-bottom: 2em; }
          .letterhead-content { display: flex; align-items: flex-start; gap: 1em; }
          .letterhead-logo { max-width: 120px; max-height: 80px; object-fit: contain; }
          .letterhead-info { flex: 1; min-width: 0; }
          .company-name { font-size: 1.5em; font-weight: 700; color: #1a1a1a; margin-bottom: 0.3em; }
          .contact-line { font-size: 0.9em; color: #6b6b6b; margin: 0.2em 0; }
          .letterhead-divider { border-top: 2px solid #e0e0e0; margin-top: 1em; }

          .database-container {
            margin: 2rem 0;
            width: 100%;
            overflow-x: auto;
            overflow-y: visible;
          }
          .database-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 1rem; color: #1a1a1a; }

          .notion-database {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 1rem;
            background: white;
            table-layout: auto;
          }

          .notion-database thead {
            background-color: #f7f6f3;
            border-bottom: 2px solid #e9e9e7;
          }

          .notion-database th {
            padding: 6px 8px;
            text-align: left;
            font-weight: 600;
            color: #37352f;
            border: 1px solid #e9e9e7;
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          .notion-database td {
            padding: 6px 8px;
            border: 1px solid #e9e9e7;
            color: #37352f;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }

          .notion-database tbody tr.even { background-color: #ffffff; }
          .notion-database tbody tr.odd { background-color: #fafafa; }

          .empty-cell { color: #b3b3b3; font-style: italic; }

          .notion-database td[data-type="checkbox"] { text-align: center; width: 60px; }
          .notion-database td[data-type="number"] { text-align: right; font-variant-numeric: tabular-nums; }
          .notion-database td[data-type="date"],
          .notion-database td[data-type="created_time"],
          .notion-database td[data-type="last_edited_time"] { white-space: nowrap; }
        </style>
      </head>
      <body>
        ${letterheadHtml}
        ${contentHtml}
      </body>
      </html>
    `;
  };

  // Inject HTML into iframes after render
  useEffect(() => {
    pages.forEach((resource, index) => {
      if (resource.type === 'database' && iframeRefs.current[index]) {
        const iframe = iframeRefs.current[index];
        const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(generatePreviewHtml(resource));
          doc.close();
        }
      }
    });
  }, [pages, letterhead, hiddenColumns]);

  return (
    <>
    <div className="preview-document">
      <h2>Step 4: Preview Your Document{pages.length > 1 ? 's' : ''}</h2>
      <p className="description">
        Review how your {pages.length > 1 ? 'PDFs' : 'PDF'} will look before generating.
        {pages.length > 1 && ' Each page will be exported as a separate PDF.'}
      </p>

      <div className="preview-container">
        {pages.map((resource, index) => (
          <div key={index} className="preview-page-wrapper">
            {pages.length > 1 && (
              <div className="page-number">
                {resource.type === 'database' ? 'Database' : 'Page'} {index + 1} of {pages.length}
              </div>
            )}

            {resource.type === 'database' ? (
              /* Database View - iframe-based preview */
              <div className="preview-iframe-container">
                <iframe
                  ref={(el) => (iframeRefs.current[index] = el)}
                  className="preview-iframe"
                  title={`Preview ${index + 1}`}
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              /* Page View - React-based preview */
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
                  <h2 className="page-title">{resource.title || 'Untitled'}</h2>

                  {/* Properties */}
                  {Object.keys(resource.properties).length > 0 && (
                    <div className="properties">
                      {Object.entries(resource.properties).map(([key, value]) => {
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
                    <BlocksRenderer blocks={resource.blocks} />
                  </div>
              </div>
            )}
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
    </>
  );
}
