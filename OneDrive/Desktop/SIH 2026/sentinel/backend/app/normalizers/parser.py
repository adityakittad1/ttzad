from typing import Any, Dict
from .cisco import parse_cisco_config
from .fortinet import parse_fortinet_config
from .linux import parse_linux_config


def normalize_config(vendor: str, config_raw: str) -> Dict[str, Any]:
    vendor_lower = str(vendor).lower()
    if "cisco" in vendor_lower:
        return parse_cisco_config(config_raw)
    elif "fortinet" in vendor_lower:
        return parse_fortinet_config(config_raw)
    elif "linux" in vendor_lower:
        return parse_linux_config(config_raw)
    else:
        raise ValueError(f"Unsupported vendor: {vendor}")
