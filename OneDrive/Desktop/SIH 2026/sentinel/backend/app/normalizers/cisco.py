from typing import Any, Dict


def parse_cisco_config(config_raw: str) -> Dict[str, Any]:
    lines = [line.strip() for line in config_raw.splitlines()]

    has_service_password_encryption = False
    service_password_encryption_evidence = ""
    enable_plaintext_password = False
    enable_password_evidence = ""
    ip_http_server = False
    ip_http_server_evidence = ""
    vty_telnet_allowed = False
    vty_transport_evidence = ""

    for line in lines:
        if line.startswith("!") or not line:
            continue

        if line == "service password-encryption":
            has_service_password_encryption = True
            service_password_encryption_evidence = line
        elif line == "no service password-encryption":
            has_service_password_encryption = False
            service_password_encryption_evidence = line

        if line.startswith("enable password "):
            enable_plaintext_password = True
            enable_password_evidence = line

        if line == "ip http server":
            ip_http_server = True
            ip_http_server_evidence = line

        if line.startswith("transport input "):
            parts = line.split()[2:]
            if "telnet" in parts or "all" in parts:
                vty_telnet_allowed = True
                vty_transport_evidence = line

    return {
        "vendor": "cisco",
        "has_service_password_encryption": has_service_password_encryption,
        "service_password_encryption_evidence": service_password_encryption_evidence or "Missing: 'service password-encryption'",
        "enable_plaintext_password": enable_plaintext_password,
        "enable_password_evidence": enable_password_evidence,
        "ip_http_server": ip_http_server,
        "ip_http_server_evidence": ip_http_server_evidence,
        "vty_telnet_allowed": vty_telnet_allowed,
        "vty_transport_evidence": vty_transport_evidence,
    }
