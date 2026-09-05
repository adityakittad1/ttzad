#!/usr/bin/env python3
"""
SENTINEL DevSecOps Security Gate script for CI/CD pipelines.
Scans configuration files against compliance policy rules and exits with code 1 if CRITICAL findings exist.
Supports --safe-test flag to test passing security gate against hardened configuration.
"""
import sys
import os

# Ensure UTF-8 output encoding for terminal printing
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path if needed
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.store import store
from app.models import SeverityEnum, VendorEnum


def run_security_gate():
    print("=" * 65)
    print("[SENTINEL DEVSECOPS COMPLIANCE SECURITY GATE]")
    print("=" * 65)

    is_safe_test = "--safe-test" in sys.argv

    if is_safe_test:
        print("[TEST MODE] Auditing Hardened Security Baseline Configuration...")
        safe_cisco_config = """
        service password-encryption
        enable secret SuperSecurePassword123!
        no ip http server
        ip http secure-server
        line vty 0 4
         transport input ssh
        """
        scan_result = store.run_scan(
            asset_id="asset-safe-cisco",
            vendor=VendorEnum.CISCO,
            config_raw=safe_cisco_config
        )
        criticals = [f for f in scan_result.findings if f.severity == SeverityEnum.CRITICAL]
        
        print(f"-> Hardened Asset Scanned: [Safe Cisco Router Baseline]")
        print(f"   Findings: {len(scan_result.findings)} total ({len(criticals)} CRITICAL)")
        print("\n" + "-" * 65)
        print("SECURITY GATE SUMMARY REPORT:")
        print(f"   Total Audited Assets: 1")
        print(f"   CRITICAL Severity Findings: {len(criticals)}")
        print("-" * 65)

        if len(criticals) == 0:
            print("\n[SUCCESS] DevSecOps Security Gate Passed!")
            print("   No CRITICAL security violations found in hardened baseline configuration.")
            sys.exit(0)
        else:
            print("\n[FAILURE] Unexpected critical finding in safe config.")
            sys.exit(1)

    assets = store.get_assets()
    if not assets:
        print("[ERROR] No infrastructure assets found to audit.")
        sys.exit(1)

    print(f"[SCAN] Initiating automated security scan across {len(assets)} target assets...\n")

    total_critical = 0
    all_findings = []

    for asset in assets:
        print(f"-> Scanning Asset: [{asset.name}] ({asset.id}) - Vendor: {asset.vendor.value.upper()}")
        scan_result = store.run_scan(asset_id=asset.id)
        
        criticals = [f for f in scan_result.findings if f.severity == SeverityEnum.CRITICAL]
        total_critical += len(criticals)
        all_findings.extend(scan_result.findings)

        print(f"   Findings: {len(scan_result.findings)} total ({len(criticals)} CRITICAL)")

    print("\n" + "-" * 65)
    print("SECURITY GATE SUMMARY REPORT:")
    print(f"   Total Audited Assets: {len(assets)}")
    print(f"   Total Detected Findings: {len(all_findings)}")
    print(f"   CRITICAL Severity Findings: {total_critical}")
    print("-" * 65)

    if total_critical > 0:
        print("\n[FAILURE] DevSecOps Security Gate Failed!")
        print(f"   Reason: {total_critical} CRITICAL severity violation(s) detected in baseline configuration.")
        print("\nCritical Violations List:")
        for f in all_findings:
            if f.severity == SeverityEnum.CRITICAL:
                print(f"   - Rule [{f.rule_id}] on {f.asset_id}: {f.title}")
                print(f"     Evidence: \"{f.evidence}\"")
                print(f"     Fix: {f.remediation}\n")
        print("[BLOCKED] Pipeline Execution Blocked by SENTINEL Gate.")
        sys.exit(1)
    else:
        print("\n[SUCCESS] DevSecOps Security Gate Passed!")
        print("   No CRITICAL security violations found in baseline configuration.")
        sys.exit(0)


if __name__ == "__main__":
    run_security_gate()
