import React, { useState } from 'react';
import { Asset, Finding } from '../types';
import { VendorBadge } from '../components/VendorBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { Server, Play, RefreshCw, ChevronUp, FileCode, ShieldAlert } from 'lucide-react';

interface AssetsProps {
  assets: Asset[];
  findings: Finding[];
  scanningAssetId: string | null;
  onScanAsset: (assetId: string) => void;
  onViewAssetFindings: (assetId: string) => void;
}

export const Assets: React.FC<AssetsProps> = ({
  assets,
  findings,
  scanningAssetId,
  onScanAsset,
  onViewAssetFindings
}) => {
  const [expandedConfigAssetId, setExpandedConfigAssetId] = useState<string | null>(null);

  const toggleConfig = (assetId: string) => {
    setExpandedConfigAssetId(prev => prev === assetId ? null : assetId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Monitored Infrastructure Assets</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
              3 Assets Registered
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Target network appliances and Linux servers undergoing automated baseline compliance verification.
          </p>
        </div>
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-1 gap-6">
        {assets.map((asset) => {
          const assetFindings = findings.filter(f => f.asset_id === asset.id);
          const criticalCount = assetFindings.filter(f => f.severity === 'CRITICAL').length;
          const highCount = assetFindings.filter(f => f.severity === 'HIGH').length;
          const mediumCount = assetFindings.filter(f => f.severity === 'MEDIUM').length;
          const lowCount = assetFindings.filter(f => f.severity === 'LOW').length;
          const isScanningThis = scanningAssetId === asset.id;
          const isExpanded = expandedConfigAssetId === asset.id;

          // Determine status text & risk level badge
          const getRiskBadge = () => {
            if (criticalCount > 0) {
              return { label: 'CRITICAL RISK', color: 'bg-rose-950/70 text-rose-400 border-rose-700/50' };
            }
            if (highCount > 0) {
              return { label: 'HIGH RISK', color: 'bg-amber-950/70 text-amber-400 border-amber-700/50' };
            }
            if (assetFindings.length > 0) {
              return { label: 'MODERATE RISK', color: 'bg-yellow-950/70 text-yellow-300 border-yellow-700/50' };
            }
            return { label: 'COMPLIANT / SECURE', color: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/50' };
          };

          const riskBadge = getRiskBadge();

          return (
            <div
              key={asset.id}
              className="bg-cyber-card border border-cyber-border rounded-xl shadow-xl overflow-hidden hover:border-slate-700 transition-colors"
            >
              {/* Asset Header Info */}
              <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-cyber-border/60">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                    <Server className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-slate-100">{asset.name}</h2>
                      <VendorBadge vendor={asset.vendor} />
                      <span className={`text-xs px-2.5 py-0.5 rounded border font-mono font-semibold ${riskBadge.color}`}>
                        {riskBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                      <span>Asset ID: <strong className="text-slate-200">{asset.id}</strong></span>
                      <span>•</span>
                      <span>Format: <strong className="text-slate-300 uppercase">{asset.vendor} CLI Config</strong></span>
                    </div>
                  </div>
                </div>

                {/* Finding Count Badges & Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Finding Pill Stats */}
                  <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800 flex items-center space-x-4">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-mono block">TOTAL</span>
                      <span className="text-base font-bold text-slate-100 font-mono">{assetFindings.length}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="text-center">
                      <span className="text-[10px] text-rose-400 font-mono block">CRIT</span>
                      <span className="text-base font-bold text-rose-400 font-mono">{criticalCount}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-amber-400 font-mono block">HIGH</span>
                      <span className="text-base font-bold text-amber-400 font-mono">{highCount}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-yellow-300 font-mono block">MED/LOW</span>
                      <span className="text-base font-bold text-yellow-300 font-mono">{mediumCount + lowCount}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onScanAsset(asset.id)}
                      disabled={isScanningThis}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        isScanningThis
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
                          : 'bg-emerald-600/90 hover:bg-emerald-500 text-slate-950 border-emerald-400/50 glow-emerald'
                      }`}
                    >
                      {isScanningThis ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run Asset Scan</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onViewAssetFindings(asset.id)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Findings ({assetFindings.length})</span>
                    </button>

                    <button
                      onClick={() => toggleConfig(asset.id)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                      title="Toggle Configuration Source"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Findings Snippet Preview */}
              {assetFindings.length > 0 && (
                <div className="px-6 py-4 bg-slate-950/40 border-b border-cyber-border/40">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                    Detected Non-Compliant Rules:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {assetFindings.map(f => (
                      <div
                        key={f.id}
                        className="inline-flex items-center text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 space-x-2"
                      >
                        <SeverityBadge severity={f.severity} size="sm" />
                        <span className="font-mono text-emerald-400">{f.rule_id}</span>
                        <span className="text-slate-400 truncate max-w-[200px]">{f.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Raw Config Snippet */}
              {isExpanded && (
                <div className="p-6 bg-slate-950 border-t border-slate-800 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider flex items-center">
                      <FileCode className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                      Raw Asset Configuration Snapshot ({asset.name})
                    </span>
                    <span className="text-slate-500 text-[10px]">Read-only</span>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto text-emerald-400/90 leading-relaxed max-h-64">
                    {asset.config_raw}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
