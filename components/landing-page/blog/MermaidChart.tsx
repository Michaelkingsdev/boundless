'use client';

import React, { useEffect, useId, useState } from 'react';

function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children.trim();
  if (Array.isArray(children))
    return children.map(getTextContent).join('').trim();
  if (children && typeof children === 'object' && 'props' in children) {
    return getTextContent(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props
        .children
    );
  }
  return String(children ?? '').trim();
}

interface MermaidChartProps {
  children?: React.ReactNode;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ children }) => {
  const id = useId().replace(/:/g, '');
  const containerId = `mermaid-${id}`;
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  const source = getTextContent(children);

  useEffect(() => {
    if (!source) return;

    let cancelled = false;

    const run = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });
        const { svg: rendered } = await mermaid.render(containerId, source);
        if (!cancelled) {
          setError(null);
          setSvg(rendered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Mermaid render failed'
          );
          setSvg(null);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [source, containerId]);

  if (error) {
    return (
      <div className='border-warning-300/30 bg-warning-50/10 dark:border-warning-400/30 dark:bg-warning-900/10 my-6 rounded-lg border p-4'>
        <p className='text-warning-600 dark:text-warning-400 mb-2 text-xs font-semibold tracking-wider uppercase'>
          Diagram (render failed)
        </p>
        <pre className='text-muted-foreground font-mono text-sm whitespace-pre-wrap'>
          {source}
        </pre>
        <p className='text-warning-600 dark:text-warning-400 mt-2 text-xs'>
          {error}
        </p>
      </div>
    );
  }

  if (svg) {
    return (
      <div
        className='bg-background-card my-6 flex justify-center rounded-lg border border-gray-900 p-4'
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div className='bg-background-card my-6 rounded-lg border border-gray-900 p-4'>
      <p className='mb-2 text-xs font-semibold tracking-wider text-gray-600 uppercase'>
        Diagram
      </p>
      <pre className='text-muted-foreground font-mono text-sm whitespace-pre-wrap'>
        {source}
      </pre>
    </div>
  );
};

export default MermaidChart;
