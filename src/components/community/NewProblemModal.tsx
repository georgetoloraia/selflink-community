import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import * as communityApi from "../../api/community";

type NewProblemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (problem: communityApi.Problem) => void;
  onError: (message: string) => void;
};

const NewProblemModal = ({ isOpen, onClose, onCreated, onError }: NewProblemModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");

  const mutation = useMutation({
    mutationFn: () =>
      communityApi.createProblem({
        title: title.trim(),
        description: description.trim() || undefined,
        status: status.trim() || undefined,
      }),
    onSuccess: (problem) => {
      setTitle("");
      setDescription("");
      setStatus("open");
      onCreated(problem);
      onClose();
    },
    onError: () => {
      onError("Unable to create problem.");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent) => {
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
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </label>
          <label className="field">
            <span>Status</span>
            <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="open" />
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
