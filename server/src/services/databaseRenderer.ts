import type { NotionDatabaseData, DatabaseSchema } from './notionService';

/**
 * Render a Notion database as an HTML table
 */
export function renderDatabaseTable(
  database: NotionDatabaseData,
  hiddenColumns: string[] = []
): string {
  const { title, schema, rows, icon } = database;

  // Filter out hidden columns
  const visibleColumns = Object.keys(schema).filter(col => !hiddenColumns.includes(col));

  if (visibleColumns.length === 0) {
    return '<p><em>No columns to display (all columns are hidden)</em></p>';
  }

  if (rows.length === 0) {
    return `
      <div class="database-container">
        <h2 class="database-title">${icon || '📊'} ${escapeHtml(title)}</h2>
        <p><em>This database is empty</em></p>
      </div>
    `;
  }

  // Build table HTML
  let html = '<div class="database-container">\n';

  // Database title
  html += `  <h2 class="database-title">${icon || '📊'} ${escapeHtml(title)}</h2>\n`;

  // Table
  html += '  <table class="notion-database">\n';

  // Table header
  html += '    <thead>\n';
  html += '      <tr>\n';
  visibleColumns.forEach(columnName => {
    const columnType = schema[columnName].type;
    const typeLabel = formatColumnType(columnType);
    html += `        <th data-type="${columnType}" title="${typeLabel}">${escapeHtml(columnName)}</th>\n`;
  });
  html += '      </tr>\n';
  html += '    </thead>\n';

  // Table body
  html += '    <tbody>\n';
  rows.forEach((row, rowIndex) => {
    html += `      <tr class="${rowIndex % 2 === 0 ? 'even' : 'odd'}">\n`;
    visibleColumns.forEach(columnName => {
      const value = row.properties[columnName] || '';
      const columnType = schema[columnName].type;
      html += `        <td data-type="${columnType}">${formatCellValue(value, columnType)}</td>\n`;
    });
    html += '      </tr>\n';
  });
  html += '    </tbody>\n';

  html += '  </table>\n';
  html += '</div>\n';

  return html;
}

/**
 * Format column type for display
 */
function formatColumnType(type: string): string {
  const typeMap: Record<string, string> = {
    'title': 'Title',
    'rich_text': 'Text',
    'number': 'Number',
    'select': 'Select',
    'multi_select': 'Multi-select',
    'status': 'Status',
    'date': 'Date',
    'checkbox': 'Checkbox',
    'url': 'URL',
    'email': 'Email',
    'phone_number': 'Phone',
    'people': 'Person',
    'files': 'Files',
    'created_time': 'Created Time',
    'last_edited_time': 'Last Edited',
    'created_by': 'Created By',
    'last_edited_by': 'Last Edited By',
    'relation': 'Relation',
    'rollup': 'Rollup',
    'formula': 'Formula'
  };

  return typeMap[type] || type;
}

/**
 * Format cell value based on type
 */
function formatCellValue(value: string, type: string): string {
  if (!value) {
    return '<span class="empty-cell">—</span>';
  }

  const escaped = escapeHtml(value);

  switch (type) {
    case 'url':
      return `<a href="${escaped}" target="_blank" rel="noopener noreferrer">${escaped}</a>`;

    case 'email':
      return `<a href="mailto:${escaped}">${escaped}</a>`;

    case 'phone_number':
      return `<a href="tel:${escaped}">${escaped}</a>`;

    case 'checkbox':
      return value === 'Yes'
        ? '<span class="checkbox checked">☑</span>'
        : '<span class="checkbox unchecked">☐</span>';

    case 'select':
    case 'status':
      return `<span class="tag">${escaped}</span>`;

    case 'multi_select':
      // Split comma-separated values and render as tags
      return value.split(', ')
        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join(' ');

    case 'date':
      return `<span class="date">${escaped}</span>`;

    case 'number':
      return `<span class="number">${escaped}</span>`;

    default:
      return escaped;
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Get CSS styles for database tables
 */
export function getDatabaseStyles(): string {
  return `
    .database-container {
      margin: 2rem 0;
    }

    .database-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }

    .notion-database {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      margin-top: 1rem;
      background: white;
    }

    .notion-database thead {
      background-color: #f7f6f3;
      border-bottom: 2px solid #e9e9e7;
    }

    .notion-database th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #37352f;
      border: 1px solid #e9e9e7;
      white-space: nowrap;
    }

    .notion-database td {
      padding: 10px 12px;
      border: 1px solid #e9e9e7;
      color: #37352f;
      vertical-align: top;
    }

    .notion-database tbody tr.even {
      background-color: #ffffff;
    }

    .notion-database tbody tr.odd {
      background-color: #fafafa;
    }

    .notion-database tbody tr:hover {
      background-color: #f1f1f0;
    }

    .empty-cell {
      color: #b3b3b3;
      font-style: italic;
    }

    .tag {
      display: inline-block;
      padding: 2px 8px;
      background-color: #e8e8e8;
      border-radius: 3px;
      font-size: 12px;
      margin-right: 4px;
      white-space: nowrap;
    }

    .checkbox {
      font-size: 16px;
    }

    .checkbox.checked {
      color: #0066cc;
    }

    .checkbox.unchecked {
      color: #999;
    }

    .date, .number {
      white-space: nowrap;
    }

    /* Type-specific column styling */
    .notion-database td[data-type="checkbox"] {
      text-align: center;
      width: 60px;
    }

    .notion-database td[data-type="number"] {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .notion-database td[data-type="date"],
    .notion-database td[data-type="created_time"],
    .notion-database td[data-type="last_edited_time"] {
      white-space: nowrap;
    }

    .notion-database a {
      color: #0066cc;
      text-decoration: none;
    }

    .notion-database a:hover {
      text-decoration: underline;
    }

    /* Responsive handling for wide tables */
    @media print {
      .notion-database {
        font-size: 11px;
      }

      .notion-database th,
      .notion-database td {
        padding: 6px 8px;
      }
    }
  `;
}
