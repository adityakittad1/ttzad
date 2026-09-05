import { Asset, Finding, ScanResult, AIAnalysisResult, Vendor } from '../types';
import { MOCK_ASSETS, MOCK_FINDINGS } from './mockData';

// Determine API base: use env var if set, otherwise try localhost, fall back to demo mode
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// In-memory state for demo mode (mutated by simulated scans)
let demoFindings: Finding[] = [];
let demoMode = false;

function simulateDelay(ms = 800): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}

export async function fetchHealth(): Promise<{ status: string; service: string; version?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    demoMode = false;
    return res.json();
  } catch {
    // Backend unavailable — switch to demo mode
    demoMode = true;
    return { status: 'demo', service: 'SENTINEL Demo Mode', version: '1.0.0-demo' };
  }
}

export async function fetchAssets(): Promise<Asset[]> {
  if (demoMode) {
    await simulateDelay(300);
    return MOCK_ASSETS;
  }
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error(`Failed to fetch assets (Status ${res.status})`);
  return res.json();
}

export async function fetchFindings(assetId?: string): Promise<Finding[]> {
  if (demoMode) {
    await simulateDelay(300);
    const findings = demoFindings.length > 0 ? demoFindings : [];
    return assetId ? findings.filter(f => f.asset_id === assetId) : findings;
  }
  const url = assetId
    ? `${API_BASE}/findings?asset_id=${encodeURIComponent(assetId)}`
    : `${API_BASE}/findings`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch findings (Status ${res.status})`);
  return res.json();
}

export async function triggerScan(assetId?: string, vendor?: Vendor, configRaw?: string): Promise<ScanResult> {
  if (demoMode) {
    await simulateDelay(1200); // simulate scan time
    const assetFindings = MOCK_FINDINGS.filter(f =>
      assetId ? f.asset_id === assetId : true
    );
    // Merge new findings, avoid duplicates
    const existingIds = new Set(demoFindings.map(f => f.id));
    const newFindings = assetFindings.filter(f => !existingIds.has(f.id));
    demoFindings = [...demoFindings, ...newFindings];

    const targetAsset = MOCK_ASSETS.find(a => a.id === assetId);
    return {
      scan_id: `demo-scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      asset_id: assetId || 'all',
      vendor: vendor || targetAsset?.vendor || 'cisco',
      total_findings: assetFindings.length,
      findings: assetFindings
    };
  }
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_id: assetId, vendor, config_raw: configRaw })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error((errorData as { detail?: string }).detail || `Scan failed (Status ${res.status})`);
  }
  return res.json();
}

export async function analyzeFinding(findingId: string): Promise<AIAnalysisResult> {
  if (demoMode) {
    await simulateDelay(1800); // simulate AI response time
    const finding = MOCK_FINDINGS.find(f => f.id === findingId);
    if (!finding) throw new Error('Finding not found');

    const analysisMap: Record<string, AIAnalysisResult> = {
      'finding-001': {
        finding_id: findingId,
        why_it_matters: 'Telnet transmits all data — including usernames and passwords — in plaintext. Any network-level attacker (or compromised upstream router) can capture credentials with passive packet sniffing, requiring zero active exploitation. On a core firewall, this effectively hands full device access to any passive observer.',
        potential_impact: 'Complete compromise of the network perimeter device. An attacker gaining admin credentials via Telnet sniffing can reconfigure ACLs, create backdoor accounts, redirect traffic, or disable IDS/IPS — enabling full lateral movement into the protected network.',
        recommended_fix: 'Immediately disable Telnet on all VTY lines and enforce SSHv2 with RSA-2048 minimum:\n\nline vty 0 4\n  transport input ssh\n  login local\n!\ncrypto key generate rsa modulus 2048\nip ssh version 2\nip ssh time-out 60\nip ssh authentication-retries 3',
        ai_provider: 'SENTINEL AI Engine (Demo)'
      },
      'finding-005': {
        finding_id: findingId,
        why_it_matters: 'TLS 1.0 was deprecated by RFC 8996 in March 2021 and is vulnerable to BEAST (Browser Exploit Against SSL/TLS) and POODLE attacks. Your SSL VPN using TLS 1.0 minimum means clients negotiating this version have their session data exposed to downgrade attacks.',
        potential_impact: 'VPN session hijacking, credential theft from SSL VPN users, potential decryption of "encrypted" traffic. PCI-DSS compliance failure — organizations processing payment data cannot use TLS 1.0 as of June 2018.',
        recommended_fix: 'Enforce TLS 1.2 minimum across all FortiGate services:\n\nconfig system global\n  set ssl-min-proto-version TLSv1-2\nend\n\nVerify all admin interfaces, SSL-VPN, and captive portals respect this setting. Preferably enforce TLS 1.3 where client compatibility allows.',
        ai_provider: 'SENTINEL AI Engine (Demo)'
      }
    };

    return analysisMap[findingId] || {
      finding_id: findingId,
      why_it_matters: `This ${finding.severity} severity finding represents a significant compliance gap in your ${finding.vendor.toUpperCase()} infrastructure. The misconfiguration directly violates CIS Benchmark controls and NIST SP 800-53 requirements for secure system administration.`,
      potential_impact: `Exploitation of this vulnerability could lead to unauthorized access, lateral movement, or data exfiltration from the affected asset "${finding.asset_id}". The severity classification of ${finding.severity} indicates this should be prioritized for immediate remediation.`,
      recommended_fix: `${finding.remediation}\n\nAdditional guidance: Review your change management process to prevent regression of this control. Implement automated compliance scanning post-change to detect reintroduction.`,
      ai_provider: 'SENTINEL AI Engine (Demo)'
    };
  }

  const res = await fetch(`${API_BASE}/findings/${encodeURIComponent(findingId)}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error((errorData as { detail?: string }).detail || `AI Analysis failed (Status ${res.status})`);
  }
  return res.json();
}

export function isDemoMode(): boolean {
  return demoMode;
}
