"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Upload,
  ShieldAlert,
  CheckCircle,
  Loader2,
  FileCode,
  Zap,
  Printer,
  Cpu,
  AlertTriangle,
  Download,
  Activity,
  Shield,
  X,
  LayoutDashboard,
} from "lucide-react";

// ─── Quick Sample Synthetic Reports ───────────────────────────────────────────
const SAMPLE_REPORTS: Record<
  string,
  { report: string; source: string; latency: string; emoji: string }
> = {
  "AWS Cloud Arch": {
    emoji: "☁️",
    source: "Anti-Gravity Demo Engine",
    latency: "0.41s",
    report: `### 🛡️ SECURITY RISK SCORE: 72/100 (HIGH)

### 🚨 DETECTED VULNERABILITIES
1. **[HIGH] Exposed S3 Bucket**: Public read access on S3 buckets storing build artifacts exposes sensitive CI/CD pipeline outputs to the internet.
2. **[HIGH] Missing WAF on ALB**: Application Load Balancer lacks Web Application Firewall rules, exposing endpoints to SQLi and XSS attack vectors.
3. **[MEDIUM] IAM Wildcard Policies**: Several Lambda execution roles use \`"Action": "*"\` wildcard — violates least-privilege principle.
4. **[LOW] CloudTrail Gaps**: CloudTrail logging not enabled in all regions, creating audit trail blind spots.

### 🛠️ RECOMMENDED ARCHITECTURE PATCH
\`\`\`yaml
Resources:
  S3BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref ArtifactBucket
      PolicyDocument:
        Statement:
          - Effect: Deny
            Principal: "*"
            Action: "s3:*"
            Condition:
              Bool:
                aws:SecureTransport: false
  WAFWebACL:
    Type: AWS::WAFv2::WebACL
    Properties:
      Scope: REGIONAL
      DefaultAction:
        Block: {}
\`\`\`

### ⚡ ANTI-GRAVITY AGENT SUMMARY
- Threat Level: HIGH (Remediation within 48h recommended)
- Compliance Status: OWASP Top 10 — A01:2021 Broken Access Control violated`,
  },
  "Microservice Gateway": {
    emoji: "🔗",
    source: "Anti-Gravity Demo Engine",
    latency: "0.38s",
    report: `### 🛡️ SECURITY RISK SCORE: 58/100 (MEDIUM)

### 🚨 DETECTED VULNERABILITIES
1. **[HIGH] API Gateway — No Rate Limiting**: Ingress endpoint lacks throttle policies, enabling brute-force and DDoS amplification attacks.
2. **[MEDIUM] Service-to-Service Plaintext**: Internal gRPC channels between Order and Inventory services run over HTTP/1.1 without mTLS.
3. **[MEDIUM] Secrets in Environment Variables**: Database credentials injected via ENV instead of a secrets manager (Vault / AWS SSM Parameter Store).
4. **[LOW] Missing Circuit Breaker**: No fallback isolation between Payment and Notification services — cascading failure risk at scale.

### 🛠️ RECOMMENDED ARCHITECTURE PATCH
\`\`\`yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT
---
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: gateway-rate-limit
spec:
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        context: GATEWAY
\`\`\`

### ⚡ ANTI-GRAVITY AGENT SUMMARY
- Threat Level: MEDIUM (Schedule patch within current sprint)
- Compliance Status: SOC2 Type II — Control gaps in CC6.1 and CC6.6`,
  },
  "K8s Cluster": {
    emoji: "⚙️",
    source: "Anti-Gravity Demo Engine",
    latency: "0.29s",
    report: `### 🛡️ SECURITY RISK SCORE: 91/100 (CRITICAL)

### 🚨 DETECTED VULNERABILITIES
1. **[CRITICAL] Privileged Containers Running**: 3 pods with \`securityContext.privileged: true\` — grants full host kernel access, enabling container escape.
2. **[CRITICAL] RBAC ClusterAdmin Overreach**: ServiceAccount bound to \`cluster-admin\` ClusterRole with no namespace scoping — blast radius is entire cluster.
3. **[HIGH] Etcd Exposed Without TLS**: etcd peer port 2380 accessible without client cert authentication — full key-value store at risk.
4. **[HIGH] NodePort Services Exposed**: 4 NodePort services expose internal microservices directly on worker node IPs with no ingress filtering.
5. **[MEDIUM] No Pod Security Standards**: Missing PodSecurityAdmission policy allows privilege escalation via host path mounts.

### 🛠️ RECOMMENDED ARCHITECTURE PATCH
\`\`\`yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: scoped-service-account
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: production
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io
\`\`\`

### ⚡ ANTI-GRAVITY AGENT SUMMARY
- Threat Level: CRITICAL (Immediate cluster isolation required)
- Compliance Status: OWASP Top 10 — A05:2021 Security Misconfiguration violated. CIS Kubernetes Benchmark: FAIL`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseRiskInfo(report: string | null): {
  score: number | null;
  level: string | null;
  owasp: string;
} {
  if (!report) return { score: null, level: null, owasp: "—" };
  const match = report.match(/SECURITY RISK SCORE:\s*(\d+)\/100\s*\(([^)]+)\)/i);
  const owaspFail = /OWASP[^.\n]*(violated|FAIL)/i.test(report);
  const owaspPass = /OWASP[^.\n]*(pass|Passed|compliant)/i.test(report);
  return {
    score: match ? parseInt(match[1]) : null,
    level: match ? match[2].trim() : null,
    owasp: owaspFail ? "Action Needed" : owaspPass ? "Passed" : "Not Checked",
  };
}

function getRiskColors(level: string | null) {
  if (!level) return { bg: "bg-slate-800/60", text: "text-slate-400", border: "border-slate-700", bar: "bg-slate-600" };
  const l = level.toUpperCase();
  if (l.includes("CRITICAL"))
    return { bg: "bg-red-950/50", text: "text-red-400", border: "border-red-500/40", bar: "bg-red-500" };
  if (l.includes("HIGH"))
    return { bg: "bg-orange-950/50", text: "text-orange-400", border: "border-orange-500/40", bar: "bg-orange-500" };
  if (l.includes("MEDIUM"))
    return { bg: "bg-yellow-950/50", text: "text-yellow-400", border: "border-yellow-500/40", bar: "bg-yellow-500" };
  return { bg: "bg-emerald-950/50", text: "text-emerald-400", border: "border-emerald-500/40", bar: "bg-emerald-500" };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [latency, setLatency] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAuditReport(null);
      setError(null);
      setActiveSample(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAuditReport(null);
      setError(null);
      setActiveSample(null);
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
      if (!res.ok) throw new Error(data.detail || "Failed to audit file.");
      setAuditReport(data.audit_report);
      setSource(data.source);
      setLatency(data.latency);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (name: string) => {
    const s = SAMPLE_REPORTS[name];
    if (!s) return;
    setActiveSample(name);
    setFile(null);
    setPreview(null);
    setAuditReport(s.report);
    setSource(s.source);
    setLatency(s.latency);
    setError(null);
  };

  const clearAll = () => {
    setAuditReport(null);
    setFile(null);
    setPreview(null);
    setActiveSample(null);
    setError(null);
    setSource(null);
    setLatency(null);
  };

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ source, latency, audit_report: auditReport }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codepulse-audit-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const { score, level, owasp } = parseRiskInfo(auditReport);
  const risk = getRiskColors(level);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#050a14] text-slate-100 font-sans relative overflow-x-hidden">

      {/* ── Background ambience ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[320px] bg-indigo-700/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-violet-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 py-5 space-y-4">

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/60">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-red-500/25 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-11 h-11 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/10">
                <ShieldAlert
                  className="w-6 h-6 text-red-400"
                  style={{ filter: "drop-shadow(0 0 8px rgba(248,113,113,0.7))" }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                CodePulse <span className="text-indigo-400">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold tracking-[0.15em] uppercase">
                DevSecOps Intelligence Command Center
              </p>
            </div>
          </div>

          {/* Telemetry badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* LM Studio */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/50 rounded-full text-xs font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300">LM Studio (Gemma 4) — On-Device</span>
            </div>
            {/* Anti-Gravity */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/50 rounded-full text-xs font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-300">Anti-Gravity Telemetry Active</span>
            </div>
            {/* Version */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/50 rounded-full text-xs font-medium backdrop-blur-sm">
              <LayoutDashboard className="w-3 h-3 text-indigo-400" />
              <span className="text-indigo-300">v2.0 Engine</span>
            </div>
          </div>
        </header>

        {/* ══ QUICK SAMPLE BAR ════════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">
            Try Quick Samples:
          </span>
          {Object.entries(SAMPLE_REPORTS).map(([name, s]) => (
            <button
              key={name}
              onClick={() => loadSample(name)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                activeSample === name
                  ? "bg-indigo-600/25 border-indigo-500/60 text-indigo-200 shadow-sm shadow-indigo-500/10"
                  : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {s.emoji} {name}
            </button>
          ))}
          {(activeSample || auditReport) && (
            <button
              onClick={clearAll}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-600 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* ══ 3-COLUMN MAIN GRID ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-4">

          {/* ── COL 1 · Upload Control Panel ─────────────────────────────── */}
          <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl shadow-black/40">
            {/* Title */}
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <FileCode className="w-3.5 h-3.5 text-blue-400" /> Upload Control Panel
              </h2>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Drop architecture diagrams, API flowcharts, or code screenshots for threat model analysis.
              </p>
            </div>

            {/* Drop zone */}
            <label
              className="relative border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-7 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-indigo-950/10 transition-all duration-300 group"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Hover radial glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.10)_0%,transparent_70%)]" />

              <div className="relative w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:border-indigo-500/40 flex items-center justify-center mb-3 transition-all duration-300">
                <Upload className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors duration-300" />
              </div>

              <span className="relative text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors duration-300">
                Click or drag artifact here
              </span>
              <span className="relative text-[11px] text-slate-600 mt-0.5">
                Supports image-based artifacts
              </span>

              {/* Format badges */}
              <div className="relative flex gap-1.5 mt-3">
                {["PNG", "JPG", "WEBP"].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-700/60 text-slate-500 text-[10px] font-mono rounded group-hover:border-indigo-500/30 group-hover:text-slate-400 transition-all duration-300"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Selected file info */}
            {file && (
              <div className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-lg flex justify-between items-center">
                <span className="truncate">
                  <span className="text-blue-400 font-semibold">{file.name}</span>
                </span>
                <span className="text-slate-600 shrink-0 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}

            {/* Run Audit CTA */}
            <button
              onClick={runAudit}
              disabled={!file || loading}
              className={`relative w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden group ${
                !file || loading
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
              }`}
              style={
                file && !loading
                  ? { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }
                  : {}
              }
            >
              {/* Hover glow overlay */}
              {file && !loading && (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-[radial-gradient(ellipse_at_50%_0%,rgba(167,139,250,0.35)_0%,transparent_70%)]" />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Auditing Artifact...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Run Visual Security Audit
                  </>
                )}
              </span>
            </button>

            {/* Engine fallback info */}
            <p className="text-[10px] text-slate-700 text-center leading-relaxed">
              Gemma 4 (Local) → Gemini 2.5 Flash (Cloud) → Anti-Gravity Safety Net
            </p>
          </div>

          {/* ── COL 2 · Artifact Inspection ──────────────────────────────── */}
          <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-3 shadow-xl shadow-black/40">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> Artifact Inspection
              </h2>
              {preview && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Payload Mounted
                </span>
              )}
              {activeSample && !preview && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                  </span>
                  Sample Active
                </span>
              )}
            </div>

            {/* Image canvas */}
            <div
              className="flex-1 bg-black/40 border border-slate-800/50 rounded-xl flex items-center justify-center overflow-hidden relative"
              style={{ minHeight: 280 }}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {preview ? (
                <img
                  src={preview}
                  alt="Artifact Preview"
                  className="max-h-64 max-w-full object-contain rounded-lg relative z-10 shadow-2xl"
                />
              ) : activeSample ? (
                <div className="relative z-10 text-center space-y-2 p-6">
                  <div className="text-5xl mb-3">{SAMPLE_REPORTS[activeSample].emoji}</div>
                  <p className="text-sm font-bold text-slate-200">{activeSample}</p>
                  <p className="text-[11px] text-slate-600">Demo sample — synthetic audit loaded</p>
                </div>
              ) : (
                <div className="relative z-10 text-center p-6 space-y-1">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                    <FileCode className="w-6 h-6 text-slate-700" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">No artifact payload active</p>
                  <p className="text-[11px] text-slate-700">Upload an image or select a quick sample above</p>
                </div>
              )}
            </div>

            {/* Metadata pills */}
            {(source || latency) && (
              <div className="flex gap-2">
                {source && (
                  <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 min-w-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">Engine</p>
                    <p className="text-[11px] text-indigo-400 font-semibold truncate">{source}</p>
                  </div>
                )}
                {latency && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 shrink-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">Latency</p>
                    <p className="text-[11px] text-emerald-400 font-semibold">{latency}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── COL 3 · Executive Threat Summary ─────────────────────────── */}
          <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl shadow-black/40">
            {/* Title + toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Executive Threat Summary
              </h2>
              {auditReport && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={exportJSON}
                    id="export-json-btn"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg transition-all duration-200"
                  >
                    <Download className="w-3 h-3" /> Export JSON
                  </button>
                  <button
                    onClick={() => window.print()}
                    id="print-summary-btn"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg transition-all duration-200"
                  >
                    <Printer className="w-3 h-3" /> Print
                  </button>
                </div>
              )}
            </div>

            {/* ── KPI Stat Cards ─── */}
            {auditReport && (
              <div className="grid grid-cols-2 gap-3">
                {/* Risk Score */}
                <div
                  className={`${risk.bg} border ${risk.border} rounded-xl p-3.5 shadow-lg`}
                >
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">
                    Risk Score
                  </p>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className={`text-3xl font-black leading-none ${risk.text}`}>
                      {score ?? "?"}
                    </span>
                    <span className="text-slate-600 text-xs mb-0.5">/100</span>
                  </div>
                  {/* Score bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${risk.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${score ?? 0}%` }}
                    />
                  </div>
                  <p className={`text-[11px] font-bold ${risk.text} uppercase tracking-widest mt-1.5`}>
                    {level ?? "—"}
                  </p>
                </div>

                {/* OWASP Compliance */}
                <div
                  className={`border rounded-xl p-3.5 ${
                    owasp === "Passed"
                      ? "bg-emerald-950/40 border-emerald-500/30"
                      : owasp === "Action Needed"
                      ? "bg-red-950/40 border-red-500/30"
                      : "bg-slate-800/40 border-slate-700/60"
                  }`}
                >
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">
                    OWASP Compliance
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    {owasp === "Passed" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : owasp === "Action Needed" ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Shield className="w-5 h-5 text-slate-600" />
                    )}
                    <span
                      className={`text-sm font-black ${
                        owasp === "Passed"
                          ? "text-emerald-400"
                          : owasp === "Action Needed"
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {owasp}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {owasp === "Passed"
                      ? "All OWASP Top 10 controls satisfied"
                      : owasp === "Action Needed"
                      ? "Review audit report for violations"
                      : "OWASP status undetermined"}
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Terminal Report Window ─── */}
            {auditReport ? (
              <div className="flex-1 bg-black/60 border border-slate-800/70 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: 400 }}>
                {/* macOS-style terminal titlebar */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/60 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  <span className="text-[10px] text-slate-600 ml-2 tracking-wide font-mono">
                    codepulse-audit.md
                  </span>
                </div>
                {/* Report body */}
                <div className="flex-1 overflow-y-auto p-5 font-mono text-xs">
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-white mt-4 mb-2 border-b border-slate-800/70 pb-1.5 font-sans flex items-center gap-1.5 first:mt-0">
                          {children}
                        </h3>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold text-white mt-5 mb-2 font-sans">
                          {children}
                        </h2>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-indigo-300 font-bold">{children}</strong>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2.5 text-slate-300 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 mb-3 text-slate-300 ml-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1.5 mb-3 text-slate-300 ml-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-slate-300 leading-relaxed">{children}</li>
                      ),
                      code: ({
                        inline,
                        children,
                      }: {
                        inline?: boolean;
                        children?: React.ReactNode;
                      }) =>
                        inline ? (
                          <code className="bg-slate-800/80 text-emerald-300 px-1.5 py-0.5 rounded text-[11px]">
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-slate-900/80 border border-slate-700/50 text-emerald-300 text-[11px] p-4 rounded-lg overflow-x-auto leading-relaxed">
                            {children}
                          </code>
                        ),
                      pre: ({ children }) => (
                        <pre className="my-3 rounded-lg overflow-x-auto">{children}</pre>
                      ),
                    }}
                  >
                    {auditReport}
                  </ReactMarkdown>
                </div>
              </div>
            ) : !error ? (
              <div
                className="flex-1 bg-black/40 border border-slate-800/50 rounded-xl flex items-center justify-center"
                style={{ minHeight: 200 }}
              >
                <div className="text-center space-y-2 p-6">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-slate-700" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">No audit report generated yet</p>
                  <p className="text-[11px] text-slate-700">
                    Upload an artifact or select a quick sample to begin
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}