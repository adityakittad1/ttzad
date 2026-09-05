from typing import Any, Dict


def parse_linux_config(config_raw: str) -> Dict[str, Any]:
    lines = [line.strip() for line in config_raw.splitlines()]

    permit_root_login = False
    permit_root_login_evidence = ""
    password_auth = False
    password_auth_evidence = ""
    x11_forwarding = False
    x11_forwarding_evidence = ""
    ip_forwarding = False
    ip_forwarding_evidence = ""

    for line in lines:
        if line.startswith("#") or not line:
            continue

        # sshd_config options
        if line.lower().startswith("permitrootlogin"):
            parts = line.split()
            if len(parts) >= 2 and parts[1].lower() == "yes":
                permit_root_login = True
                permit_root_login_evidence = line

        if line.lower().startswith("passwordauthentication"):
            parts = line.split()
            if len(parts) >= 2 and parts[1].lower() == "yes":
                password_auth = True
                password_auth_evidence = line

        if line.lower().startswith("x11forwarding"):
            parts = line.split()
            if len(parts) >= 2 and parts[1].lower() == "yes":
                x11_forwarding = True
                x11_forwarding_evidence = line

        # sysctl options
        if "net.ipv4.ip_forward" in line:
            parts = [p.strip() for p in line.split("=")]
            if len(parts) >= 2 and parts[1] == "1":
                ip_forwarding = True
                ip_forwarding_evidence = line

    return {
        "vendor": "linux",
        "permit_root_login": permit_root_login,
        "permit_root_login_evidence": permit_root_login_evidence,
        "password_auth": password_auth,
        "password_auth_evidence": password_auth_evidence,
        "x11_forwarding": x11_forwarding,
        "x11_forwarding_evidence": x11_forwarding_evidence,
        "ip_forwarding": ip_forwarding,
        "ip_forwarding_evidence": ip_forwarding_evidence,
    }
