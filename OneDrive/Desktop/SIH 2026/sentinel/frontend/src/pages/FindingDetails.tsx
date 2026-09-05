import React, { useState } from 'react';
import { Asset, Finding, AIAnalysisResult } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { VendorBadge } from '../components/VendorBadge';
import { analyzeFinding } from '../services/api';
import { ShieldAlert, Sparkles, Code2, Wrench, AlertTriangle, ArrowLeft, Bot, CheckCircle, RefreshCw, Server } from 'lucide-react';

interface FindingDetailsProps {
  findings: Finding[];
  assets: Asset[];
  selectedFinding: Finding | null;
  onSelectFinding: (finding: Finding) => void;
  onBackToDashboard: () => void;
}

export const FindingDetails: React.FC<FindingDetailsProps> = ({
  findings,
  assets,
  selectedFinding,
  onSelectFinding,
  onBackToDashboard
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Resolve current finding by ensuring selected finding exists in current active findings array
  const currentFinding = React.useMemo(() => {
    if (selectedFinding) {
      const exactMatch = findings.find(f => f.id === selectedFinding.id);
      if (exactMatch) return exactMatch;

      const ruleMatch = findings.find(
        f => f.rule_id === selectedFinding.rule_id && f.asset_id === selectedFinding.asset_id
      );
      if (ruleMatch) return ruleMatch;
    }
    return findings.length > 0 ? findings[0] : null;
  }, [selectedFinding, findings]);

  // Reset AI analysis when selected finding changes
  React.useEffect(() => {
    setAiAnalysis(null);
    setAnalysisError(null);
  }, [currentFinding?.id]);

  const currentAsset = currentFinding 
    ? assets.find(a => a.id === currentFinding.asset_id) 
    : null;

  const handleRunAIAnalysis = async () => {
    if (!currentFinding) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeFinding(currentFinding.id);
      setAiAnalysis(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAnalysisError(message || 'Failed to generate AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset AI analysis when finding changes
  const handleFindingChange = (finding: Finding) => {
    onSelectFinding(finding);
    setAiAnalysis(null);
    setAnalysisError(null);
  };

  if (!currentFinding) {
    return (
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-12 text-center max-w-2xl mx-auto my-12 shadow-xl">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-200">No Finding Selected</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          Please run a scan from the Dashboard or Assets view to inspect security compliance findings.
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </button>

        {/* Finding Selector Dropdown */}
        {findings.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Select Finding:</span>
            <select
              value={currentFinding.id}
              onChange={(e) => {
                const target = findings.find(f => f.id === e.target.value);
                if (target) handleFindingChange(target);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-emerald-500"
            >
              {findings.map(f => (
                <option key={f.id} value={f.id}>
                  [{f.severity}] {f.rule_id} - {f.title.substring(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Finding Overview Card */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-6">
        {/* Finding Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border/80 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={currentFinding.severity} size="lg" />
              <VendorBadge vendor={currentFinding.vendor} />
              <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold">
                {currentFinding.rule_id}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
              {currentFinding.title}
            </h1>
          </div>

          {/* Asset Badge */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs font-mono">
            <Server className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">AFFECTED ASSET</span>
              <span className="text-slate-200 font-semibold">{currentAsset ? currentAsset.name : currentFinding.asset_id}</span>
              <span className="text-slate-500 block text-[10px]">ID: {currentFinding.asset_id}</span>
            </div>
          </div>
        </div>

        {/* Grid: Exact Evidence & Remediation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exact Evidence Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center">
                  <Code2 className="w-4 h-4 mr-1.5" />
                  Exact Evidence
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Non-compliant snippet</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Detected non-compliant CLI configuration rule line:
              </p>
              <pre className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/50 text-rose-300 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {currentFinding.evidence}
              </pre>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-400 font-mono">
              Rule match status: <strong className="text-rose-400">VIOLATION DETECTED</strong>
            </div>
          </div>

          {/* Standard Remediation Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                  <Wrench className="w-4 h-4 mr-1.5" />
                  Standard Remediation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Hardening Guide</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Recommended baseline fix procedure for {currentFinding.vendor.toUpperCase()}:
              </p>
              <pre className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {currentFinding.remediation}
              </pre>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-400 font-mono">
              Status: <strong className="text-yellow-400">PENDING AUDITOR REVISE</strong>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="border-t border-cyber-border pt-6">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-900/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 glow-cyan">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <span>AI Security Intelligence Explanation</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generates executive security analysis, threat impact assessments, and remediation steps.
                  </p>
                </div>
              </div>

              <button
                id="ai-analyze-btn"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg shrink-0 ${
                  isAnalyzing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 glow-cyan border border-cyan-400/50 active:scale-95'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Finding...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{aiAnalysis ? 'Re-Analyze with AI' : 'AI Analyze Finding'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Error banner */}
            {analysisError && (
              <div className="mb-4 p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
                AI Analysis Error: {analysisError}
              </div>
            )}

            {/* Loading state */}
            {isAnalyzing && (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 my-4">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <span className="text-xs font-mono text-cyan-300 font-semibold block">
                  Processing configuration context with Sentinel AI Engine...
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Evaluating threat impact & vector details
                </span>
              </div>
            )}

            {/* AI Analysis Result Display */}
            {aiAnalysis && !isAnalyzing && (
              <div className="space-y-4 animate-fadeIn">
                {/* AI Provider Header */}
                <div className="flex items-center justify-between bg-slate-950/90 px-4 py-2.5 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">Engine Provider:</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                    {aiAnalysis.ai_provider}
                  </span>
                </div>

                {/* 3 Key Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Why It Matters */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-yellow-400 font-mono text-xs font-bold uppercase border-b border-slate-800/80 pb-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Why It Matters</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {aiAnalysis.why_it_matters}
                    </p>
                  </div>

                  {/* Potential Impact */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase border-b border-slate-800/80 pb-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Potential Impact</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {aiAnalysis.potential_impact}
                    </p>
                  </div>

                  {/* Recommended Fix */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase border-b border-slate-800/80 pb-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Recommended Fix</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1 font-mono">
                      {aiAnalysis.recommended_fix}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
