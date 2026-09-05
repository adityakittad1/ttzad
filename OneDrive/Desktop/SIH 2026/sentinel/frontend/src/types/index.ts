export type Vendor = 'cisco' | 'fortinet' | 'linux';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Asset {
  id: string;
  name: string;
  vendor: Vendor;
  config_raw: string;
}

export interface Finding {
  id: string;
  rule_id: string;
  title: string;
  severity: Severity;
  vendor: Vendor;
  evidence: string;
  remediation: string;
  asset_id: string;
}

export interface ScanRequest {
  asset_id?: string;
  vendor?: Vendor;
  config_raw?: string;
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  asset_id: string;
  vendor: Vendor;
  total_findings: number;
  findings: Finding[];
}

export interface AIAnalysisResult {
  finding_id: string;
  why_it_matters: string;
  potential_impact: string;
  recommended_fix: string;
  ai_provider: string;
}
