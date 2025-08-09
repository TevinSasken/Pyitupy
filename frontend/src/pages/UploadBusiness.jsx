import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Reusable Individual KYC Form for Owners
const OwnerKYCForm = ({ ownerIndex }) => {
  const [socialMedia, setSocialMedia] = useState("");

  const getSocialPlaceholder = () => {
    if (socialMedia === "linkedin") return "Profile URL";
    if (socialMedia) return "@username";
    return "Enter handle or URL";
  };

  const idx = ownerIndex + 1;

  return (
    <div className="p-4 border rounded mb-6 bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Individual KYC – Owner {idx}</h3>

      {/* Personal Info */}
      <div className="bg-gray-50 p-4 rounded shadow space-y-4">
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input type="text" name={`owner${idx}_full_name`} className="border rounded p-2 w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">National ID Number</label>
          <input type="text" name={`owner${idx}_national_id`} className="border rounded p-2 w-full mb-2" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">National ID Front</label>
              <input type="file" name={`owner${idx}_id_front`} />
            </div>
            <div>
              <label className="block font-medium mb-1">National ID Back</label>
              <input type="file" name={`owner${idx}_id_back`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Tax PIN Number</label>
            <input type="text" name={`owner${idx}_tax_pin`} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Tax PIN Certificate</label>
            <input type="file" name={`owner${idx}_tax_pin_cert`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">M-Pesa Phone Number</label>
            <input type="text" name={`owner${idx}_mpesa_number`} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">M-Pesa Hakikisha Screenshot</label>
            <input type="file" name={`owner${idx}_mpesa_hakikisha`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Level of Education</label>
            <select name={`owner${idx}_education_level`} className="border rounded p-2 w-full">
              <option value="">Select level</option>
              <option value="high_school">High School</option>
              <option value="college_diploma">College Diploma</option>
              <option value="undergraduate_degree">Undergraduate Degree</option>
              <option value="masters_degree">Masters Degree</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Education Certificate</label>
            <input type="file" name={`owner${idx}_education_cert`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Social Media Platform</label>
            <select
              name={`owner${idx}_social_media_platform`}
              onChange={(e) => setSocialMedia(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select platform</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">X (Twitter)</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Handle / URL</label>
            <input
              type="text"
              name={`owner${idx}_social_media_handle`}
              placeholder={getSocialPlaceholder()}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Telephone Number</label>
          <input type="text" name={`owner${idx}_phone_number`} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Physical Address</label>
          <input type="text" name={`owner${idx}_address`} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input type="email" name={`owner${idx}_email`} className="border rounded p-2 w-full" />
        </div>
      </div>

      {/* Additional Docs */}
      <div className="bg-gray-50 p-4 rounded shadow space-y-4 mt-4">
        <div>
          <label className="block font-medium mb-1">Pay Slips (Last 6 Months)</label>
          <input type="file" name={`owner${idx}_pay_slips`} multiple />
        </div>
        <div>
          <label className="block font-medium mb-1">Income Tax File Records (Previous Year)</label>
          <input type="file" name={`owner${idx}_income_tax_records`} />
        </div>
        <div>
          <label className="block font-medium mb-1">Credit Reference Bureau Report</label>
          <input type="file" name={`owner${idx}_crb_report`} />
        </div>
        <div>
          <label className="block font-medium mb-1">Mobile Money Statement (Last 12 Months)</label>
          <input type="file" name={`owner${idx}_mobile_money`} />
        </div>
        <div>
          <label className="block font-medium mb-1">Selfie</label>
          <input type="file" name={`owner${idx}_selfie`} />
        </div>
      </div>
    </div>
  );
};

export default function UploadBusiness() {
  const [businessType, setBusinessType] = useState("");
  const [locationType, setLocationType] = useState("");
  const [ownerCount, setOwnerCount] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const getMinOwners = (type) => {
    if (type === "LLP") return 2;
    if (type === "Sole Proprietorship") return 1;
    return 1;
  };

  const handleBusinessTypeChange = (e) => {
    const type = e.target.value;
    setBusinessType(type);
    setOwnerCount(getMinOwners(type));
  };

  const renderBusinessDocs = () => {
    switch (businessType) {
      case "Sole Proprietorship":
        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium">Business Registration / Permit Number</label>
              <input type="text" name="business_reg_number" className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium">Business Certificate / Permit Document</label>
              <input type="file" name="business_reg_cert" />
            </div>
          </div>
        );
      case "LLC":
        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium">Certificate of Incorporation Number</label>
              <input type="text" name="coi_number" className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium">Certificate of Incorporation Document</label>
              <input type="file" name="coi_document" />
            </div>
            <div>
              <label className="block font-medium">Company KRA PIN Number</label>
              <input type="text" name="company_kra_pin" className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium">Company KRA PIN Certificate</label>
              <input type="file" name="company_kra_cert" />
            </div>
            <div>
              <label className="block font-medium">CR12 Number</label>
              <input type="text" name="cr12_number" className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium">CR12 Document</label>
              <input type="file" name="cr12_document" />
            </div>
            <div>
              <label className="block font-medium">Company Credit Reference Bureau Report</label>
              <input type="file" name="company_crb_report" />
            </div>
          </div>
        );
      case "LLP":
        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium">Certificate of Registration Number</label>
              <input type="text" name="cor_number" className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium">Certificate of Registration Document</label>
              <input type="file" name="cor_document" />
            </div>
            <div>
              <label className="block font-medium">Company KRA PIN Number</label>
              <input type="text" name="company_kra_pin" className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium">Company KRA PIN Certificate</label>
              <input type="file" name="company_kra_cert" />
            </div>
            <div>
              <label className="block font-medium">Partnership Deed / Affidavit</label>
              <input type="file" name="partnership_deed" />
            </div>
            <div>
              <label className="block font-medium">Company Credit Reference Bureau Report</label>
              <input type="file" name="company_crb_report" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    try {
      const formElement = e.target;
      const data = new FormData(formElement);

      const res = await axios.post("http://127.0.0.1:8000/kyc/business", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(`✅ Success: ${res.data.message || "Business KYC uploaded"}`);

      // Redirect to Loan Application page
      navigate("/loan-application");
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Check console.");
    }

    setUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Business KYC</h2>

      <form onSubmit={handleSubmit}>
        {/* Business Type */}
        <div className="mb-4">
          <label className="block font-medium">Business Type</label>
          <select
            className="border p-2 w-full"
            value={businessType}
            onChange={handleBusinessTypeChange}
            name="business_type"
          >
            <option value="">Select Type</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="LLC">Limited Liability Company (LLC)</option>
            <option value="LLP">Limited Liability Partnership (LLP)</option>
          </select>
        </div>

        {businessType && renderBusinessDocs()}

        {/* Location */}
        {businessType && (
          <>
            <div className="mb-4">
              <label className="block font-medium">Business Location Type</label>
              <select
                className="border p-2 w-full"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                name="location_type"
              >
                <option value="">Select Location Type</option>
                <option value="physical">Physical Location</option>
                <option value="online">Online Only</option>
              </select>
            </div>

            {locationType === "physical" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium">Latitude & Longitude</label>
                  <input type="text" name="geo_coordinates" className="border p-2 w-full" />
                </div>
                <div>
                  <label className="block font-medium">Geotagged Business Photo</label>
                  <input type="file" name="geo_photo" />
                </div>
              </div>
            )}

            {locationType === "online" && (
              <div className="mb-4">
                <label className="block font-medium">Business Website / Social Media URL</label>
                <input type="url" name="online_url" className="border p-2 w-full" />
              </div>
            )}

            {/* Owner Count */}
            {businessType !== "Sole Proprietorship" && (
              <div className="mb-4">
                <label className="block font-medium">Number of Owners</label>
                <select
                  className="border p-2 w-full"
                  value={ownerCount}
                  onChange={(e) => setOwnerCount(Number(e.target.value))}
                  name="owner_count"
                >
                  {Array.from({ length: 5 }, (_, i) => i + getMinOwners(businessType)).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Owner Forms */}
            <div className="mt-6">
              {Array.from({ length: ownerCount }).map((_, idx) => (
                <OwnerKYCForm key={idx} ownerIndex={idx} />
              ))}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Submit Business KYC"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
