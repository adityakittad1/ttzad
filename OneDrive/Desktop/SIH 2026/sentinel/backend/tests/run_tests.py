import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.normalizers import normalize_config
from app.compliance import evaluate_compliance


def run_all_tests():
    print("=== Running SENTINEL Suite (Phase 1 & Phase 2) ===")
    passed = 0
    failed = 0

    def test(name, fn):
        nonlocal passed, failed
        try:
            fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            failed += 1

    def t_cisco():
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

    def t_fortinet():
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

    def t_linux():
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

    def t_api():
        client = TestClient(app)
        
        # 1. GET /assets
        res_assets = client.get("/assets")
        assert res_assets.status_code == 200
        assets = res_assets.json()
        assert len(assets) == 3

        # 2. POST /scan for Cisco asset
        res_cisco = client.post("/scan", json={"asset_id": "asset-cisco-01"})
        assert res_cisco.status_code == 200
        data_cisco = res_cisco.json()
        assert data_cisco["vendor"] == "cisco"
        assert data_cisco["total_findings"] == 3

        # 3. POST /scan for Fortinet asset
        res_forti = client.post("/scan", json={"asset_id": "asset-forti-01"})
        assert res_forti.status_code == 200
        data_forti = res_forti.json()
        assert data_forti["vendor"] == "fortinet"
        assert data_forti["total_findings"] == 3

        # 4. POST /scan for Linux asset
        res_linux = client.post("/scan", json={"asset_id": "asset-linux-01"})
        assert res_linux.status_code == 200
        data_linux = res_linux.json()
        assert data_linux["vendor"] == "linux"
        assert data_linux["total_findings"] == 4

        # 5. GET /findings
        res_findings = client.get("/findings")
        assert res_findings.status_code == 200
        findings = res_findings.json()
        assert len(findings) == 10
        first_finding = findings[0]
        assert "rule_id" in first_finding
        assert "severity" in first_finding
        assert "evidence" in first_finding
        assert "remediation" in first_finding

    def t_ai_analysis():
        client = TestClient(app)
        # Ensure scan is executed
        res_scan = client.post("/scan", json={"asset_id": "asset-linux-01"})
        assert res_scan.status_code == 200
        findings = res_scan.json()["findings"]
        target_finding = findings[0]
        finding_id = target_finding["id"]

        # Call POST /findings/{finding_id}/analyze
        res_ai = client.post(f"/findings/{finding_id}/analyze")
        assert res_ai.status_code == 200
        ai_data = res_ai.json()

        assert ai_data["finding_id"] == finding_id
        assert "why_it_matters" in ai_data and len(ai_data["why_it_matters"]) > 0
        assert "potential_impact" in ai_data and len(ai_data["potential_impact"]) > 0
        assert "recommended_fix" in ai_data and len(ai_data["recommended_fix"]) > 0
        assert "ai_provider" in ai_data

    test("Cisco Parser & Rules", t_cisco)
    test("Fortinet Parser & Rules", t_fortinet)
    test("Linux Parser & Rules", t_linux)
    test("FastAPI Endpoints (GET /assets, POST /scan, GET /findings)", t_api)
    test("Phase 2 AI Analysis Endpoint (POST /findings/{id}/analyze)", t_ai_analysis)

    print(f"\nResults: {passed} passed, {failed} failed.")
    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()
