import React, { useState } from "react";
import {
  Building,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Upload,
  X,
} from "lucide-react";
import InputField from "../../components/ui/InputField";
import TextareaField from "../../components/ui/TextareaField";
import toast from "react-hot-toast";
import { useUpdateUserProfileMutation } from "../../redux/features/user/userApi";
import { useSelector } from "react-redux";
import type { RootState, ServerError } from "../../@types";

interface ProfileFormData {
  name: string;
  businessName: string;
  address: string;
  phone: string;
}

interface UpdateProfileData extends ProfileFormData {
  businessLogo?: string;
}

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateUserProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || "",
    businessName: user?.businessName || "",
    address: user?.address || "",
    phone: user?.phone || "",
  });

  const [logoPreview, setLogoPreview] = useState<string>(
    user?.businessLogo?.url || ""
  );
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      setLogoFile(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    setLogoFile(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const updateData: UpdateProfileData = { ...formData };

      if (logoFile) {
        updateData.businessLogo = logoFile;
      }

      await updateUserProfile({ data: updateData }).unwrap();
      toast.success("Profile updated successfully!");
      setLogoFile(null); 
    } catch (err: unknown) {
      const serverError = err as ServerError;
      const errorMessage =
        serverError?.data?.message ||
        serverError?.message ||
        "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-900">My Profile</h3>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="email"
                readOnly
                value={user?.email || ""}
                disabled
                className="w-full h-10 pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <InputField
            label="Full Name"
            name="name"
            icon={User}
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
          />

          <div className="pt-6 border-t border-slate-200">
            <h4 className="text-lg font-medium text-slate-900">
              Business Information
            </h4>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              This will be used to pre-fill the "Bill From" section of your
              invoice.
            </p>

            <div className="space-y-4">
              {/* Business Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Logo
                </label>
                <div className="flex items-start gap-4">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <img
                          src={logoPreview}
                          alt="Business logo preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          aria-label="Remove logo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      PNG, JPG or GIF (max. 5MB, 150x150px recommended)
                    </p>
                  </div>
                </div>
              </div>

              <InputField
                label="Business Name"
                name="businessName"
                icon={Building}
                type="text"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Your company LLC"
              />
              <TextareaField
                label="Address"
                name="address"
                icon={MapPin}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="sector-3, near pacific Mall"
              />
              <InputField
                label="Phone"
                name="phone"
                icon={Phone}
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center justify-center px-4 py-2 h-10 bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
