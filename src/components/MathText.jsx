import React from 'react';
import katex from 'katex';

export default function MathText({ text }) {
  if (!text) return null;

  const renderFormattedText = (str) => {
    const parts = str.split(/(\$[^$]+\$)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        try {
          const html = katex.renderToString(math, { throwOnError: false });
          return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          return <span key={idx}>{part}</span>;
        }
      }
      return <span key={idx} className="whitespace-pre-line">{part}</span>;
    });
  };

  return <div className="inline-block">{renderFormattedText(text)}</div>;
}