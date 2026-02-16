"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MdAdd, MdCalendarToday } from "react-icons/md";
import { AuthContext } from "../../../../context/auth.context";
import { buildFinancialYear } from "../../../../utils/helpers";
import { AuthService } from "../../../../lib/api/auth";

import { Button } from "../../../../components/ui/button";
import { Dropdown } from "../../../../components/ui/dropdown";
import { Input } from "../../../../components/ui/input";
import {
  GSTIN_REGEX,
  GstType,
  gstTypeOptions,
  MAX_NEW_FINANCIAL_YEARS,
  PHONE_REGEX,
  TaxMode,
  taxModeOptions,
  UserRole,
} from "../../../../utils/constants";
import {
  AuthContextType,
  ManufacturerProfileForm,
  SignupPayload,
} from "../../../../utils/types";

const states = [
  { label: "Select your state", value: "" },
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Tamil Nadu", value: "tamilnadu" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Delhi", value: "delhi" },
];

const normalizePhone = (value: string) =>
  value.replace(/[^0-9]/g, "").slice(0, 10);

const validateProfileForm = (form: ManufacturerProfileForm): boolean => {
  const fields = Object.keys(form) as (keyof ManufacturerProfileForm)[];

  if (fields.every((key) => !form[key])) {
    toast.error("Please fill the form to continue");
    return false;
  }

  for (const key of fields) {
    if (!form[key]) {
      toast.error(`${key} is required`);
      return false;
    }
  }

  if (!PHONE_REGEX.test(normalizePhone(form.phone))) {
    toast.error("Enter a valid 10-digit phone number.");
    return false;
  }

  if (!GSTIN_REGEX.test(form.gstin.trim().toUpperCase())) {
    toast.error("Enter a valid GSTIN.");
    return false;
  }

  if (!form.activeFinancialYearId) {
    toast.error("Please select an active financial year.");
    return false;
  }

  return true;
};

const buildProfilePayload = (form: ManufacturerProfileForm) => ({
  ...form,
  businessName: form.businessName.trim(),
  contactPerson: form.contactPerson.trim(),
  phone: normalizePhone(form.phone),
  gstin: form.gstin.trim().toUpperCase(),
  registeredAddress: form.registeredAddress.trim(),
});

const buildSignupPayload = (
  form: ManufacturerProfileForm,
  user: Record<string, unknown>,
): SignupPayload | null => {
  const firebaseUid = user.firebaseUid;
  const email = user.email;

  if (typeof firebaseUid !== "string" || typeof email !== "string") {
    return null;
  }

  return {
    firebaseUid,
    email,
    role:
      user.role === UserRole.WHOLESALER
        ? UserRole.WHOLESALER
        : UserRole.MANUFACTURER,
    ...buildProfilePayload(form),
  };
};

