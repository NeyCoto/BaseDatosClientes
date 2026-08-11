import { useState, useEffect, FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import {
  Customer,
  Campaign,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../../types";
import { getErrorMessage } from "../../services/api";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (body: CreateCustomerRequest | UpdateCustomerRequest) => Promise<Customer>;
  customer: Customer | null;
  campaigns: Campaign[];
}

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  alternative_email: string;
  country: string;
  city: string;
  campaign_id: string;
}

const EMPTY_FORM: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  alternative_email: "",
  country: "",
  city: "",
  campaign_id: "",
};

function customerToForm(c: Customer): FormState {
  return {
    first_name:        c.first_name,
    last_name:         c.last_name,
    email:             c.email,
    phone:             c.phone ?? "",
    alternative_email: c.alternative_email ?? "",
    country:           c.country ?? "",
    city:              c.city ?? "",
    campaign_id:       c.campaign_id ?? "",
  };
}

export function CustomerFormModal({
  isOpen,
  onClose,
  onSave,
  customer,
  campaigns,
}: CustomerFormModalProps) {
  const isEdit = customer !== null;
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(customer ? customerToForm(customer) : EMPTY_FORM);
      setError(null);
    }
  }, [isOpen, customer]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: CreateCustomerRequest | UpdateCustomerRequest = {
        first_name:        form.first_name.trim(),
        last_name:         form.last_name.trim(),
        email:             form.email.trim(),
        phone:             form.phone.trim() || undefined,
        alternative_email: form.alternative_email.trim() || undefined,
        country:           form.country.trim() || undefined,
        city:              form.city.trim() || undefined,
        campaign_id:       form.campaign_id || (isEdit ? null : undefined),
      };

      await onSave(body);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const fieldRow = (
    label: string,
    name: keyof FormState,
    type = "text",
    placeholder = "",
    required = false
  ) => (
    <div className="field">
      <label className="label" htmlFor={`cf-${name}`}>
        {label}
        {required && (
          <span style={{ color: "var(--accent)", marginLeft: "3px" }}>*</span>
        )}
      </label>
      <input
        className="input"
        id={`cf-${name}`}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={loading}
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Customer" : "Create Customer"}
      subtitle={
        isEdit
          ? `Editing ${customer?.first_name} ${customer?.last_name}`
          : "Add a new customer to the CRM"
      }
      width="640px"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        {/* Row: first + last name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {fieldRow("First Name", "first_name", "text", "Juan", true)}
          {fieldRow("Last Name",  "last_name",  "text", "Perez", true)}
        </div>

        {/* Row: email + phone */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {fieldRow("Email", "email", "email", "juan@example.com", true)}
          {fieldRow("Phone", "phone", "text",  "+1 555 000 0000")}
        </div>

        {/* Alternative email */}
        {fieldRow("Alternative Email", "alternative_email", "email", "alt@example.com")}

        {/* Row: country + city */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {fieldRow("Country", "country", "text", "Ecuador")}
          {fieldRow("City",    "city",    "text", "Guayaquil")}
        </div>

        {/* Campaign */}
        <div className="field">
          <label className="label" htmlFor="cf-campaign_id">Campaign</label>
          <select
            className="input"
            id="cf-campaign_id"
            name="campaign_id"
            value={form.campaign_id}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">— No campaign —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
            disabled={loading || !form.first_name || !form.last_name || !form.email}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Spinner size="sm" />
                {isEdit ? "Saving…" : "Creating…"}
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Customer"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
