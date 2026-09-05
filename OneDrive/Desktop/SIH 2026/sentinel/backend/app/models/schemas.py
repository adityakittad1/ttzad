from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class VendorEnum(str, Enum):
    CISCO = "cisco"
    FORTINET = "fortinet"
    LINUX = "linux"


class SeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Asset(BaseModel):
    id: str
    name: str
    vendor: VendorEnum
    config_raw: str


class Finding(BaseModel):
    id: str
    rule_id: str
    title: str
    severity: SeverityEnum
    vendor: VendorEnum
    evidence: str
    remediation: str
    asset_id: str


class ScanRequest(BaseModel):
    asset_id: Optional[str] = None
    vendor: Optional[VendorEnum] = None
    config_raw: Optional[str] = None


class ScanResult(BaseModel):
    scan_id: str
    timestamp: str
    asset_id: str
    vendor: VendorEnum
    total_findings: int
    findings: List[Finding]


class AIAnalysisResult(BaseModel):
    finding_id: str
    why_it_matters: str
    potential_impact: str
    recommended_fix: str
    ai_provider: str
