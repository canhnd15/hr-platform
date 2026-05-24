import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  if (!source) return null;
  return (
    <div className={`md-content ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
