from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
import os, json
from datetime import datetime, timedelta

router = APIRouter()

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
    user_folder = os.path.join("uploads", "individuals", full_name.replace(" ", "_"))
    os.makedirs(user_folder, exist_ok=True)

    def save_file(file: UploadFile):
        file_path = os.path.join(user_folder, f"{timestamp}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        return file_path

    saved_files = {
        "national_id_passport": save_file(national_id_passport),
        "tax_pin_certificate": save_file(tax_pin_certificate),
        "tax_file_records": save_file(tax_file_records),
        "crb_report": save_file(crb_report),
        "mobile_money_statement": save_file(mobile_money_statement),
        "selfie": save_file(selfie),
        "mpesa_hakikisha": save_file(mpesa_hakikisha),
        "pay_slips": [save_file(ps) for ps in pay_slips]
    }

    metadata = {
        "full_name": full_name,
        "telephone_number": telephone_number,
        "physical_address": physical_address,
        "email_address": email_address,
        "level_of_education": level_of_education,
        "social_media_handles": [h.strip() for h in (social_media_handles or "").split(",") if h.strip()],
        "timestamp": timestamp
    }

    meta_file_path = os.path.join(user_folder, f"{timestamp}_metadata.json")
    with open(meta_file_path, "w") as mf:
        json.dump(metadata, mf, indent=4)

    return {
        "status": "success",
        "message": f"KYC data for {full_name} saved successfully.",
        "files_saved": saved_files,
        "metadata_file": meta_file_path
    }

# =========================
# Business KYC Endpoint
# =========================

BASE_UPLOAD = os.path.join("uploads", "businesses")
os.makedirs(BASE_UPLOAD, exist_ok=True)

def save_file_to_folder(file: UploadFile, folder: str, timestamp: str) -> str:
    os.makedirs(folder, exist_ok=True)
    safe_name = file.filename.replace(" ", "_")
    out_path = os.path.join(folder, f"{timestamp}_{safe_name}")
    with open(out_path, "wb") as f:
        f.write(file.file.read())
    return out_path

def categorize_owner_files(files: List[UploadFile]) -> dict:
    """
    Categorizes owner files based on filename pattern:
    owner{index}_{doc_key}[_{seq}].ext
    """
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
    business_folder = os.path.join(BASE_UPLOAD, business_name.replace(" ", "_"))
    business_docs_folder = os.path.join(business_folder, "business_docs")
    owners_folder_base = os.path.join(business_folder, "owners")
    os.makedirs(business_docs_folder, exist_ok=True)
    os.makedirs(owners_folder_base, exist_ok=True)

    saved_business_files = {}
    for key, file_obj in business_files_map.items():
        if file_obj:
            saved_business_files[key] = save_file_to_folder(file_obj, business_docs_folder, timestamp)

    owners_files_map = categorize_owner_files(owners_files)
    saved_owners = []
    for idx, owner_meta in enumerate(owners_meta):
        owner_name = owner_meta.get("full_name")
        if not owner_name:
            raise HTTPException(status_code=400, detail=f"Owner {idx} missing full_name")

        owner_folder = os.path.join(owners_folder_base, owner_name.replace(" ", "_"))
        os.makedirs(owner_folder, exist_ok=True)

        # Minimal owner doc validation
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
                saved_path = save_file_to_folder(f, owner_folder, timestamp)
                saved_files[key].append(saved_path)

        owner_meta_path = os.path.join(owner_folder, f"{timestamp}_owner_metadata.json")
        with open(owner_meta_path, "w", encoding="utf-8") as omf:
            json.dump(owner_meta, omf, indent=2)

        saved_owners.append({
            "owner_index": idx,
            "owner_name": owner_name,
            "saved_files": saved_files,
            "metadata_file": owner_meta_path
        })

    return {
        "status": "success",
        "business_name": business_name,
        "business_type": business_type,
        "business_docs_folder": business_docs_folder,
        "saved_business_files": saved_business_files,
        "owners": saved_owners
    }
