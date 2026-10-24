"use client";

import React, { useState } from "react";
import {
  Upload,
  ShieldAlert,
  CheckCircle,
  Loader2,
  FileCode,
  Zap,
  Printer,
  Cpu,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [latency, setLatency] = useState<string | null>(null);
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
      setSource(data.source);
      setLatency(data.latency);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-white">
              <ShieldAlert className="text-red-500 w-8 h-8" /> CodePulse AI
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-Time Visual Architecture & API Security Auditor
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Gemma 4 + Gemini Engine
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Anti-Gravity Enabled
            </span>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileCode className="text-blue-400" /> Upload Architecture / Code Snippet
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Drag & drop system diagrams, flowcharts, or code screenshots for instant threat model analysis.
              </p>

              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition duration-200 group">
                <Upload className="w-10 h-10 text-slate-500 group-hover:text-blue-400 mb-2 transition" />
                <span className="text-sm font-medium text-slate-300">Click or drop artifact here</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP formats</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {file && (
                <div className="mt-4 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="truncate">Selected: <strong className="text-blue-400">{file.name}</strong></span>
                  <span className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            <button
              onClick={runAudit}
              disabled={!file || loading}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Anti-Gravity Agent Auditing...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" /> Execute Security Audit
                </>
              )}
            </button>
          </div>

          {/* Visual Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-2xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-2">Payload Preview</h2>
            <p className="text-xs text-slate-400 mb-4">Target diagram for visual neural parsing.</p>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden min-h-[240px] p-2">
              {preview ? (
                <img src={preview} alt="Upload Preview" className="max-h-64 object-contain rounded-lg" />
              ) : (
                <div className="text-center p-6 text-slate-600">
                  <FileCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No image payload active</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Report Container */}
        {(auditReport || error) && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <CheckCircle className="text-emerald-400 w-5 h-5" /> DevSecOps Intelligence Report
                </h2>
                {source && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">Engine: <strong className="text-indigo-400">{source}</strong></span>
                    <span className="text-xs text-slate-500">|</span>
                    <span className="text-xs text-slate-400">Latency: <strong className="text-emerald-400">{latency}</strong></span>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            {auditReport && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
                {auditReport}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}