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

export default function PreviewDocument({
  pages,
  letterhead,
  hiddenProperties,
  hiddenColumns,
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
        {pages.map((resource, index) => (
          <div key={index} className="preview-page">
            {pages.length > 1 && (
              <div className="page-number">
                {resource.type === 'database' ? 'Database' : 'Page'} {index + 1} of {pages.length}
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

              {resource.type === 'database' ? (
                /* Database View */
                <>
                  {/* Database Title */}
                  <h2 className="page-title">
                    {resource.icon && <span className="title-icon">{resource.icon}</span>}
                    {resource.title || 'Untitled Database'}
                  </h2>
                  {/* Database Table */}
                  <div className="database-table-container">
                    <table className="database-table">
                      <thead>
                        <tr>
                          {Object.keys(resource.rows?.[0].properties)
                            .filter(col => !hiddenColumns.includes(col))
                            .map(columnName => (
                              <th key={columnName}>
                                {columnName}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resource.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.keys(resource.rows?.[0].properties)
                              .filter(col => !hiddenColumns.includes(col))
                              .map(columnName => (
                                <td key={columnName}>
                                  {row.properties[columnName] || '—'}
                                </td>
                              ))}
                          </tr>
                        ))}
                        {resource.rows.length === 0 && (
                          <tr>
                            <td colSpan={Object.keys(resource.schema).filter(col => !hiddenColumns.includes(col)).length}>
                              <em>No rows in this database</em>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Page View */
                <>
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
                </>
              )}
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
