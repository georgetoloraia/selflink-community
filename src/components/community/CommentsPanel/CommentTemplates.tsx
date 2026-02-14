import type { CommentTemplate } from "./commentTemplates";

type CommentTemplatesProps = {
  templates: CommentTemplate[];
  onTemplateClick: (templateValue: string, buttonEl: HTMLButtonElement | null) => void;
};

const CommentTemplates = ({ templates, onTemplateClick }: CommentTemplatesProps) => {
  return (
    <div className="comment-templates">
      <div className="comment-templates-title">How you can help</div>
      <div className="comment-templates-subtitle">Not sure what to write? Pick a role.</div>
      <div className="comment-templates-actions">
        {templates.map((template) => (
          <button
            key={template.label}
            type="button"
            className="btn secondary comment-template-btn"
            onClick={(event) => onTemplateClick(template.value, event.currentTarget)}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommentTemplates;
