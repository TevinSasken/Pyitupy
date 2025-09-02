from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
import os, json, httpx

router = APIRouter()

STORAGE_SERVICE_URL = "http://localhost:4000/storage/upload"

async def upload_to_storage(file: UploadFile) -> str:
    """Send file to storage service and return rootHash."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": (file.filename, await file.read(), file.content_type)}
            resp = await client.post(STORAGE_SERVICE_URL, files=files)
            resp.raise_for_status()
            data = resp.json()
            return data["rootHash"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload {file.filename}: {str(e)}")

# =========================
# Individual KYC Endpoint
# =========================

@router.post("/kyc/individual")
async def submit_individual_kyc(
    full_name: str = Form(...),
    national_id_passport: UploadFile = File(...),
    pay_slips: List[UploadFile] = File(...),
    tax_pin_certificate: UploadFile = File(...),
    tax_file_records: UploadFile = File(...),
    crb_report: UploadFile = File(...),
    mobile_money_statement: UploadFile = File(...),
    selfie: UploadFile = File(...),
    mpesa_hakikisha: UploadFile = File(...),
    telephone_number: str = Form(...),
    physical_address: str = Form(...),
    email_address: str = Form(...),
    level_of_education: str = Form(...),
    social_media_handles: str = Form(None)
):
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

    saved_files = {
        "national_id_passport": await upload_to_storage(national_id_passport),
        "tax_pin_certificate": await upload_to_storage(tax_pin_certificate),
        "tax_file_records": await upload_to_storage(tax_file_records),
        "crb_report": await upload_to_storage(crb_report),
        "mobile_money_statement": await upload_to_storage(mobile_money_statement),
        "selfie": await upload_to_storage(selfie),
        "mpesa_hakikisha": await upload_to_storage(mpesa_hakikisha),
        "pay_slips": [await upload_to_storage(ps) for ps in pay_slips]
    }

    metadata = {
        "full_name": full_name,
        "telephone_number": telephone_number,
        "physical_address": physical_address,
        "email_address": email_address,
        "level_of_education": level_of_education,
        "social_media_handles": [h.strip() for h in (social_media_handles or "").split(",") if h.strip()],
        "timestamp": timestamp,
        "files": saved_files
    }

    # still saving metadata locally (optional)
    user_folder = os.path.join("uploads", "individuals", full_name.replace(" ", "_"))
    os.makedirs(user_folder, exist_ok=True)
    meta_file_path = os.path.join(user_folder, f"{timestamp}_metadata.json")
    with open(meta_file_path, "w", encoding="utf-8") as mf:
        json.dump(metadata, mf, indent=4)

    return {
        "status": "success",
        "message": f"KYC data for {full_name} submitted successfully.",
        "files_saved": saved_files,
        "metadata_file": meta_file_path
    }

# =========================
# Business KYC Endpoint
# =========================

def categorize_owner_files(files: List[UploadFile]) -> dict:
    """Categorizes owner files based on filename pattern: owner{index}_{doc_key}[_{seq}].ext"""
    owners = {}
    for f in files or []:
        name = f.filename
        parts = name.split("_", 2)
        if len(parts) < 2:
            continue
        owner_part = parts[0]
        if not owner_part.lower().startswith("owner"):
            continue
        try:
            idx = int(owner_part[5:])
        except:
            continue
        doc_key = parts[1] if len(parts) == 2 else parts[1] + ("" if len(parts)==2 else "_" + parts[2].rsplit(".",1)[0])
        doc_key = doc_key.split(".")[0]
        doc_key = doc_key.lower().replace("-", "_")
        if idx not in owners:
            owners[idx] = {}
        owners[idx].setdefault(doc_key, []).append(f)
    return owners

@router.post("/kyc/business")
async def submit_business_kyc(
    business_name: str = Form(...),
    business_type: str = Form(...),  # 'sole_proprietorship' | 'llc' | 'llp'
    owners_json: str = Form(...),    # JSON array of owner metadata
    # business-level files
    registration_certificate: Optional[UploadFile] = File(None),
    geotagged_business_photo: Optional[UploadFile] = File(None),
    certificate_of_incorporation: Optional[UploadFile] = File(None),
    company_kra_pin: Optional[UploadFile] = File(None),
    company_cr12: Optional[UploadFile] = File(None),
    company_cr12_date: Optional[str] = Form(None),  # YYYY-MM-DD
    partnership_deed: Optional[UploadFile] = File(None),
    company_crb_report: Optional[UploadFile] = File(None),
    mobile_money_statement: Optional[UploadFile] = File(None),
    # owners' KYC files
    owners_files: Optional[List[UploadFile]] = File(None)
):
    business_type = business_type.lower().strip()
    allowed_types = {"sole_proprietorship", "llc", "llp"}
    if business_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"business_type must be one of {allowed_types}")

    try:
        owners_meta = json.loads(owners_json)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"owners_json must be valid JSON. Error: {e}")

    if not isinstance(owners_meta, list) or len(owners_meta) == 0:
        raise HTTPException(status_code=400, detail="owners_json must be a non-empty array")

    owner_count = len(owners_meta)
    if business_type == "sole_proprietorship" and owner_count != 1:
        raise HTTPException(status_code=400, detail="Sole proprietorship must have exactly 1 owner")
    if business_type == "llp" and owner_count < 2:
        raise HTTPException(status_code=400, detail="LLP must have at least 2 owners")
    if business_type == "llc" and owner_count < 1:
        raise HTTPException(status_code=400, detail="LLC must have at least 1 owner")

    # Required docs per type
    required_business_docs = []
    if business_type == "sole_proprietorship":
        required_business_docs = ["registration_certificate", "geotagged_business_photo"]
    elif business_type == "llc":
        required_business_docs = ["certificate_of_incorporation", "company_kra_pin", "company_cr12", "company_crb_report"]
    elif business_type == "llp":
        required_business_docs = ["registration_certificate", "company_kra_pin", "partnership_deed", "company_crb_report"]

    business_files_map = {
        "registration_certificate": registration_certificate,
        "geotagged_business_photo": geotagged_business_photo,
        "certificate_of_incorporation": certificate_of_incorporation,
        "company_kra_pin": company_kra_pin,
        "company_cr12": company_cr12,
        "partnership_deed": partnership_deed,
        "company_crb_report": company_crb_report,
        "mobile_money_statement": mobile_money_statement
    }

    missing = [doc for doc in required_business_docs if not business_files_map.get(doc)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required business documents for {business_type}: {missing}")

    if company_cr12_date and business_files_map.get("company_cr12"):
        try:
            cr12_dt = datetime.fromisoformat(company_cr12_date)
            if datetime.utcnow() - cr12_dt > timedelta(days=90):
                raise HTTPException(status_code=400, detail="company_cr12_date is older than 90 days")
        except ValueError:
            raise HTTPException(status_code=400, detail="company_cr12_date must be YYYY-MM-DD")

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

    saved_business_files = {}
    for key, file_obj in business_files_map.items():
        if file_obj:
            saved_business_files[key] = await upload_to_storage(file_obj)

    owners_files_map = categorize_owner_files(owners_files)
    saved_owners = []
    for idx, owner_meta in enumerate(owners_meta):
        owner_name = owner_meta.get("full_name")
        if not owner_name:
            raise HTTPException(status_code=400, detail=f"Owner {idx} missing full_name")

        owner_files_for_idx = owners_files_map.get(idx, {})
        missing_owner_docs = []
        if "national_id_passport" not in owner_files_for_idx:
            missing_owner_docs.append("national_id_passport")
        if "mobile_money_statement" not in owner_files_for_idx:
            missing_owner_docs.append("mobile_money_statement")
        if missing_owner_docs:
            raise HTTPException(status_code=400, detail=f"Missing files for owner {owner_name}: {missing_owner_docs}")

        saved_files = {}
        for key, file_list in owner_files_for_idx.items():
            saved_files[key] = []
            for f in file_list:
                saved_files[key].append(await upload_to_storage(f))

        saved_owners.append({
            "owner_index": idx,
            "owner_name": owner_name,
            "saved_files": saved_files,
            "metadata": owner_meta
        })

    return {
        "status": "success",
        "business_name": business_name,
        "business_type": business_type,
        "saved_business_files": saved_business_files,
        "owners": saved_owners
    }
