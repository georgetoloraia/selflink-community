import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as communityApi from "../../api/community";

type AgreementModalProps = {
  isOpen: boolean;
  problemId: number | null;
  onClose: () => void;
  onAccepted: () => void;
};

const AgreementModal = ({ isOpen, problemId, onClose, onAccepted }: AgreementModalProps) => {
  const enabled = isOpen && problemId !== null;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agreement", problemId],
    queryFn: () => communityApi.getAgreement(problemId as number),
    enabled,
  });

  const hasAgreement = Boolean(data?.agreement);
  const acceptMutation = useMutation({
    mutationFn: () => communityApi.acceptAgreement(problemId as number),
    onSuccess: () => {
      onAccepted();
      onClose();
    },
  });

  useEffect(() => {
    if (enabled) {
      void refetch();
    }
  }, [enabled, refetch]);

  if (!isOpen || problemId === null) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal large">
        <div className="modal-header">
          <h2>MIT Agreement</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <div>Loading agreement...</div>
          ) : (
            <>
              <div className="agreement-meta">
                <div>License: {data?.agreement?.license_spdx ?? "MIT"}</div>
                <div>Version: {data?.agreement?.version ?? ""}</div>
              </div>
              <div className="agreement-text">
                {data?.agreement?.text ??
                  "No active agreement is configured for this problem. Ask an admin to attach MIT text."}
              </div>
            </>
          )}
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending || !hasAgreement}
            >
              {acceptMutation.isPending ? "Accepting..." : "Accept MIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;
