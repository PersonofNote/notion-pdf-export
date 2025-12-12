import './PropertyFilter.css';

interface PropertyFilterProps {
  properties: Record<string, string>;
  hiddenProperties: string[];
  onToggle: (propertyName: string) => void;
  onNext: () => void;
}

export default function PropertyFilter({
  properties,
  hiddenProperties,
  onToggle,
  onNext
}: PropertyFilterProps) {
  const propertyEntries = Object.entries(properties).filter(
    ([key]) => key.toLowerCase() !== 'title'
  );

  if (propertyEntries.length === 0) {
    return (
      <div className="property-filter">
        <h2>Step 3: Filter Properties</h2>
        <p className="description">
          This page has no properties to filter.
        </p>
        <button onClick={onNext} className="next-button">
          Next: Generate PDF
        </button>
      </div>
    );
  }

  return (
    <div className="property-filter">
      <h2>Step 3: Filter Properties</h2>
      <p className="description">
        Select which properties to include in the PDF. Unchecked properties will be hidden.
      </p>

      <div className="properties-list">
        {propertyEntries.map(([key, value]) => {
          const isVisible = !hiddenProperties.includes(key);

          return (
            <label key={key} className="property-item">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => onToggle(key)}
              />
              <div className="property-details">
                <span className="property-name">{key}</span>
                <span className="property-value">{value || '(empty)'}</span>
              </div>
            </label>
          );
        })}
      </div>

      <div className="filter-actions">
        <button
          type="button"
          onClick={() => {
            // Hide all properties
            propertyEntries.forEach(([key]) => {
              if (!hiddenProperties.includes(key)) {
                onToggle(key);
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
            // Show all properties
            hiddenProperties.forEach((key) => {
              if (propertyEntries.some(([k]) => k === key)) {
                onToggle(key);
              }
            });
          }}
          className="secondary-button"
        >
          Show All
        </button>
      </div>

      <button onClick={onNext} className="next-button">
        Next: Generate PDF
      </button>
    </div>
  );
}
