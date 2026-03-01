import React from 'react';
import { Badge } from '@/components/ui/badge';
import MermaidChart from './MermaidChart';
function MdxCode({
  children,
  className,
  ...props
}: React.ComponentProps<'code'>) {
  // Inline code (no className) vs fenced code block (has language-* className)
  const isBlock = !!className;
  if (!isBlock) {
    return (
      <code
        className='bg-muted text-primary rounded px-1.5 py-0.5 font-mono text-sm'
        {...props}
      >
        {children}
      </code>
    );
  }
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function MdxPre({ children, ...props }: React.ComponentProps<'pre'>) {
  return (
    <pre
      className='bg-background-card my-6 overflow-x-auto rounded-lg border border-gray-900 p-4 text-sm leading-relaxed'
      {...props}
    >
      {children}
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------
function MdxTable({ children, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className='my-6 w-full overflow-x-auto rounded-lg border border-gray-900'>
      <table
        className='text-muted-foreground w-full border-collapse text-sm'
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function MdxThead({ children, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead className='bg-section text-foreground' {...props}>
      {children}
    </thead>
  );
}

function MdxTh({ children, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className='border-b border-gray-900 px-4 py-3 text-left font-semibold'
      {...props}
    >
      {children}
    </th>
  );
}

function MdxTd({ children, ...props }: React.ComponentProps<'td'>) {
  return (
    <td className='border-b border-gray-900 px-4 py-3' {...props}>
      {children}
    </td>
  );
}

function MdxTr({ children, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr className='hover:bg-section/50 transition-colors' {...props}>
      {children}
    </tr>
  );
}

function MdxTbody({ children, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody {...props}>{children}</tbody>;
}

// ---------------------------------------------------------------------------
// Mermaid diagram — client component that renders with mermaid.js
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Exported component map — passed to compileMDX
// ---------------------------------------------------------------------------
export const mdxComponents = {
  // HTML element overrides
  pre: MdxPre,
  code: MdxCode,
  table: MdxTable,
  thead: MdxThead,
  tbody: MdxTbody,
  th: MdxTh,
  td: MdxTd,
  tr: MdxTr,
  // Named components usable inside .mdx files as <Badge> / <Mermaid>
  Badge,
  Mermaid: MermaidChart,
};
