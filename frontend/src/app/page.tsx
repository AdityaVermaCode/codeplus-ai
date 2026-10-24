"client";

import React, { useState } from "react";
import { Upload, ShieldAlert, CheckCircle, Loader2, FileCode } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAuditReport(null);
      setError(null);
    }
  };

  const runAudit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/audit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to audit file.");
      }

      setAuditReport(data.audit_report);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-red-500" /> CodePulse AI
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-Time Visual Architecture & API Security Auditor (Powered by Gemma 4)
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
            Hacktoberfest x OSW
          </span>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileCode className="text-blue-400" /> Upload Artifact
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Upload an architecture diagram, flow chart, or code screenshot for deep security scanning.
              </p>

              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 transition duration-200">
                <Upload className="w-10 h-10 text-slate-500 mb-2" />
                <span className="text-sm font-medium text-slate-300">Click to browse or drop image</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {file && (
                <div className="mt-4 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800 truncate">
                  Selected: <span className="text-blue-400">{file.name}</span>
                </div>
              )}
            </div>

            <button
              onClick={runAudit}
              disabled={!file || loading}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing via Gemma 4...
                </>
              ) : (
                "Run Security Audit"
              )}
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Artifact Preview</h2>
            <p className="text-sm text-slate-400 mb-4">Visual representation of input payload.</p>
            
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden min-h-[220px]">
              {preview ? (
                <img src={preview} alt="Upload Preview" className="max-h-64 object-contain rounded-lg" />
              ) : (
                <span className="text-sm text-slate-600 italic">No image uploaded yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(auditReport || error) && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="text-emerald-400" /> Audit Intelligence Report
            </h2>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            {auditReport && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {auditReport}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}