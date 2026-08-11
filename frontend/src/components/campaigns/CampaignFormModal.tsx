import { useState, useEffect, FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "../../types";
import { getErrorMessage } from "../../services/api";

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    body: CreateCampaignRequest | UpdateCampaignRequest
  ) => Promise<Campaign>;
  campaign: Campaign | null; // null = create mode, Campaign = edit mode
}

interface FormState {
  name: string;
  description: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  is_active: true,
};

function campaignToForm(c: Campaign): FormState {
  return {
    name: c.name,
    description: c.description ?? "",
    is_active: c.is_active,
  };
}

export function CampaignFormModal({
  isOpen,
  onClose,
  onSave,
  campaign,
}: CampaignFormModalProps) {
  const isEdit = campaign !== null;
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(campaign ? campaignToForm(campaign) : EMPTY_FORM);
      setError(null);
    }
  }, [isOpen, campaign]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: CreateCampaignRequest | UpdateCampaignRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        is_active: form.is_active,
      };

      await onSave(body);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "Create Campaign"}
      subtitle={
        isEdit
          ? `Editing "${campaign?.name}"`
          : "Add a new marketing campaign"
      }
      width="540px"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Name */}
        <div className="field">
          <label className="label" htmlFor="camp-name">
            Campaign Name
            <span style={{ color: "var(--accent)", marginLeft: "3px" }}>*</span>
          </label>
          <input
            className="input"
            id="camp-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Spring Campaign 2025"
            required
            maxLength={255}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="field">
          <label className="label" htmlFor="camp-description">
            Description
          </label>
          <textarea
            className="input"
            id="camp-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional campaign description"
            rows={3}
            disabled={loading}
            style={{ resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "13px" }}
          />
        </div>

        {/* Active toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <input
            type="checkbox"
            id="camp-is_active"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            disabled={loading}
            style={{ width: "16px", height: "16px", accentColor: "var(--accent)", cursor: "pointer" }}
          />
          <label
            htmlFor="camp-is_active"
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Campaign is active
          </label>
        </div>

        {error && <Alert type="error" message={error} />}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "4px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !form.name.trim()}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Spinner size="sm" />
                {isEdit ? "Saving…" : "Creating…"}
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Campaign"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
