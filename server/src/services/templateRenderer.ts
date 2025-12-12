import type {
  BlockObjectResponse,
  PartialBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

type RichTextItemResponse = {
  type: 'text';
  text: { content: string; link: { url: string } | null };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
};

/**
 * Convert rich text array to HTML with formatting
 */
function renderRichText(richTextArray: any[]): string {
  if (!richTextArray || richTextArray.length === 0) {
    return '';
  }

  return richTextArray.map((textItem: any) => {
    let text = textItem.plain_text || '';

    // Apply formatting
    if (textItem.annotations?.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (textItem.annotations?.italic) {
      text = `<em>${text}</em>`;
    }
    if (textItem.annotations?.strikethrough) {
      text = `<s>${text}</s>`;
    }
    if (textItem.annotations?.underline) {
      text = `<u>${text}</u>`;
    }
    if (textItem.annotations?.code) {
      text = `<code>${text}</code>`;
    }

    // Handle links
    if (textItem.href) {
      text = `<a href="${textItem.href}">${text}</a>`;
    }

    return text;
  }).join('');
}

/**
 * Render a single Notion block to HTML
 */
function renderBlock(block: BlockObjectResponse | PartialBlockObjectResponse): string {
  if (!('type' in block)) {
    return '';
  }

  const blockType = block.type;

  try {
    switch (blockType) {
      case 'paragraph': {
        const content = renderRichText(block.paragraph.rich_text);
        return content ? `<p>${content}</p>` : '<p><br/></p>';
      }

      case 'heading_1': {
        const content = renderRichText(block.heading_1.rich_text);
        return `<h1>${content}</h1>`;
      }

      case 'heading_2': {
        const content = renderRichText(block.heading_2.rich_text);
        return `<h2>${content}</h2>`;
      }

      case 'heading_3': {
        const content = renderRichText(block.heading_3.rich_text);
        return `<h3>${content}</h3>`;
      }

      case 'bulleted_list_item': {
        const content = renderRichText(block.bulleted_list_item.rich_text);
        return `<li>${content}</li>`;
      }

      case 'numbered_list_item': {
        const content = renderRichText(block.numbered_list_item.rich_text);
        return `<li class="numbered">${content}</li>`;
      }

      case 'to_do': {
        const content = renderRichText(block.to_do.rich_text);
        const checked = block.to_do.checked ? 'checked' : '';
        return `<div class="todo"><input type="checkbox" ${checked} disabled /> ${content}</div>`;
      }

      case 'toggle': {
        const content = renderRichText(block.toggle.rich_text);
        return `<details><summary>${content}</summary></details>`;
      }

      case 'code': {
        const content = renderRichText(block.code.rich_text);
        const language = block.code.language || 'plaintext';
        return `<pre><code class="language-${language}">${content}</code></pre>`;
      }

      case 'quote': {
        const content = renderRichText(block.quote.rich_text);
        return `<blockquote>${content}</blockquote>`;
      }

      case 'callout': {
        const content = renderRichText(block.callout.rich_text);
        const icon = block.callout.icon?.type === 'emoji' ? block.callout.icon.emoji : '💡';
        return `<div class="callout"><span class="callout-icon">${icon}</span><div>${content}</div></div>`;
      }

      case 'divider': {
        return '<hr />';
      }

      // Unsupported blocks - return empty or placeholder
      case 'image':
      case 'video':
      case 'file':
      case 'pdf':
      case 'bookmark':
      case 'embed':
      case 'link_preview':
      case 'table':
      case 'table_row':
      case 'column_list':
      case 'column':
      case 'child_page':
      case 'child_database':
      case 'equation':
      case 'breadcrumb':
      case 'table_of_contents':
      case 'link_to_page':
      case 'synced_block':
      case 'template':
      case 'audio':
        // For MVP, skip these complex block types
        return `<!-- Unsupported block type: ${blockType} -->`;

      default:
        return `<!-- Unknown block type: ${blockType} -->`;
    }
  } catch (error) {
    console.error(`Error rendering block type ${blockType}:`, error);
    return `<!-- Error rendering block -->`;
  }
}

/**
 * Group consecutive list items into proper ul/ol tags
 */
function groupLists(htmlBlocks: string[]): string[] {
  const result: string[] = [];
  let currentList: { type: 'ul' | 'ol' | null; items: string[] } = { type: null, items: [] };

  htmlBlocks.forEach(block => {
    if (block.includes('<li class="numbered">')) {
      // Numbered list item
      if (currentList.type !== 'ol') {
        // Close previous list if exists
        if (currentList.type) {
          result.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
        }
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(block);
    } else if (block.startsWith('<li>')) {
      // Bulleted list item
      if (currentList.type !== 'ul') {
        // Close previous list if exists
        if (currentList.type) {
          result.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
        }
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(block);
    } else {
      // Not a list item - close any open list
      if (currentList.type) {
        result.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
        currentList = { type: null, items: [] };
      }
      result.push(block);
    }
  });

  // Close any remaining list
  if (currentList.type) {
    result.push(`<${currentList.type}>${currentList.items.join('')}</${currentList.type}>`);
  }

  return result;
}

/**
 * Convert Notion blocks to HTML
 */
export function renderBlocks(blocks: (BlockObjectResponse | PartialBlockObjectResponse)[]): string {
  const htmlBlocks = blocks.map(renderBlock).filter(html => html.trim() !== '');
  const groupedBlocks = groupLists(htmlBlocks);
  return groupedBlocks.join('\n');
}

/**
 * Get CSS styles for the rendered HTML
 */
export function getStyles(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #37352f;
      }

      h1 {
        font-size: 2em;
        font-weight: 700;
        margin: 1em 0 0.5em 0;
        line-height: 1.2;
      }

      h2 {
        font-size: 1.5em;
        font-weight: 600;
        margin: 0.8em 0 0.4em 0;
        line-height: 1.3;
      }

      h3 {
        font-size: 1.25em;
        font-weight: 600;
        margin: 0.6em 0 0.3em 0;
        line-height: 1.4;
      }

      p {
        margin: 0.5em 0;
      }

      ul, ol {
        margin: 0.5em 0;
        padding-left: 1.5em;
      }

      li {
        margin: 0.25em 0;
      }

      code {
        background: #f3f3f1;
        color: #eb5757;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.9em;
      }

      pre {
        background: #f7f6f3;
        border: 1px solid #e9e9e7;
        border-radius: 3px;
        padding: 1em;
        margin: 0.5em 0;
        overflow-x: auto;
      }

      pre code {
        background: transparent;
        color: inherit;
        padding: 0;
      }

      blockquote {
        border-left: 3px solid #d3d3d3;
        padding-left: 1em;
        margin: 0.5em 0;
        color: #6b6b6b;
      }

      hr {
        border: none;
        border-top: 1px solid #e9e9e7;
        margin: 1.5em 0;
      }

      a {
        color: #0066cc;
        text-decoration: underline;
      }

      .callout {
        display: flex;
        background: #f7f6f3;
        border-radius: 3px;
        padding: 1em;
        margin: 0.5em 0;
      }

      .callout-icon {
        font-size: 1.2em;
        margin-right: 0.5em;
      }

      .todo {
        margin: 0.25em 0;
      }

      .todo input[type="checkbox"] {
        margin-right: 0.5em;
      }
    </style>
  `;
}
