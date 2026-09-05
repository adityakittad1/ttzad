import React from 'react';
import { Shield, LayoutDashboard, Server, ShieldAlert, Play, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'assets' | 'details';
  setActiveTab: (tab: 'dashboard' | 'assets' | 'details') => void;
  isBackendConnected: boolean;
  onRunGlobalScan: () => void;
  isScanning: boolean;
  findingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  onRunGlobalScan,
  isScanning,
  findingsCount
}) => {
  return (
    <header className="bg-cyber-card/90 backdrop-blur-md border-b border-cyber-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center glow-emerald">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-wider text-slate-100 font-mono">SENTINEL</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono uppercase">
                  SIH MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight">AI Compliance Auditor</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 md:space-x-2">
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-assets-btn"
              onClick={() => setActiveTab('assets')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'assets'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Assets</span>
            </button>

            <button
              id="nav-details-btn"
              onClick={() => setActiveTab('details')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'details'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Finding Details</span>
              {findingsCount > 0 && (
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded-full border border-slate-700">
                  {findingsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Actions & Health Status */}
          <div className="flex items-center space-x-4">
            {/* Backend Health Badge */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-400">API:</span>
              <span className={isBackendConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {isBackendConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Run Scan Button */}
            <button
              id="run-scan-global-btn"
              onClick={onRunGlobalScan}
              disabled={isScanning || !isBackendConnected}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md ${
                isScanning || !isBackendConnected
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold glow-emerald border border-emerald-400/50 active:scale-95'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
