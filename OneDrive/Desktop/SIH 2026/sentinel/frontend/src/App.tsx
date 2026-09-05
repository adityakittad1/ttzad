import { useState, useEffect } from 'react';
import { Asset, Finding } from './types';
import { fetchAssets, fetchFindings, triggerScan, fetchHealth, isDemoMode } from './services/api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { FindingDetails } from './pages/FindingDetails';
import { RefreshCw, ShieldAlert, CheckCircle2, FlaskConical } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'details'>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanningAssetId, setScanningAssetId] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial load
  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      await fetchHealth();
      const demo = isDemoMode();
      setIsDemoModeActive(demo);
      setIsBackendConnected(!demo);

      const [assetsData, findingsData] = await Promise.all([
        fetchAssets(),
        fetchFindings()
      ]);

      setAssets(assetsData);
      setFindings(findingsData);

      // If initial findings exist, pre-select the first finding
      if (findingsData.length > 0) {
        setSelectedFinding(findingsData[0]);
      }
    } catch (err: unknown) {
      setIsBackendConnected(false);
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Connection failed: ${message}`, 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Synchronize selectedFinding when findings state changes to prevent stale ID references
  useEffect(() => {
    if (findings.length === 0) {
      setSelectedFinding(null);
      return;
    }

    setSelectedFinding(prevSelected => {
      if (prevSelected) {
        const exactMatch = findings.find(f => f.id === prevSelected.id);
        if (exactMatch) return exactMatch;

        const ruleMatch = findings.find(
          f => f.rule_id === prevSelected.rule_id && f.asset_id === prevSelected.asset_id
        );
        if (ruleMatch) return ruleMatch;
      }
      return findings[0];
    });
  }, [findings]);

  // Global scan across all assets
  const handleRunGlobalScan = async () => {
    if (assets.length === 0) return;
    setIsScanning(true);
    try {
      // Trigger scan for all assets
      await Promise.all(assets.map(asset => triggerScan(asset.id)));
      
      // Refresh findings list from backend
      const updatedFindings = await fetchFindings();
      setFindings(updatedFindings);

      showToast(`Scan completed successfully! ${updatedFindings.length} compliance findings detected.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Scan failed: ${message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Single asset scan
  const handleScanAsset = async (assetId: string) => {
    setScanningAssetId(assetId);
    try {
      await triggerScan(assetId);
      const updatedFindings = await fetchFindings();
      setFindings(updatedFindings);
      
      const targetAsset = assets.find(a => a.id === assetId);
      const assetFindingsCount = updatedFindings.filter(f => f.asset_id === assetId).length;
      showToast(`Scan completed for ${targetAsset ? targetAsset.name : assetId}! ${assetFindingsCount} findings found.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Asset scan failed: ${message}`, 'error');
    } finally {
      setScanningAssetId(null);
    }
  };

  // Navigate to findings filtered for asset
  const handleViewAssetFindings = (assetId: string) => {
    const assetFindings = findings.filter(f => f.asset_id === assetId);
    if (assetFindings.length > 0) {
      setSelectedFinding(assetFindings[0]);
    }
    setActiveTab('details');
  };

  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setActiveTab('details');
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Demo Mode Banner */}
      {isDemoModeActive && (
        <div className="bg-gradient-to-r from-indigo-950 via-violet-950 to-indigo-950 border-b border-violet-700/50 py-2 px-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-mono text-violet-300">
            <FlaskConical className="w-3.5 h-3.5 text-violet-400" />
            <strong className="text-violet-200">DEMO MODE</strong>
            — Backend not detected. Running with simulated multi-vendor infrastructure data. Click &quot;Run Compliance Scan&quot; to load findings.
          </span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        onRunGlobalScan={handleRunGlobalScan}
        isScanning={isScanning}
        findingsCount={findings.length}
      />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md font-mono text-xs ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 glow-emerald'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-300 glow-rose'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
            <div className="text-center font-mono">
              <span className="text-slate-200 text-sm font-semibold block">Initializing SENTINEL Security Engine</span>
              <span className="text-xs text-slate-500">Fetching asset configurations and compliance state...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                assets={assets}
                findings={findings}
                isScanning={isScanning}
                onRunScan={handleRunGlobalScan}
                onSelectFinding={handleSelectFinding}
                onNavigateToAssets={() => setActiveTab('assets')}
              />
            )}

            {activeTab === 'assets' && (
              <Assets
                assets={assets}
                findings={findings}
                scanningAssetId={scanningAssetId}
                onScanAsset={handleScanAsset}
                onViewAssetFindings={handleViewAssetFindings}
              />
            )}

            {activeTab === 'details' && (
              <FindingDetails
                findings={findings}
                assets={assets}
                selectedFinding={selectedFinding}
                onSelectFinding={setSelectedFinding}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Modern Cyber Footer */}
      <footer className="border-t border-cyber-border py-6 bg-cyber-card/40 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SENTINEL Security Auditor <span className="text-slate-600">|</span> Internal Hackathon MVP
          </div>
          <div>
            Built with React, Tailwind & FastAPI
          </div>
        </div>
      </footer>
    </div>
  );
}
