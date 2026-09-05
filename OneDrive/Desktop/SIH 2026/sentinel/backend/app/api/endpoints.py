from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.models import Asset, Finding, ScanRequest, ScanResult, AIAnalysisResult
from app.services import store, analyze_finding

router = APIRouter()


@router.get("/assets", response_model=List[Asset])
def list_assets():
    """Retrieve list of pre-configured sample infrastructure assets."""
    return store.get_assets()


@router.post("/scan", response_model=ScanResult)
def trigger_scan(request: ScanRequest):
    """Trigger a compliance scan against an existing asset or raw config."""
    try:
        scan_result = store.run_scan(
            asset_id=request.asset_id,
            vendor=request.vendor,
            config_raw=request.config_raw
        )
        return scan_result
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.get("/findings", response_model=List[Finding])
def get_findings(asset_id: Optional[str] = None):
    """Retrieve compliance scan findings, optionally filtered by asset_id."""
    return store.get_findings(asset_id=asset_id)


@router.post("/findings/{finding_id}/analyze", response_model=AIAnalysisResult)
def analyze_finding_endpoint(finding_id: str):
    """Generates AI analysis for a specific existing security finding."""
    all_findings = store.get_findings()
    matching_finding = next((f for f in all_findings if f.id == finding_id), None)
    
    if not matching_finding:
        raise HTTPException(status_code=404, detail=f"Finding with ID '{finding_id}' not found.")

    return analyze_finding(matching_finding)
