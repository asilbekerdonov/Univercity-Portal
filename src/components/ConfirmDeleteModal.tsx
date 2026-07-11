import "../styles/components/ConfirmDeleteModal.css";

interface ConfirmDeleteModalProps {
  itemName: string;
  itemLabel?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  itemName,
  itemLabel = "faculty",
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Delete {itemLabel}?</h3>
        <p className="modal-text">
          Are you sure you want to delete <strong>{itemName}</strong>? This
          action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            className="button modal-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="button modal-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}