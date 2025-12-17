import type { NotionResourceData } from '../services/api';
import './PropertyFilter.css';

interface PropertyFilterProps {
  resources: NotionResourceData[];
  hiddenProperties: string[];
  hiddenColumns: string[];
  onToggleProperty: (propertyName: string) => void;
  onToggleColumn: (columnName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PropertyFilter({
  resources,
  hiddenProperties,
  hiddenColumns,
  onToggleProperty,
  onToggleColumn,
  onNext,
  onBack
}: PropertyFilterProps) {
  // Separate pages and databases
  const pages = resources.filter(r => r.type === 'page');
  const databases = resources.filter(r => r.type === 'database');

  // Collect all unique properties from pages
  const allPageProperties = new Map<string, string>();
  pages.forEach(page => {
    Object.entries(page.properties || {}).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'title' && !allPageProperties.has(key)) {
        allPageProperties.set(key, value);
      }
    });
  });

  // Collect all unique columns from databases
  const allDatabaseColumns = new Map<string, string>();
  databases.forEach(db => {
    Object.entries(db.schema).forEach(([name, info]) => {
      if (!allDatabaseColumns.has(name)) {
        allDatabaseColumns.set(name, info.type);
      }
    });
  });

  const hasPageProperties = allPageProperties.size > 0;
  const hasDatabaseColumns = allDatabaseColumns.size > 0;

  if (!hasPageProperties && !hasDatabaseColumns) {
    return (
      <div className="property-filter">
        <h2>Step 3: Filter Properties</h2>
        <p className="description">
          No properties or columns to filter.
        </p>
        <div className="filter-actions">
          <button onClick={onBack} className="back-button">
            Back
          </button>
          <button onClick={onNext} className="next-button">
            Next: Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="property-filter">
      <h2>Step 3: Filter Properties & Columns</h2>
      <p className="description">
        Select which properties and columns to include in your PDFs. Unchecked items will be hidden.
      </p>

      {/* Page Properties Section */}
      {hasPageProperties && (
        <div className="filter-section">
          <h3>Page Properties ({pages.length} {pages.length === 1 ? 'page' : 'pages'})</h3>
          <div className="properties-list">
            {Array.from(allPageProperties.entries()).map(([key, value]) => {
              const isVisible = !hiddenProperties.includes(key);

              return (
                <label key={key} className="property-item">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleProperty(key)}
                  />
                  <div className="property-details">
                    <span className="property-name">{key}</span>
                    <span className="property-value">{value || '(empty)'}</span>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="filter-section-actions">
            <button
              type="button"
              onClick={() => {
                Array.from(allPageProperties.keys()).forEach((key) => {
                  if (!hiddenProperties.includes(key)) {
                    onToggleProperty(key);
                  }
                });
              }}
              className="secondary-button"
            >
              Hide All
            </button>
            <button
              type="button"
              onClick={() => {
                hiddenProperties.forEach((key) => {
                  if (allPageProperties.has(key)) {
                    onToggleProperty(key);
                  }
                });
              }}
              className="secondary-button"
            >
              Show All
            </button>
          </div>
        </div>
      )}

      {/* Database Columns Section */}
      {hasDatabaseColumns && (
        <div className="filter-section">
          <h3>Database Columns ({databases.length} {databases.length === 1 ? 'database' : 'databases'})</h3>
          <div className="properties-list">
            {Array.from(allDatabaseColumns.entries()).map(([name, type]) => {
              const isVisible = !hiddenColumns.includes(name);

              return (
                <label key={name} className="property-item">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleColumn(name)}
                  />
                  <div className="property-details">
                    <span className="property-name">{name}</span>
                    <span className="property-type">{type}</span>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="filter-section-actions">
            <button
              type="button"
              onClick={() => {
                Array.from(allDatabaseColumns.keys()).forEach((name) => {
                  if (!hiddenColumns.includes(name)) {
                    onToggleColumn(name);
                  }
                });
              }}
              className="secondary-button"
            >
              Hide All
            </button>
            <button
              type="button"
              onClick={() => {
                hiddenColumns.forEach((name) => {
                  if (allDatabaseColumns.has(name)) {
                    onToggleColumn(name);
                  }
                });
              }}
              className="secondary-button"
            >
              Show All
            </button>
          </div>
        </div>
      )}

      <div className="filter-actions">
        <button onClick={onBack} className="back-button">
          Back
        </button>
        <button onClick={onNext} className="next-button">
          Next: Preview
        </button>
      </div>
    </div>
  );
}
