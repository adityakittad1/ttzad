import uuid
from typing import Any, Dict, List
from app.models import Finding, SeverityEnum, VendorEnum


def evaluate_compliance(asset_id: str, vendor: str, normalized: Dict[str, Any]) -> List[Finding]:
    findings: List[Finding] = []
    vendor_lower = str(vendor).lower()

    if "cisco" in vendor_lower:
        # Rule 1: Plaintext / Insecure Passwords
        if not normalized.get("has_service_password_encryption") or normalized.get("enable_plaintext_password"):
            evidence_lines = []
            if normalized.get("enable_plaintext_password"):
                evidence_lines.append(normalized.get("enable_password_evidence", ""))
            if not normalized.get("has_service_password_encryption"):
                evidence_lines.append(normalized.get("service_password_encryption_evidence", ""))
            
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="CISCO-SEC-01",
                title="Unencrypted Plaintext Passwords Configured",
                severity=SeverityEnum.HIGH,
                vendor=VendorEnum.CISCO,
                evidence=" | ".join(filter(None, evidence_lines)),
                remediation="Enable global service password encryption (`service password-encryption`) and use encrypted secret configuration (`enable secret <password>`).",
                asset_id=asset_id
            ))

        # Rule 2: HTTP Web Management Server Enabled
        if normalized.get("ip_http_server"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="CISCO-SEC-02",
                title="Insecure HTTP Management Web Server Enabled",
                severity=SeverityEnum.HIGH,
                vendor=VendorEnum.CISCO,
                evidence=normalized.get("ip_http_server_evidence", "ip http server"),
                remediation="Disable unencrypted HTTP server with `no ip http server` and enable HTTPS using `ip http secure-server`.",
                asset_id=asset_id
            ))

        # Rule 3: Telnet Allowed on VTY Lines
        if normalized.get("vty_telnet_allowed"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="CISCO-SEC-03",
                title="Unencrypted Telnet Protocol Allowed on VTY Lines",
                severity=SeverityEnum.CRITICAL,
                vendor=VendorEnum.CISCO,
                evidence=normalized.get("vty_transport_evidence", "transport input telnet"),
                remediation="Restrict VTY line transport input exclusively to SSH with `transport input ssh` under `line vty` settings.",
                asset_id=asset_id
            ))

    elif "fortinet" in vendor_lower:
        # Rule 4: Admin HTTP Access Allowed
        if normalized.get("http_allowaccess"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="FORTI-SEC-01",
                title="Insecure Admin HTTP Management Interface Allowed",
                severity=SeverityEnum.HIGH,
                vendor=VendorEnum.FORTINET,
                evidence=normalized.get("http_allowaccess_evidence", "set allowaccess http"),
                remediation="Remove `http` from management interface allowaccess settings (`set allowaccess https ssh`).",
                asset_id=asset_id
            ))

        # Rule 5: Admin Telnet Access Allowed
        if normalized.get("telnet_allowaccess"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="FORTI-SEC-02",
                title="Unencrypted Admin Telnet Protocol Access Allowed",
                severity=SeverityEnum.CRITICAL,
                vendor=VendorEnum.FORTINET,
                evidence=normalized.get("telnet_allowaccess_evidence", "set allowaccess telnet"),
                remediation="Remove `telnet` from management interface allowaccess settings (`set allowaccess https ssh`).",
                asset_id=asset_id
            ))

        # Rule 6: Admin Password Policy Disabled
        if normalized.get("password_policy_disabled"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="FORTI-SEC-03",
                title="Global Admin Password Policy Disabled",
                severity=SeverityEnum.MEDIUM,
                vendor=VendorEnum.FORTINET,
                evidence=normalized.get("password_policy_evidence", "set password-policy status disable"),
                remediation="Enable global admin password policy enforcement (`config system password-policy -> set status enable`).",
                asset_id=asset_id
            ))

    elif "linux" in vendor_lower:
        # Rule 7: SSH Root Login Permitted
        if normalized.get("permit_root_login"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="LINUX-SEC-01",
                title="Direct SSH Root Login Permitted",
                severity=SeverityEnum.CRITICAL,
                vendor=VendorEnum.LINUX,
                evidence=normalized.get("permit_root_login_evidence", "PermitRootLogin yes"),
                remediation="Set `PermitRootLogin no` or `PermitRootLogin prohibit-password` in `/etc/ssh/sshd_config`.",
                asset_id=asset_id
            ))

        # Rule 8: SSH Password Authentication Permitted
        if normalized.get("password_auth"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="LINUX-SEC-02",
                title="SSH Password Authentication Allowed",
                severity=SeverityEnum.HIGH,
                vendor=VendorEnum.LINUX,
                evidence=normalized.get("password_auth_evidence", "PasswordAuthentication yes"),
                remediation="Set `PasswordAuthentication no` in `/etc/ssh/sshd_config` and enforce public key authentication.",
                asset_id=asset_id
            ))

        # Rule 9: X11 Forwarding Enabled
        if normalized.get("x11_forwarding"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="LINUX-SEC-03",
                title="Unrestricted SSH X11 Graphical Forwarding Enabled",
                severity=SeverityEnum.MEDIUM,
                vendor=VendorEnum.LINUX,
                evidence=normalized.get("x11_forwarding_evidence", "X11Forwarding yes"),
                remediation="Disable X11 forwarding (`X11Forwarding no`) in `/etc/ssh/sshd_config` unless required for dedicated display applications.",
                asset_id=asset_id
            ))

        # Rule 10: IPv4 Packet Forwarding Enabled
        if normalized.get("ip_forwarding"):
            findings.append(Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                rule_id="LINUX-SEC-04",
                title="IPv4 Packet Forwarding Enabled in System Kernel",
                severity=SeverityEnum.MEDIUM,
                vendor=VendorEnum.LINUX,
                evidence=normalized.get("ip_forwarding_evidence", "net.ipv4.ip_forward = 1"),
                remediation="Disable IPv4 packet forwarding (`net.ipv4.ip_forward = 0`) in `/etc/sysctl.conf` unless operating as a dedicated router/firewall gateway.",
                asset_id=asset_id
            ))

    return findings
