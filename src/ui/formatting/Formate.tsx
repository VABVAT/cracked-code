import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

interface FormatResponseProps {
  text: string;
}

const Formate: React.FC<FormatResponseProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    setDisplayedText(text);
  }, [text]);

  return (
    <div className="markdown-body">
      <ReactMarkdown
        children={displayedText}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).trim()}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-800 text-white p-1 rounded" {...props}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

export default Formate;
