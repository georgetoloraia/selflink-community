import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import * as communityApi from "../../api/community";
import Markdown from "../Markdown/Markdown";

type NewProblemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (problem: communityApi.Problem) => void;
  onError: (message: string) => void;
};

const NewProblemModal = ({ isOpen, onClose, onCreated, onError }: NewProblemModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const mutation = useMutation({
    mutationFn: () =>
      communityApi.createProblem({
        title: title.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (problem) => {
      setTitle("");
      setDescription("");
      setActiveTab("write");
      onCreated(problem);
      onClose();
    },
    onError: () => {
      onError("Unable to create problem.");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>New Problem</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input name="problem-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            <span>Description</span>
            <div className="markdown-tabs" role="tablist" aria-label="Description editor tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "write"}
                className={`markdown-tab${activeTab === "write" ? " active" : ""}`}
                onClick={() => setActiveTab("write")}
              >
                Write
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "preview"}
                className={`markdown-tab${activeTab === "preview" ? " active" : ""}`}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
            </div>
            {activeTab === "write" ? (
            <textarea
              name="problem-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            ) : (
              <div className="markdown-preview" role="tabpanel">
                {description.trim() ? (
                  <Markdown value={description} />
                ) : (
                  <div className="markdown-preview-empty">Nothing to preview yet.</div>
                )}
              </div>
            )}
            {activeTab === "write" ? (
              <div className="field-hint">Supports Markdown: headings, lists, links, code blocks.</div>
            ) : null}
          </label>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProblemModal;