export default function ManufacturerProfileSettingsPage() {
  const [savingProfile, setSavingProfile] = useState(false);

  const router = useRouter();
  const { user, setUser } = useContext(AuthContext) as AuthContextType;

  const [profileForm, setProfileForm] = useState<ManufacturerProfileForm>(user);

  const hasUnsavedProfileChanges = useMemo(
    () => JSON.stringify(profileForm) !== JSON.stringify(user),
    [profileForm, user],
  );

  const initialFinancialYearCount = useMemo(
    () => user.financialYears.length,
    [user],
  );

  const addedFinancialYearCount = useMemo(() => {
    if (profileForm.financialYears.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return profileForm.financialYears.filter((financialYear) => {
        const fyStartDate = new Date(financialYear.startYear, 3, 1);
        fyStartDate.setHours(0, 0, 0, 0);
        return today.getTime() < fyStartDate.getTime();
      }).length;
    }

    return Math.max(
      0,
      profileForm.financialYears.length - initialFinancialYearCount,
    );
  }, [profileForm.financialYears, initialFinancialYearCount]);

  const canAddFinancialYear = addedFinancialYearCount < MAX_NEW_FINANCIAL_YEARS;

  const canActivateFinancialYear = (startYear: number) => {
    const today = new Date();
    const fyStartDate = new Date(startYear, 3, 1);
    today.setHours(0, 0, 0, 0);
    fyStartDate.setHours(0, 0, 0, 0);

    return today.getTime() >= fyStartDate.getTime();
  };

  const handleDiscardProfileChanges = () => {
    setProfileForm(user);
    router.push("/manufacturer/dashboard");
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm(profileForm)) return;

    try {
      setSavingProfile(true);
      if (!user) {
        toast.error("Unable to update profile. Please login again.");
        return;
      }

      const payload = buildSignupPayload(
        profileForm,
        user as Record<string, unknown>,
      );

      if (!payload) {
        toast.error("Unable to update profile. Missing account details.");
        return;
      }

      const response = await AuthService.createUser(payload);
      delete response.data.__v;
      setUser(response.data);
      toast.success("Profile settings updated.");
      router.replace("/manufacturer/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddFinancialYear = () => {
    if (!canAddFinancialYear) {
      toast.error(
        `You can add only ${MAX_NEW_FINANCIAL_YEARS} new financial years.`,
      );
      return;
    }

    const latestFinancialYear = profileForm.financialYears.reduce(
      (acc, year) => (year.endYear > acc.endYear ? year : acc),
    );

    const nextFinancialYear = buildFinancialYear(
      latestFinancialYear.startYear + 1,
      latestFinancialYear.endYear + 1,
    );

    setProfileForm((prev) => ({
      ...prev,
      financialYears: [nextFinancialYear, ...prev.financialYears],
    }));

    toast.success(`${nextFinancialYear.label} added.`);
  };

  const handleActivateFinancialYear = (financialYearId: string) => {
    setProfileForm((prev) => ({
      ...prev,
      activeFinancialYearId: financialYearId,
    }));
    toast.success("Financial year activated.");
  };

  return (
    <div className="min-h-[calc(100vh-124px)] p-4 pb-6 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update business profile, tax defaults, and manage financial years.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-black text-slate-900">
            Business Identity
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Legal Business Name"
              value={profileForm.businessName}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  businessName: event.target.value,
                }))
              }
              placeholder="Enter legal business name"
            />

            <Input
              label="GST Number"
              value={profileForm.gstin}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  gstin: event.target.value,
                }))
              }
              placeholder="22AAAAA0000A1Z5"
            />

            <Input
              label="Contact Person"
              value={profileForm.contactPerson}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  contactPerson: event.target.value,
                }))
              }
              placeholder="Enter contact person"
            />

            <Input
              label="Phone Number"
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
              placeholder="10-digit mobile number"
            />

            <div className="flex flex-col">
              <Input
                label="Email Address"
                type="email"
                defaultValue={user.email}
                disabled
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="name@company.com"
              />
              <p className="mt-1 text-xs text-slate-500">
                This email is associated with your account and cannot be edited.
              </p>
            </div>

            <Dropdown
              label="State / Region"
              options={states}
              value={profileForm.state}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  state: event.target.value,
                }))
              }
            />

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#0d161b]">
                Registered Office Address
              </label>
              <textarea
                value={profileForm.registeredAddress}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    registeredAddress: event.target.value,
                  }))
                }
                placeholder="Enter registered office address"
                rows={3}
                className="w-full rounded-lg border border-[#cfdde7] bg-slate-50 p-4 text-sm text-[#0d161b] transition-all focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-black text-slate-900">
            Tax & Billing Defaults
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Dropdown
              label="Default GST Type"
              value={profileForm.gstType}
              options={gstTypeOptions}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  gstType: event.target.value as GstType,
                }))
              }
            />

            <Dropdown
              label="Default Tax Mode"
              value={profileForm.gstTaxMode}
              options={taxModeOptions}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  gstTaxMode: event.target.value as TaxMode,
                }))
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Financial Year Control
              </h2>
              <p className="text-sm text-slate-500">
                {`Add up to ${MAX_NEW_FINANCIAL_YEARS} new FYs. New FY can be activated only after its start date.`}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline-secondary"
              leadingIcon={<MdAdd className="h-4 w-4" />}
              onClick={handleAddFinancialYear}
            >
              Add New Year
            </Button>
          </div>

          <p className="mb-3 text-xs text-slate-500">
            New FYs added: {addedFinancialYearCount}/{MAX_NEW_FINANCIAL_YEARS}
          </p>

          <div className="space-y-3">
            {profileForm.financialYears.map((financialYear) => {
              const isActive =
                financialYear.id === profileForm.activeFinancialYearId;
              const isActivatable = canActivateFinancialYear(
                financialYear.startYear,
              );

              return (
                <div
                  key={financialYear.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isActive
                      ? "border-primary bg-primary-soft"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <MdCalendarToday className="h-4 w-4" />
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {financialYear.label}
                        </p>
                        {isActive && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {financialYear.range}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <p className="text-sm font-semibold text-slate-500 text-right">
                      Active View
                    </p>
                  ) : (
                    <div className="flex" style={{ justifyContent: "right" }}>
                      {isActivatable ? (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={!isActivatable}
                          onClick={() =>
                            handleActivateFinancialYear(financialYear.id)
                          }
                        >
                          Activate Year
                        </Button>
                      ) : (
                        <p className="text-xs text-slate-500 text-right">
                          Available from Apr 1, {financialYear.startYear}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 mt-6 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {hasUnsavedProfileChanges
              ? "Unsaved profile changes detected."
              : "All profile changes are saved."}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDiscardProfileChanges}
              disabled={savingProfile}
            >
              {hasUnsavedProfileChanges ? "Discard" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              loading={savingProfile}
              disabled={!hasUnsavedProfileChanges}
              className="disabled:bg-gray-200 disabled:text-gray-400 shadow-none disabled:pointer-events-none"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
