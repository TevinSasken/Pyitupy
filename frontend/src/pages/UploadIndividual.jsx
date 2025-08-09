import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("");

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSocialChange = (e) => {
    setSocialPlatform(e.target.value);
    setFormData({
      ...formData,
      social_platform: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      const res = await axios.post("http://127.0.0.1:8000/kyc/individual", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(`✅ Success: ${res.data.message || "KYC uploaded"}`);

      // Redirect to Loan Application page
      navigate("/loan-application");

    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Check console.");
    }

    setUploading(false);
  };

  const getSocialPlaceholder = () => {
    if (socialPlatform === "linkedin") return "Profile URL";
    if (socialPlatform) return "@username";
    return "Enter handle or URL";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Individual KYC</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Info */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-4">
          <h2 className="font-semibold mb-3">Step 1: Personal Information</h2>

          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input type="text" name="full_name" onChange={handleTextChange} className="border rounded p-2 w-full" />
          </div>

          {/* National ID Number + Front & Back */}
          <div>
            <label className="block font-medium mb-1">National ID Number</label>
            <input type="text" name="national_id" onChange={handleTextChange} className="border rounded p-2 w-full mb-2" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">National ID Front</label>
                <input type="file" name="id_front" onChange={handleFileChange} />
              </div>
              <div>
                <label className="block font-medium mb-1">National ID Back</label>
                <input type="file" name="id_back" onChange={handleFileChange} />
              </div>
            </div>
          </div>

          {/* Tax PIN + File */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Tax PIN Number</label>
              <input type="text" name="tax_pin" onChange={handleTextChange} className="border rounded p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Tax PIN Certificate (Scan)</label>
              <input type="file" name="tax_pin_cert" onChange={handleFileChange} />
            </div>
          </div>

          {/* M-Pesa Phone Number + Hakikisha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">M-Pesa Phone Number</label>
              <input type="text" name="mpesa_number" onChange={handleTextChange} className="border rounded p-2 w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">M-Pesa Hakikisha Screenshot</label>
              <input type="file" name="mpesa_hakikisha" onChange={handleFileChange} />
            </div>
          </div>

          {/* Level of Education + Cert */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Level of Education</label>
              <select name="education_level" onChange={handleTextChange} className="border rounded p-2 w-full">
                <option value="">Select level</option>
                <option value="high_school">High School</option>
                <option value="college_diploma">College Diploma</option>
                <option value="undergraduate_degree">Undergraduate Degree</option>
                <option value="masters_degree">Masters Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Education Certificate (Scan)</label>
              <input type="file" name="education_cert" onChange={handleFileChange} />
            </div>
          </div>

          {/* Social Media Selection + Handle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Social Media Platform</label>
              <select name="social_media_platform" onChange={handleSocialChange} className="border rounded p-2 w-full">
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
                name="social_media_handle"
                placeholder={getSocialPlaceholder()}
                onChange={handleTextChange}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>

          {/* Remaining Info */}
          <div>
            <label className="block font-medium mb-1">Telephone Number</label>
            <input type="text" name="phone_number" onChange={handleTextChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Physical Address</label>
            <input type="text" name="address" onChange={handleTextChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input type="email" name="email" onChange={handleTextChange} className="border rounded p-2 w-full" />
          </div>
        </div>

        {/* Additional Required Files */}
        <div className="bg-gray-50 p-4 rounded shadow space-y-4">
          <h2 className="font-semibold mb-3">Step 2: Additional Documents</h2>

          <div>
            <label className="block font-medium mb-1">Pay Slips (Last 6 Months)</label>
            <input type="file" name="pay_slips" onChange={handleFileChange} multiple />
          </div>

          <div>
            <label className="block font-medium mb-1">Income Tax File Records (Previous Year)</label>
            <input type="file" name="income_tax_records" onChange={handleFileChange} />
          </div>

          <div>
            <label className="block font-medium mb-1">Credit Reference Bureau Report</label>
            <input type="file" name="crb_report" onChange={handleFileChange} />
          </div>

          <div>
            <label className="block font-medium mb-1">Mobile Money Statement (Last 12 Months)</label>
            <input type="file" name="mobile_money" onChange={handleFileChange} />
          </div>

          <div>
            <label className="block font-medium mb-1">Selfie</label>
            <input type="file" name="selfie" onChange={handleFileChange} />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Submit KYC"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
