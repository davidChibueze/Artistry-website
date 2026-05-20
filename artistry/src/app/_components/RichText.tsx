import { ReactNode } from 'react';

// Lexical text format bitmask
const BOLD        = 1;
const ITALIC      = 2;
const STRIKETHROUGH = 4;
const UNDERLINE   = 8;
const CODE        = 16;

interface TextNode {
  type: 'text';
  text: string;
  format?: number;
}

interface ElementNode {
  type: string;
  children?: LexNode[];
  tag?: string;
  listType?: 'bullet' | 'number' | 'check';
  url?: string;
  fields?: { url?: string; newTab?: boolean };
  [k: string]: unknown;
}

type LexNode = TextNode | ElementNode;

interface LexicalContent {
  root: { children: LexNode[] };
}

function renderText(node: TextNode, key: number): ReactNode {
  let el: ReactNode = node.text;
  const fmt = node.format ?? 0;
  if (fmt & CODE)          el = <code key={key}>{el}</code>;
  if (fmt & BOLD)          el = <strong key={key}>{el}</strong>;
  if (fmt & ITALIC)        el = <em key={key}>{el}</em>;
  if (fmt & UNDERLINE)     el = <u key={key}>{el}</u>;
  if (fmt & STRIKETHROUGH) el = <s key={key}>{el}</s>;
  return el;
}

function renderChildren(nodes: LexNode[] | undefined): ReactNode {
  if (!nodes) return null;
  return nodes.map((n, i) => renderNode(n, i));
}

function renderNode(node: LexNode, key: number): ReactNode {
  if (node.type === 'text') return renderText(node as TextNode, key);

  const el = node as ElementNode;
  const children = renderChildren(el.children);

  switch (el.type) {
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'heading':
      return el.tag === 'h1' ? <h1 key={key}>{children}</h1>
           : el.tag === 'h2' ? <h2 key={key}>{children}</h2>
           : el.tag === 'h3' ? <h3 key={key}>{children}</h3>
           : el.tag === 'h4' ? <h4 key={key}>{children}</h4>
           : <h5 key={key}>{children}</h5>;
    case 'quote':
      return <blockquote key={key}>{children}</blockquote>;
    case 'list':
      return el.listType === 'number'
        ? <ol key={key}>{children}</ol>
        : <ul key={key}>{children}</ul>;
    case 'listitem':
      return <li key={key}>{children}</li>;
    case 'link': {
      const href = (el.fields as { url?: string })?.url ?? el.url ?? '#';
      const newTab = (el.fields as { newTab?: boolean })?.newTab;
      return <a key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined}>{children}</a>;
    }
    case 'linebreak':
      return <br key={key} />;
    default:
      return <span key={key}>{children}</span>;
  }
}

interface Props {
  content: LexicalContent;
  className?: string;
}

export default function RichText({ content, className }: Props) {
  if (!content?.root?.children) return null;
  return (
    <div className={className}>
      {content.root.children.map((node, i) => renderNode(node, i))}
    </div>
  );
}
