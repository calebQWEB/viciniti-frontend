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
  CheckCircle2,
  User as UserIcon,
  Mail,
  MapPin,
  FileText,
  Shield,
  ArrowUpRight,
  Wallet,
  Calendar,
  Lock,
  Sparkles,
  Check,
  Clock,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

type Tab = "profile" | "security" | "payout";

function SectionLabel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900">{title}</h2>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  htmlFor,
  children,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2"
      >
        {icon}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] font-medium text-rose-500 mt-1.5">{error}</p>
      )}
    </div>
  );
}

function SideCard({
  icon,
  title,
  children,
  accent = "gray",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: "gray" | "green";
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-[26px] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            accent === "green"
              ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
              : "bg-gray-50 text-gray-500"
          }`}
        >
          {icon}
        </div>
        <p className="text-xs font-black text-gray-900">{title}</p>
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  loading,
  success,
  disabled,
  onClick,
  type = "submit",
}: {
  children: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="group w-full sm:w-auto min-w-[170px] px-5 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#24563f] text-white text-sm font-bold shadow-lg shadow-[#2D6A4F]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Saved
        </>
      ) : (
        <>
          {children}
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

const BIO_MAX_LENGTH = 500;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("profile");

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

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      return response.data as User;
    },
    staleTime: 5 * 60 * 1000,
  });

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

  const tabs: {
    key: Tab;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "profile",
      label: "Profile",
      description: "Personal information",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      key: "security",
      label: "Security",
      description: "Password & access",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      key: "payout",
      label: "Payout",
      description: "Bank account",
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  const bioRemaining = BIO_MAX_LENGTH - form.bio.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F8] pb-20 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 animate-pulse">
          <div className="h-56 bg-white rounded-[28px] mb-5" />
          <div className="h-20 bg-white rounded-2xl mb-5" />
          <div className="h-96 bg-white rounded-[28px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F7F9F8] pb-24 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#163C2D] text-white shadow-xl shadow-[#163C2D]/10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#2D6A4F]/40 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-[#52B788]/20 blur-3xl" />
            <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.05]">
              <div className="w-full h-full rounded-full border-[35px] border-white" />
            </div>
          </div>

          <div className="relative px-5 py-7 sm:px-9 sm:py-10">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-5 sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white/10 border border-white/20 shadow-2xl">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile photo"
                      width={112}
                      height={112}
                      priority
                      sizes="112px"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        {getInitials(form.name || "U")}
                      </span>
                    </div>
                  )}

                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -right-2 -bottom-2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#2D6A4F] flex items-center justify-center shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
                  aria-label="Change profile photo"
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Profile information */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#B7E4C7]">
                    <Sparkles className="w-3 h-3" />
                    Account
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black tracking-tight truncate">
                  {form.name || "Your Profile"}
                </h1>

                <p className="text-xs sm:text-sm text-white/60 mt-1 truncate">
                  {user?.email}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    Member since{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-NG", {
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </div>

                  {form.location && (
                    <>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[220px]">
                          {form.location}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TABS
        ========================================================== */}
        <div className="mt-5 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center justify-center sm:justify-start gap-2.5 px-2.5 sm:px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/15"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <div
                    className={`shrink-0 ${active ? "text-white" : "text-gray-400"}`}
                  >
                    {tab.icon}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-black">{tab.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${active ? "text-white/60" : "text-gray-400"}`}
                    >
                      {tab.description}
                    </div>
                  </div>
                  <span className="sm:hidden text-xs font-bold">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            CONTENT
        ========================================================== */}
        <div className="mt-5">
          {/* =======================================================
              PROFILE
          ======================================================== */}
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-[1fr_280px] gap-5">
                {/* Main form */}
                <div className="bg-white border border-gray-100 rounded-[22px] sm:rounded-[26px] shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-7">
                    <SectionLabel
                      icon={<UserIcon className="w-4 h-4" />}
                      title="Personal information"
                      description="Keep your profile details up to date."
                    />

                    <div className="space-y-6">
                      <FormField
                        label="Full name"
                        htmlFor="profile-name"
                        icon={<UserIcon className="w-3.5 h-3.5" />}
                        error={errors.name}
                      >
                        <input
                          id="profile-name"
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:border-[#2D6A4F]/30 focus:ring-4 focus:ring-[#2D6A4F]/5"
                        />
                      </FormField>

                      <FormField
                        label="Email address"
                        htmlFor="profile-email"
                        icon={<Mail className="w-3.5 h-3.5" />}
                      >
                        <div className="relative">
                          <input
                            id="profile-email"
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full h-12 px-4 pr-20 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-400 cursor-not-allowed"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            <Lock className="w-2.5 h-2.5" />
                            Locked
                          </span>
                        </div>
                      </FormField>

                      <FormField
                        label="About you"
                        htmlFor="profile-bio"
                        icon={<FileText className="w-3.5 h-3.5" />}
                      >
                        <textarea
                          id="profile-bio"
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          placeholder="Tell buyers and sellers a little about yourself..."
                          rows={5}
                          maxLength={BIO_MAX_LENGTH}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 resize-none outline-none transition-all focus:bg-white focus:border-[#2D6A4F]/30 focus:ring-4 focus:ring-[#2D6A4F]/5"
                        />
                        <div className="flex justify-end mt-1.5">
                          <span
                            className={`text-[10px] ${bioRemaining <= 20 ? "text-amber-500 font-semibold" : "text-gray-300"}`}
                          >
                            {bioRemaining} characters left
                          </span>
                        </div>
                      </FormField>

                      <FormField
                        label="Location"
                        htmlFor="profile-location"
                        icon={<MapPin className="w-3.5 h-3.5" />}
                      >
                        <LocationPicker
                          location={form.location}
                          latitude={form.latitude}
                          longitude={form.longitude}
                          onChange={handleLocationChange}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 bg-gray-50/70 px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-[11px] text-gray-400">
                      Your profile information is visible to other users where
                      applicable.
                    </p>
                    <PrimaryButton
                      loading={saving}
                      success={saveSuccess}
                      disabled={uploadingAvatar}
                    >
                      Save changes
                    </PrimaryButton>
                  </div>
                </div>

                {/* Side card */}
                <div className="space-y-5">
                  <div className="bg-[#EAF4EE] rounded-[22px] sm:rounded-[26px] p-6 border border-[#D7EADF]">
                    <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center mb-4">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-[#163C2D]">
                      Complete your profile
                    </h3>
                    <p className="text-xs text-[#2D6A4F]/70 leading-relaxed mt-2">
                      A complete profile helps other users know who they are
                      dealing with and builds trust.
                    </p>

                    <div className="mt-5 space-y-3">
                      {[
                        { label: "Full name", done: !!form.name },
                        { label: "Profile photo", done: !!avatarPreview },
                        { label: "Location", done: !!form.location },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F]"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                            {item.done ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <SideCard
                    icon={<Shield className="w-4 h-4 text-gray-500" />}
                    title="Account security"
                  >
                    <p className="text-[10px] text-gray-400 -mt-2 mb-4">
                      Keep your account protected
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("security")}
                      className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-gray-50 hover:bg-[#EAF4EE] text-xs font-bold text-gray-600 hover:text-[#2D6A4F] transition-colors"
                    >
                      Manage password
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </SideCard>
                </div>
              </div>
            </form>
          )}

          {/* =======================================================
              SECURITY
          ======================================================== */}
          {activeTab === "security" && (
            <div className="grid lg:grid-cols-[1fr_280px] gap-5">
              <div className="bg-white border border-gray-100 rounded-[22px] sm:rounded-[26px] shadow-sm overflow-hidden">
                <div className="p-5 sm:p-7">
                  <SectionLabel
                    icon={<Shield className="w-4 h-4" />}
                    title="Password & security"
                    description="Change your password to keep your account secure."
                  />

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <FormField
                      label="Current password"
                      htmlFor="current-password"
                      icon={<Lock className="w-3.5 h-3.5" />}
                      error={passwordErrors.current_password}
                    >
                      <input
                        id="current-password"
                        type="password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:border-[#2D6A4F]/30 focus:ring-4 focus:ring-[#2D6A4F]/5"
                      />
                    </FormField>

                    <div className="border-t border-gray-100 pt-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormField
                          label="New password"
                          htmlFor="new-password"
                          icon={<Shield className="w-3.5 h-3.5" />}
                          error={passwordErrors.new_password}
                        >
                          <input
                            id="new-password"
                            type="password"
                            name="new_password"
                            value={passwordForm.new_password}
                            onChange={handlePasswordChange}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:border-[#2D6A4F]/30 focus:ring-4 focus:ring-[#2D6A4F]/5"
                          />
                        </FormField>

                        <FormField
                          label="Confirm password"
                          htmlFor="confirm-password"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          error={passwordErrors.confirm_password}
                        >
                          <input
                            id="confirm-password"
                            type="password"
                            name="confirm_password"
                            value={passwordForm.confirm_password}
                            onChange={handlePasswordChange}
                            placeholder="Repeat your new password"
                            autoComplete="new-password"
                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:bg-white focus:border-[#2D6A4F]/30 focus:ring-4 focus:ring-[#2D6A4F]/5"
                          />
                        </FormField>
                      </div>
                    </div>

                    <div className="pt-1">
                      <PrimaryButton
                        type="submit"
                        loading={changingPassword}
                        success={passwordSuccess}
                      >
                        Update password
                      </PrimaryButton>
                    </div>
                  </form>
                </div>
              </div>

              <div className="space-y-5">
                <SideCard
                  icon={<Shield className="w-4 h-4 text-gray-500" />}
                  title="Password tips"
                  accent="gray"
                >
                  <ul className="space-y-2.5">
                    {[
                      "Use at least 8 characters",
                      "Avoid your name, email, or common words",
                      "Mix letters, numbers, and symbols",
                      "Never reuse passwords from other sites",
                    ].map((tip) => (
                      <li
                        key={tip}
                        className="flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed"
                      >
                        <BadgeCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </SideCard>
              </div>
            </div>
          )}

          {/* =====================================================
              PAYOUT
          ======================================================== */}
          {activeTab === "payout" && (
            <div className="grid lg:grid-cols-[1fr_280px] gap-5">
              <div className="bg-white border border-gray-100 rounded-[22px] sm:rounded-[26px] shadow-sm overflow-hidden">
                <div className="p-5 sm:p-7">
                  <SectionLabel
                    icon={<Wallet className="w-4 h-4" />}
                    title="Payout account"
                    description="Manage the bank account used to receive your payouts."
                  />
                  <BankAccountSection />
                </div>
              </div>

              <div className="space-y-5">
                <SideCard
                  icon={<Clock className="w-4 h-4 text-[#2D6A4F]" />}
                  title="How payouts work"
                  accent="green"
                >
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      Once a buyer confirms an order, your payout is scheduled 3
                      days later.
                    </li>
                    <li className="flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      This short delay protects both you and the buyer in case a
                      dispute is filed.
                    </li>
                    <li className="flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      You need a default bank account on file before any payout
                      can be released.
                    </li>
                  </ul>
                </SideCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
