import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Upload, CheckCircle, AlertCircle,
  Building, Info, ArrowRight
} from "lucide-react";
import { appointmentAPI, paymentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const BankTransferForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reference, setReference] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentAPI.getById(appointmentId);
        // ✅ FIXED: unwrap nested appointment object
        setAppointment(response.data.appointment || response.data);
      } catch (err) {
        setError("Failed to fetch appointment details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload your bank transfer slip.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    // ✅ FIXED: correct field names matching backend validators
    formData.append("appointmentId", appointmentId);
    formData.append("paymentSlip", file);
    if (reference) formData.append("transferReference", reference);

    try {
      await paymentAPI.bankTransfer(formData);
      setSuccess(true);
      setTimeout(() => navigate("/appointments"), 3000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Failed to submit payment verification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Submission Successful!</h2>
        <p className="text-gray-600 mb-8">
          Your payment slip has been submitted for verification. An administrator will review it shortly.
        </p>
        <div className="flex items-center justify-center text-sm text-gray-500 animate-pulse">
          Redirecting to your appointments <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/payment-selector/${appointmentId}`}
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Payment Selection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Building className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bank Transfer</h1>
                    <p className="text-gray-500">Upload your payment record</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                      Upload Receipt / Slip
                    </label>
                    <div className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${preview
                        ? 'border-blue-200 bg-blue-50/30'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                      {preview ? (
                        <div className="relative inline-block">
                          <img
                            src={preview}
                            alt="Slip Preview"
                            className="max-h-64 rounded-2xl shadow-lg border border-white"
                          />
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                            <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700">Click or drag to upload</p>
                            <p className="text-sm text-gray-500">Maximum file size: 5MB (JPG, PNG or PDF)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                      Transaction Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Enter the transaction reference number"
                      className="w-full h-14 px-6 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
                  >
                    {submitting ? "Submitting..." : "Submit Payment Slip"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" /> Payment Details
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Name</p>
                  <p className="text-gray-900 font-semibold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    MEDIGO Healthcare Pvt Ltd
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Number</p>
                  <p className="text-2xl font-black text-gray-900 font-mono tracking-tighter">0023 4567 8910</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank & Branch</p>
                  <p className="text-gray-900 font-semibold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    National Trust Bank - Kollupitiya
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">Total Fee Payable</p>
                <p className="text-4xl font-black mb-6">
                  LKR {appointment?.fee?.toLocaleString() ?? '—'}
                </p>
                <div className="pt-6 border-t border-blue-500/50 space-y-4">
                  <div className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                    <span className="text-blue-100">
                      Ref: {appointmentId?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 leading-relaxed italic">
                    Include the Reference ID in your bank transfer description for faster verification.
                  </p>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransferForm;