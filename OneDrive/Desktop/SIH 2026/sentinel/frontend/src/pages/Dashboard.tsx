import React from 'react';
import { Asset, Finding } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { VendorBadge } from '../components/VendorBadge';
import { ShieldCheck, ShieldAlert, AlertOctagon, AlertTriangle, AlertCircle, Play, RefreshCw, ChevronRight, Cpu } from 'lucide-react';

interface DashboardProps {
  assets: Asset[];
  findings: Finding[];
  isScanning: boolean;
  onRunScan: () => void;
  onSelectFinding: (finding: Finding) => void;
  onNavigateToAssets: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  assets,
  findings,
  isScanning,
  onRunScan,
  onSelectFinding,
  onNavigateToAssets
}) => {
  // Count findings by severity
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;
  const totalFindings = findings.length;

  // Calculate dynamic security score (100 base, deducted by findings)
  const calculateSecurityScore = () => {
    if (totalFindings === 0) return 100;
    const penalty = (criticalCount * 22) + (highCount * 12) + (mediumCount * 6) + (lowCount * 2);
    return Math.max(5, Math.min(100, Math.round(100 - penalty)));
  };

  const securityScore = calculateSecurityScore();

  const getScoreColor = (score: number) => {
    if (score >= 85) return { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30', status: 'STRONG POSTURE' };
    if (score >= 60) return { text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-950/30', status: 'ATTENTION NEEDED' };
    return { text: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/30', status: 'HIGH RISK POSTURE' };
  };

  const scoreInfo = getScoreColor(securityScore);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Welcome Action */}
      <div className="bg-gradient-to-r from-cyber-card via-slate-900 to-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Security Posture Dashboard</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Live Monitor
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real-time compliance findings & risk scoring across multi-vendor infrastructure assets.
          </p>
        </div>

        <button
          id="dashboard-run-scan-btn"
          onClick={onRunScan}
          disabled={isScanning}
          className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            isScanning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 glow-emerald border border-emerald-400/50 active:scale-95'
          }`}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning Infrastructure...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Compliance Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Security Score Card */}
        <div className={`lg:col-span-2 bg-cyber-card border ${scoreInfo.border} ${scoreInfo.bg} rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">Overall Security Score</span>
            <ShieldCheck className={`w-5 h-5 ${scoreInfo.text}`} />
          </div>

          <div className="flex items-baseline space-x-3 my-2">
            <span className={`text-5xl font-extrabold font-mono tracking-tight ${scoreInfo.text}`}>
              {securityScore}
            </span>
            <span className="text-xl font-semibold text-slate-500 font-mono">/ 100</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-2">
            <span className={`text-xs font-mono font-bold tracking-wider ${scoreInfo.text}`}>
              {scoreInfo.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {totalFindings} total issues detected
            </span>
          </div>
        </div>

        {/* Total Assets Card */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Monitored Assets</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold font-mono text-slate-100">{assets.length}</span>
            <span className="text-xs text-slate-400 block mt-1">Cisco, Fortinet, Linux</span>
          </div>
          <button 
            onClick={onNavigateToAssets}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center mt-2 group"
          >
            <span>View All Assets</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Critical Findings Card */}
        <div className="bg-cyber-card border border-rose-900/40 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Critical</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold font-mono text-rose-400">{criticalCount}</span>
            <span className="text-xs text-slate-400 block mt-1">Immediate action required</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">High priority risks</span>
        </div>

        {/* High Findings Card */}
        <div className="bg-cyber-card border border-amber-900/40 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">High</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold font-mono text-amber-400">{highCount}</span>
            <span className="text-xs text-slate-400 block mt-1">Severe compliance gaps</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Action required</span>
        </div>

        {/* Medium / Low Findings Card */}
        <div className="bg-cyber-card border border-yellow-900/30 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono font-bold">Medium / Low</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-bold font-mono text-yellow-300">{mediumCount + lowCount}</span>
            <span className="text-xs text-slate-400 block mt-1">Medium: {mediumCount} | Low: {lowCount}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Baseline policy issues</span>
        </div>
      </div>

      {/* Main Content Grid: Recent Findings Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>Compliance Scan Findings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any finding to inspect evidence, remediation steps, and run AI analysis.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              {findings.length} findings loaded
            </span>
          </div>
        </div>

        {findings.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-slate-200">No Findings Available</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Trigger a scan against pre-configured network assets to detect non-compliant configurations.
            </p>
            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs"
            >
              Run Compliance Scan Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[11px] border-b border-cyber-border">
                <tr>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Rule ID</th>
                  <th className="px-5 py-3.5">Finding Title</th>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Target Asset</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {findings.map((finding) => {
                  const targetAsset = assets.find(a => a.id === finding.asset_id);
                  return (
                    <tr
                      key={finding.id}
                      onClick={() => onSelectFinding(finding)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <SeverityBadge severity={finding.severity} />
                      </td>
                      <td className="px-5 py-4 font-mono text-emerald-400 font-medium whitespace-nowrap">
                        {finding.rule_id}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-200 max-w-xs truncate group-hover:text-emerald-300 transition-colors">
                        {finding.title}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <VendorBadge vendor={finding.vendor} />
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap font-mono">
                        {targetAsset ? targetAsset.name : finding.asset_id}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-400 group-hover:underline">
                          Inspect & Analyze
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
