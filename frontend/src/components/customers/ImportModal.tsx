import { useState, useRef } from "react";
import { Modal } from "../ui/Modal";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import { importCustomers } from "../../services/customers.service";
import { CustomerImportResult, CustomerImportError } from "../../types";
import { getErrorMessage } from "../../services/api";

type ImportStep = "select" | "ready" | "uploading" | "success" | "errors";

const ACCEPTED_EXTENSION   = ".xlsx";
const MAX_FILE_SIZE_MB     = 5;
const MAX_FILE_SIZE_BYTES  = MAX_FILE_SIZE_MB * 1024 * 1024;

const EXPECTED_COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "company",
  "country",
  "city",
  "campaign",
];

const REQUIRED_COLUMNS = ["first_name", "last_name"];

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ImportModal({ isOpen, onClose, onImported }: ImportModalProps) {
  const [step, setStep]           = useState<ImportStep>("select");
  const [file, setFile]           = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [result, setResult]       = useState<CustomerImportResult | null>(null);
  const [hardError, setHardError] = useState<string | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setStep("select");
    setFile(null);
    setClientError(null);
    setResult(null);
    setHardError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const prevOpenRef = useRef(false);
  if (isOpen && !prevOpenRef.current) handleOpen();
  prevOpenRef.current = isOpen;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setClientError(null);
    setFile(null);

    if (!selected) { setStep("select"); return; }

    if (!selected.name.toLowerCase().endsWith(ACCEPTED_EXTENSION)) {
      setClientError(`Invalid file type. Only ${ACCEPTED_EXTENSION} files are accepted.`);
      setStep("select");
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setClientError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      setStep("select");
      return;
    }

    if (selected.size === 0) {
      setClientError("The selected file is empty.");
      setStep("select");
      return;
    }

    setFile(selected);
    setStep("ready");
  }

  async function handleImport() {
    if (!file) return;
    setStep("uploading");
    setHardError(null);
    setResult(null);

    try {
      const importResult = await importCustomers(file);
      setResult(importResult);
      if (importResult.errors.length > 0) {
        setStep("errors");
      } else {
        setStep("success");
        onImported();
      }
    } catch (err) {
      setHardError(getErrorMessage(err));
      setStep("errors");
    }
  }

  function handleClose() {
    if (step === "uploading") return;
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Customers"
      subtitle="Upload an Excel file to bulk-import customer records"
      width="620px"
      preventClose={step === "uploading"}
    >
      {/* ── select / ready ── */}
      {(step === "select" || step === "ready") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Format instructions */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                marginBottom: "8px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Required Excel format
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {EXPECTED_COLUMNS.map((col) => (
                <span
                  key={col}
                  style={{
                    padding: "2px 8px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: REQUIRED_COLUMNS.includes(col)
                      ? "var(--accent)"
                      : "var(--text-muted)",
                  }}
                >
                  {col}
                  {REQUIRED_COLUMNS.includes(col) && " *"}
                </span>
              ))}
            </div>
            <p
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                marginTop: "8px",
              }}
            >
              <span style={{ color: "var(--accent)" }}>*</span> Required.
              Max {MAX_FILE_SIZE_MB} MB · Max 1000 rows · .xlsx only
            </p>
          </div>

          {/* File picker */}
          <div className="field">
            <label className="label" htmlFor="import-file">Select Excel file</label>
            <input
              ref={fileInputRef}
              id="import-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => fileInputRef.current?.click()}
                style={{ flexShrink: 0 }}
              >
                Choose file…
              </button>
              <span
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  color: file ? "var(--text)" : "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file ? file.name : "No file selected"}
              </span>
            </div>
          </div>

          {file && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                background: "var(--green-dim)",
                border: "1px solid var(--green)",
              }}
            >
              <span style={{ fontSize: "18px" }}>✓</span>
              <div>
                <div style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 500 }}>
                  {file.name}
                </div>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "2px" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          )}

          {clientError && <Alert type="error" message={clientError} />}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
            <button type="button" className="btn-ghost" onClick={handleClose}>Cancel</button>
            <button type="button" className="btn-primary" disabled={!file} onClick={() => void handleImport()}>
              Import Customers
            </button>
          </div>
        </div>
      )}

      {/* ── uploading ── */}
      {step === "uploading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px 0" }}>
          <Spinner size="lg" />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: "14px", fontWeight: 500 }}>
              Importing customers…
            </p>
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>
              Validating rows and inserting records. Please wait.
            </p>
          </div>
        </div>
      )}

      {/* ── success ── */}
      {step === "success" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Alert type="success" message={`${result.imported} customer${result.imported !== 1 ? "s" : ""} imported successfully.`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
            {[
              { label: "Total Rows", value: result.totalRows, color: "var(--text)" },
              { label: "Imported",   value: result.imported,  color: "var(--green)" },
              { label: "Failed",     value: result.failed,    color: "var(--text-muted)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--surface-2)", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontFamily: "var(--font-mono)", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={handleClose}>Done</button>
          </div>
        </div>
      )}

      {/* ── errors ── */}
      {step === "errors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {hardError && !result && <Alert type="error" message={hardError} />}

          {result && (
            <>
              <Alert type="error" message={`Import failed: ${result.failed} error${result.failed !== 1 ? "s" : ""} found. No records were inserted.`} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
                {[
                  { label: "Total Rows", value: result.totalRows, color: "var(--text)" },
                  { label: "Imported",   value: result.imported,  color: "var(--text-muted)" },
                  { label: "Failed",     value: result.failed,    color: "var(--red)" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "var(--surface-2)", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontFamily: "var(--font-mono)", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {result.errors.length > 0 && (
                <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid var(--border)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-2)", position: "sticky", top: 0 }}>
                        {["Row", "Field", "Value", "Error"].map((h) => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err: CustomerImportError, idx: number) => (
                        <tr key={idx} style={{ borderBottom: idx < result.errors.length - 1 ? "1px solid var(--border)" : "none", background: idx % 2 === 0 ? "transparent" : "var(--surface-2)" }}>
                          <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", whiteSpace: "nowrap" }}>{err.row}</td>
                          <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{err.field ?? "—"}</td>
                          <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{err.value ?? "—"}</td>
                          <td style={{ padding: "8px 12px", fontSize: "12px", color: "var(--red)", fontFamily: "var(--font-mono)" }}>{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" onClick={handleClose}>Close</button>
            <button
              className="btn-primary"
              onClick={() => {
                setStep("select");
                setFile(null);
                setResult(null);
                setHardError(null);
                setClientError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
