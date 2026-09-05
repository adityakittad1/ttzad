import os
from datetime import datetime, timezone
import uuid
from typing import Dict, List, Optional
from app.models import Asset, Finding, ScanResult, VendorEnum
from app.normalizers import normalize_config
from app.compliance import evaluate_compliance


class InMemoryStore:
    def __init__(self):
        self.assets: Dict[str, Asset] = {}
        self.scans: Dict[str, ScanResult] = {}
        self.findings: List[Finding] = []
        self._load_sample_assets()
        self._run_initial_scans()

    def _run_initial_scans(self):
        for asset_id in self.assets:
            self.run_scan(asset_id=asset_id)

    def _load_sample_assets(self):
        # Base path relative to project root or sentinel directory
        base_configs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../configs"))
        
        sample_files = [
            ("asset-cisco-01", "Core Cisco Router", VendorEnum.CISCO, "cisco_router.cfg"),
            ("asset-forti-01", "Edge Fortinet Firewall", VendorEnum.FORTINET, "fortinet_firewall.conf"),
            ("asset-linux-01", "Linux Application Server", VendorEnum.LINUX, "linux_server.conf"),
        ]

        for asset_id, name, vendor, filename in sample_files:
            file_path = os.path.join(base_configs_dir, filename)
            config_content = ""
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    config_content = f.read()
            else:
                config_content = f"# Default mock configuration for {name}"

            asset = Asset(
                id=asset_id,
                name=name,
                vendor=vendor,
                config_raw=config_content
            )
            self.assets[asset.id] = asset

    def get_assets(self) -> List[Asset]:
        return list(self.assets.values())

    def get_asset(self, asset_id: str) -> Optional[Asset]:
        return self.assets.get(asset_id)

    def run_scan(self, asset_id: Optional[str] = None, vendor: Optional[VendorEnum] = None, config_raw: Optional[str] = None) -> ScanResult:
        target_asset_id = asset_id or f"custom-{uuid.uuid4().hex[:6]}"
        target_vendor = vendor
        target_config = config_raw

        if asset_id and asset_id in self.assets:
            existing_asset = self.assets[asset_id]
            target_vendor = existing_asset.vendor
            target_config = existing_asset.config_raw
        elif not target_config or not target_vendor:
            raise ValueError("Either a valid asset_id or both vendor and config_raw must be provided.")

        normalized = normalize_config(str(target_vendor.value), target_config)
        new_findings = evaluate_compliance(target_asset_id, str(target_vendor.value), normalized)

        scan_id = f"scan-{uuid.uuid4().hex[:8]}"
        scan_result = ScanResult(
            scan_id=scan_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            asset_id=target_asset_id,
            vendor=target_vendor,
            total_findings=len(new_findings),
            findings=new_findings
        )

        self.scans[scan_id] = scan_result
        # Remove previous findings for this asset to avoid duplicates on re-scan
        self.findings = [f for f in self.findings if f.asset_id != target_asset_id]
        self.findings.extend(new_findings)

        return scan_result

    def get_findings(self, asset_id: Optional[str] = None) -> List[Finding]:
        if asset_id:
            return [f for f in self.findings if f.asset_id == asset_id]
        return self.findings


# Global store instance
store = InMemoryStore()
