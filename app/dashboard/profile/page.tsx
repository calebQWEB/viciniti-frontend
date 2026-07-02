"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/types/user";
import { useAuthStore } from "@/store/authStore";
import LocationPicker from "@/components/ui/LocationPicker";
import BankAccountSection from "@/components/shared/BankAccountSection";
import {
  Camera,
  Loader2,
  CheckCircle,
  User as UserIcon,
  Mail,
  MapPin,
  FileText,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      return response.data as User;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Pre-populate form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  // Update profile mutation
  const { mutate: updateProfile, isPending: saving } = useMutation({
    mutationFn: (data: typeof form) => api.put("/users/me", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setUser(response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
    },
  });

  // Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { url } = response.data;
      setAvatarPreview(url);
      setForm((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      console.error("Avatar upload failed:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLocationChange = (
    location: string,
    latitude: number | null,
    longitude: number | null,
  ) => {
    setForm((prev) => ({ ...prev, location, latitude, longitude }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateProfile(form);
  };

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: () =>
      api.put("/users/me/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error: any) => {
      setPasswordErrors({
        current_password:
          error.response?.data?.detail || "Failed to change password",
      });
    },
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validatePassword = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!passwordForm.current_password)
      newErrors.current_password = "Current password is required";
    if (!passwordForm.new_password)
      newErrors.new_password = "New password is required";
    if (passwordForm.new_password.length < 8)
      newErrors.new_password = "Must be at least 8 characters";
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    changePassword();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 animate-pulse space-y-4 sm:space-y-6">
          <div className="h-5 bg-gray-200/70 rounded-full w-1/4" />
          <div className="h-7 sm:h-8 bg-gray-200/70 rounded-full w-2/3" />
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200/70 rounded-xl sm:rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200/70 rounded-full w-2/5" />
              <div className="h-2.5 bg-gray-200/70 rounded-full w-3/5" />
            </div>
          </div>
          <div className="h-28 bg-gray-200/70 rounded-xl sm:rounded-2xl" />
          <div className="h-20 bg-gray-200/70 rounded-xl sm:rounded-2xl" />
          <div className="h-16 bg-gray-200/70 rounded-xl sm:rounded-2xl" />
          <div className="h-10 bg-gray-200/70 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 pb-20 sm:pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Header */}
        <div className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2D6A4F]/15 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wide">
            <UserIcon className="w-2.5 h-2.5" />
            Account
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Your Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-2xl">
            Keep your Viciniti profile up to date so customers can trust your
            listings.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 lg:space-y-6"
          >
            {/* Avatar Section */}
            <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 sm:mb-4">
                Profile Photo
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-[#2D6A4F]/10 border-2 border-[#2D6A4F]/10 flex items-center justify-center">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile photo"
                        width={80}
                        height={80}
                        priority
                        sizes="80px"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#2D6A4F]">
                        {getInitials(form.name || "U")}
                      </span>
                    )}
                  </div>

                  {/* Upload overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-[#2D6A4F] hover:bg-[#1b4332] rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white animate-spin" />
                    ) : (
                      <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                    {form.name || "Your Name"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium mb-2">
                    {user?.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-[10px] sm:text-xs font-bold text-[#2D6A4F] hover:underline disabled:opacity-50 flex items-center justify-center sm:justify-start gap-1"
                  >
                    {uploadingAvatar ? "Uploading..." : "Change photo"}
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </button>
                  <p className="text-[9px] sm:text-[10px] text-gray-300 font-medium mt-1">
                    JPEG, PNG or WebP · Max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Personal Info
              </h2>

              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  <UserIcon className="w-3 h-3" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input w-full text-sm"
                />
                {errors.name && (
                  <p className="text-rose-500 text-[10px] font-medium mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email — read only */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  <Mail className="w-3 h-3" />
                  Email Address
                </label>
                <div className="input w-full bg-gray-50 text-gray-400 cursor-not-allowed flex items-center justify-between text-sm">
                  <span className="truncate">{user?.email}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 shrink-0 ml-2">
                    Locked
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  <FileText className="w-3 h-3" />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell buyers and sellers a little about yourself..."
                  rows={3}
                  className="input w-full resize-none text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Location
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-medium">
                <MapPin className="w-3 h-3 text-[#2D6A4F]" />
                Your location helps buyers and sellers find you nearby
              </div>
              <LocationPicker
                location={form.location}
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={handleLocationChange}
              />
            </div>

            {/* Account Info */}
            <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Account
              </h2>
              <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2D6A4F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">
                    Member since
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pb-4 sm:pb-6">
              <button
                type="submit"
                disabled={saving || uploadingAvatar}
                className="group flex-1 py-2.5 sm:py-3 bg-[#2D6A4F] hover:bg-[#1b4332] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#2D6A4F]/20 transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Saved!
                  </>
                ) : (
                  <>
                    Save Changes
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Password Change — outside main form */}
          {user?.avatar !== undefined && (
            <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 sm:mb-4">
                Change Password
              </h2>

              <div className="space-y-3">
                {/* Current Password */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    <Shield className="w-3 h-3" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="input w-full text-sm"
                  />
                  {passwordErrors.current_password && (
                    <p className="text-rose-500 text-[10px] font-medium mt-1">
                      {passwordErrors.current_password}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    <Shield className="w-3 h-3" />
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    placeholder="At least 8 characters"
                    className="input w-full text-sm"
                  />
                  {passwordErrors.new_password && (
                    <p className="text-rose-500 text-[10px] font-medium mt-1">
                      {passwordErrors.new_password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    <Shield className="w-3 h-3" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    className="input w-full text-sm"
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-rose-500 text-[10px] font-medium mt-1">
                      {passwordErrors.confirm_password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  disabled={changingPassword}
                  className="group w-full py-2.5 sm:py-3 bg-gray-900 hover:bg-black text-white text-sm font-black rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : passwordSuccess ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Password Updated!
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bank Account */}
          <BankAccountSection />
        </div>
      </div>
    </div>
  );
}
