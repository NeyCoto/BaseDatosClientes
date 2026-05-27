import { useState, FormEvent } from "react";
import { createUser } from "../../services/users.service";
import { CreateUserRequest, UserRole, USER_ROLES } from "../../types";
import { getErrorMessage } from "../../services/api";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";

interface CreateUserFormProps {
  onCreated: () => void;
}

interface FormState {
  username: string;
  password: string;
  role: UserRole;
}

const INITIAL_STATE: FormState = {
  username: "",
  password: "",
  role: "general",
};

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
  const [form, setForm]       = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const body: CreateUserRequest = {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      };
      const created = await createUser(body);
      setSuccess(`User "${created.username}" created successfully`);
      setForm(INITIAL_STATE);
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create User</h2>
        <p className="card-subtitle">Add a new system user with a role assignment</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Username */}
        <div className="field">
          <label className="label" htmlFor="username">Username</label>
          <input
            className="input"
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="e.g. john_doe"
            autoComplete="off"
            required
            minLength={3}
            maxLength={50}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        {/* Role */}
        <div className="field">
          <label className="label" htmlFor="role">Role</label>
          <select
            className="input"
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={loading}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {error   && <Alert type="error"   message={error}   />}
        {success && <Alert type="success" message={success} />}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !form.username || !form.password}
          style={{ marginTop: "4px" }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
              <Spinner size="sm" /> Creating…
            </span>
          ) : (
            "Create User"
          )}
        </button>
      </form>
    </div>
  );
}
