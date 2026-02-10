import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "highlight.js/styles/github-dark.css";

type MarkdownProps = {
  value: string;
  className?: string;
};

type MarkdownCodeProps = React.ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
  node?: unknown;
};

const Markdown = ({ value, className }: MarkdownProps) => {
  const content = value ?? "";
  const classes = ["markdown-render", className].filter(Boolean).join(" ");
  const baseAttributes = defaultSchema.attributes ?? {};
  const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
      ...baseAttributes,
      code: [...(baseAttributes.code ?? []), ["className"]],
      pre: [...(baseAttributes.pre ?? []), ["className"]],
      span: [...(baseAttributes.span ?? []), ["className"]],
    },
  };

  if (!content.trim()) {
    return <div className={classes} />;
  }

  const components: Components = {
    a: ({ children, ...props }) => (
      <a {...props} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    ),
    code: (props) => {
      const { children, className: codeClassName, inline, ...rest } = props as MarkdownCodeProps;
      if (inline) {
        return (
          <code className="markdown-inline-code" {...rest}>
            {children}
          </code>
        );
      }

      return (
        <pre className="markdown-code-block">
          <code className={codeClassName} {...rest}>
            {children}
          </code>
        </pre>
      );
    },
  };

  return (
    <div className={classes}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, [rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
