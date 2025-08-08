from fastapi import APIRouter, File, UploadFile, Form
from typing import List
import os
from datetime import datetime

# Create router instance
router = APIRouter()

# Where uploaded files will be stored
UPLOAD_DIR = "uploads/individuals"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
    social_media_handles: str = Form(...),  # comma-separated
):
    """
    Collects full KYC data for an individual borrower.
    Saves files locally for now, returns summary.
    """

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    saved_files = {}

    # Helper function to save files
    def save_file(file: UploadFile, subfolder: str):
        folder_path = os.path.join(UPLOAD_DIR, subfolder)
        os.makedirs(folder_path, exist_ok=True)
        file_path = os.path.join(folder_path, f"{timestamp}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        return file_path

    # Save each uploaded file
    saved_files["national_id_passport"] = save_file(national_id_passport, full_name)
    saved_files["tax_pin_certificate"] = save_file(tax_pin_certificate, full_name)
    saved_files["tax_file_records"] = save_file(tax_file_records, full_name)
    saved_files["crb_report"] = save_file(crb_report, full_name)
    saved_files["mobile_money_statement"] = save_file(mobile_money_statement, full_name)
    saved_files["selfie"] = save_file(selfie, full_name)
    saved_files["mpesa_hakikisha"] = save_file(mpesa_hakikisha, full_name)

    # Save multiple pay slips
    saved_files["pay_slips"] = []
    for ps in pay_slips:
        saved_files["pay_slips"].append(save_file(ps, full_name))

    # Save text info as a JSON file
    metadata = {
        "full_name": full_name,
        "telephone_number": telephone_number,
        "physical_address": physical_address,
        "email_address": email_address,
        "level_of_education": level_of_education,
        "social_media_handles": [h.strip() for h in social_media_handles.split(",")],
        "timestamp": timestamp
    }

    import json
    meta_file_path = os.path.join(UPLOAD_DIR, full_name, f"{timestamp}_metadata.json")
    with open(meta_file_path, "w") as mf:
        json.dump(metadata, mf, indent=4)

    return {
        "status": "success",
        "message": f"KYC data for {full_name} saved successfully.",
        "files_saved": saved_files,
        "metadata_file": meta_file_path
    }
