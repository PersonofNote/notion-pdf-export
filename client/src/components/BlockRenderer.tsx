import React from 'react';

// Type definitions
type RichTextItem = {
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

type NotionBlock = any; // Using any for simplicity since we're working with Notion's complex types

interface RichTextProps {
  richText: RichTextItem[];
}

/**
 * Render rich text with formatting
 */
function RichText({ richText }: RichTextProps) {
  if (!richText || richText.length === 0) {
    return null;
  }

  return (
    <>
      {richText.map((textItem, index) => {
        let content: React.ReactNode = textItem.plain_text || '';

        // Apply formatting
        if (textItem.annotations?.code) {
          content = <code key={index}>{content}</code>;
        }
        if (textItem.annotations?.bold) {
          content = <strong key={index}>{content}</strong>;
        }
        if (textItem.annotations?.italic) {
          content = <em key={index}>{content}</em>;
        }
        if (textItem.annotations?.strikethrough) {
          content = <s key={index}>{content}</s>;
        }
        if (textItem.annotations?.underline) {
          content = <u key={index}>{content}</u>;
        }

        // Handle links
        if (textItem.href) {
          content = (
            <a key={index} href={textItem.href} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          );
        }

        return <React.Fragment key={index}>{content}</React.Fragment>;
      })}
    </>
  );
}

interface BlockRendererProps {
  block: NotionBlock;
}

/**
 * Render a single Notion block
 */
export function BlockRenderer({ block }: BlockRendererProps) {
  if (!block || !block.type) {
    return null;
  }

  const blockType = block.type;

  try {
    switch (blockType) {
      case 'paragraph': {
        const content = block.paragraph.rich_text;
        return content && content.length > 0 ? (
          <p><RichText richText={content} /></p>
        ) : (
          <p><br /></p>
        );
      }

      case 'heading_1': {
        const content = block.heading_1.rich_text;
        return <h1><RichText richText={content} /></h1>;
      }

      case 'heading_2': {
        const content = block.heading_2.rich_text;
        return <h2><RichText richText={content} /></h2>;
      }

      case 'heading_3': {
        const content = block.heading_3.rich_text;
        return <h3><RichText richText={content} /></h3>;
      }

      case 'bulleted_list_item': {
        const content = block.bulleted_list_item.rich_text;
        return (
          <li data-list-type="bulleted">
            <RichText richText={content} />
          </li>
        );
      }

      case 'numbered_list_item': {
        const content = block.numbered_list_item.rich_text;
        return (
          <li data-list-type="numbered">
            <RichText richText={content} />
          </li>
        );
      }

      case 'to_do': {
        const content = block.to_do.rich_text;
        const checked = block.to_do.checked;
        return (
          <div className="todo">
            <input type="checkbox" checked={checked} disabled />
            <span><RichText richText={content} /></span>
          </div>
        );
      }

      case 'toggle': {
        const content = block.toggle.rich_text;
        return (
          <details>
            <summary><RichText richText={content} /></summary>
          </details>
        );
      }

      case 'code': {
        const content = block.code.rich_text;
        const language = block.code.language || 'plaintext';
        return (
          <pre>
            <code className={`language-${language}`}>
              <RichText richText={content} />
            </code>
          </pre>
        );
      }

      case 'quote': {
        const content = block.quote.rich_text;
        return (
          <blockquote>
            <RichText richText={content} />
          </blockquote>
        );
      }

      case 'callout': {
        const content = block.callout.rich_text;
        const icon = block.callout.icon?.type === 'emoji' ? block.callout.icon.emoji : '💡';
        return (
          <div className="callout">
            <span className="callout-icon">{icon}</span>
            <div><RichText richText={content} /></div>
          </div>
        );
      }

      case 'divider': {
        return <hr />;
      }

      // Unsupported blocks
      default:
        return (
          <div className="unsupported-block">
            Unsupported block type: {blockType} won't be rendered in the final pdf
          </div>
        );
    }
  } catch (error) {
    console.error(`Error rendering block type ${blockType}:`, error);
    return <div className="error-block">Error rendering block</div>;
  }
}

/**
 * Group consecutive list items into proper lists
 */
interface BlocksRendererProps {
  blocks: NotionBlock[];
}

export function BlocksRenderer({ blocks }: BlocksRendererProps) {
  const groupedBlocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol' | null; items: React.ReactNode[] } = {
    type: null,
    items: []
  };

  blocks.forEach((block, index) => {
    const listType = block.type === 'bulleted_list_item' ? 'ul'
                    : block.type === 'numbered_list_item' ? 'ol'
                    : null;

    if (listType) {
      if (currentList.type !== listType) {
        // Close previous list if exists
        if (currentList.type) {
          groupedBlocks.push(
            React.createElement(
              currentList.type,
              { key: `list-${groupedBlocks.length}` },
              currentList.items
            )
          );
        }
        currentList = { type: listType, items: [] };
      }
      currentList.items.push(<BlockRenderer key={index} block={block} />);
    } else {
      // Not a list item - close any open list
      if (currentList.type) {
        groupedBlocks.push(
          React.createElement(
            currentList.type,
            { key: `list-${groupedBlocks.length}` },
            currentList.items
          )
        );
        currentList = { type: null, items: [] };
      }
      groupedBlocks.push(<BlockRenderer key={index} block={block} />);
    }
  });

  // Close any remaining list
  if (currentList.type) {
    groupedBlocks.push(
      React.createElement(
        currentList.type,
        { key: `list-${groupedBlocks.length}` },
        currentList.items
      )
    );
  }

  return <>{groupedBlocks}</>;
}
