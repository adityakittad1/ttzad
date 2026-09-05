from typing import Any, Dict


def parse_fortinet_config(config_raw: str) -> Dict[str, Any]:
    lines = [line.strip() for line in config_raw.splitlines()]

    http_allowaccess = False
    http_allowaccess_evidence = ""
    telnet_allowaccess = False
    telnet_allowaccess_evidence = ""
    password_policy_disabled = False
    password_policy_evidence = ""

    current_block = ""

    for line in lines:
        if line.startswith("#") or not line:
            continue

        if line.startswith("config "):
            current_block = line
        elif line == "end":
            current_block = ""

        if line.startswith("set allowaccess "):
            access_types = line.replace("set allowaccess ", "").split()
            if "http" in access_types:
                http_allowaccess = True
                http_allowaccess_evidence = line
            if "telnet" in access_types:
                telnet_allowaccess = True
                telnet_allowaccess_evidence = line

        if "password-policy" in current_block and line == "set status disable":
            password_policy_disabled = True
            password_policy_evidence = f"{current_block} -> {line}"
        elif line == "set password-policy status disable" or ("password-policy" in line and "disable" in line):
            password_policy_disabled = True
            password_policy_evidence = line

    return {
        "vendor": "fortinet",
        "http_allowaccess": http_allowaccess,
        "http_allowaccess_evidence": http_allowaccess_evidence,
        "telnet_allowaccess": telnet_allowaccess,
        "telnet_allowaccess_evidence": telnet_allowaccess_evidence,
        "password_policy_disabled": password_policy_disabled,
        "password_policy_evidence": password_policy_evidence,
    }
