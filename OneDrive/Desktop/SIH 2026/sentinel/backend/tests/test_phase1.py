from fastapi.testclient import TestClient
from app.main import app
from app.normalizers import normalize_config
from app.compliance import evaluate_compliance

client = TestClient(app)


def test_cisco_normalizer_and_rules():
    raw_cfg = """
    no service password-encryption
    enable password cisco123
    ip http server
    line vty 0 4
     transport input telnet ssh
    """
    normalized = normalize_config("cisco", raw_cfg)
    assert normalized["vendor"] == "cisco"
    assert normalized["ip_http_server"] is True
    assert normalized["vty_telnet_allowed"] is True

    findings = evaluate_compliance("test-cisco", "cisco", normalized)
    rule_ids = [f.rule_id for f in findings]
    assert "CISCO-SEC-01" in rule_ids
    assert "CISCO-SEC-02" in rule_ids
    assert "CISCO-SEC-03" in rule_ids
    assert len(findings) == 3


def test_fortinet_normalizer_and_rules():
    raw_cfg = """
    config system interface
        edit "port1"
            set allowaccess ping https ssh http telnet
        next
    end
    config system password-policy
        set status disable
    end
    """
    normalized = normalize_config("fortinet", raw_cfg)
    assert normalized["vendor"] == "fortinet"
    assert normalized["http_allowaccess"] is True
    assert normalized["telnet_allowaccess"] is True
    assert normalized["password_policy_disabled"] is True

    findings = evaluate_compliance("test-fortinet", "fortinet", normalized)
    rule_ids = [f.rule_id for f in findings]
    assert "FORTI-SEC-01" in rule_ids
    assert "FORTI-SEC-02" in rule_ids
    assert "FORTI-SEC-03" in rule_ids
    assert len(findings) == 3


def test_linux_normalizer_and_rules():
    raw_cfg = """
    PermitRootLogin yes
    PasswordAuthentication yes
    X11Forwarding yes
    net.ipv4.ip_forward = 1
    """
    normalized = normalize_config("linux", raw_cfg)
    assert normalized["vendor"] == "linux"
    assert normalized["permit_root_login"] is True
    assert normalized["password_auth"] is True
    assert normalized["x11_forwarding"] is True
    assert normalized["ip_forwarding"] is True

    findings = evaluate_compliance("test-linux", "linux", normalized)
    rule_ids = [f.rule_id for f in findings]
    assert "LINUX-SEC-01" in rule_ids
    assert "LINUX-SEC-02" in rule_ids
    assert "LINUX-SEC-03" in rule_ids
    assert "LINUX-SEC-04" in rule_ids
    assert len(findings) == 4


def test_api_endpoints():
    res_assets = client.get("/assets")
    assert res_assets.status_code == 200
    assets = res_assets.json()
    assert len(assets) == 3

    res_cisco = client.post("/scan", json={"asset_id": "asset-cisco-01"})
    assert res_cisco.status_code == 200
    assert res_cisco.json()["total_findings"] == 3

    res_forti = client.post("/scan", json={"asset_id": "asset-forti-01"})
    assert res_forti.status_code == 200
    assert res_forti.json()["total_findings"] == 3

    res_linux = client.post("/scan", json={"asset_id": "asset-linux-01"})
    assert res_linux.status_code == 200
    assert res_linux.json()["total_findings"] == 4

    res_findings = client.get("/findings")
    assert res_findings.status_code == 200
    findings = res_findings.json()
    assert len(findings) == 10
