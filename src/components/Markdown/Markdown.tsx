import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type MarkdownProps = {
  value: string;
  className?: string;
};

const Markdown = ({ value, className }: MarkdownProps) => {
  const content = value ?? "";
  const classes = ["markdown-render", className].filter(Boolean).join(" ");

  if (!content.trim()) {
    return <div className={classes} />;
  }

  return (
    <div className={classes}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
          code: ({ children, className: codeClassName, inline, ...props }) => {
            if (inline) {
              return (
                <code className="markdown-inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <pre className="markdown-code-block">
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
