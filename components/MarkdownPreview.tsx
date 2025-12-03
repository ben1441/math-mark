import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { MarkdownPreviewProps } from '../types';

// Custom renderers to ensure Tailwind Typography styles are applied correctly
// and to fix specific element rendering if needed.
const components = {
  // Can override specific elements here if standard typography plugin isn't enough
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-apple-500 prose-img:rounded-xl prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-table:border-collapse prose-table:w-full">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, { strict: false }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};