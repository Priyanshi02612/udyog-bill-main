"use client";

import { useContext, useMemo, useState } from "react";
import { MdAdd, MdCalendarToday } from "react-icons/md";
import { AuthContext } from "../../../../context/auth.context";
import { UserContext } from "../../../../context/user.context";
import { AddFinancialYearModal } from "../../../../components/admin/modal/add-financial-year-modal";

import { Button } from "../../../../components/ui/button";
import { Dropdown } from "../../../../components/ui/dropdown";
import { Input } from "../../../../components/ui/input";
import {
  GstType,
  gstTypeOptions,
  MAX_NEW_FINANCIAL_YEARS,
  TaxMode,
  taxModeOptions,
} from "../../../../utils/constants";
import { AuthContextType, UserContextType } from "../../../../utils/types";
import toast from "react-hot-toast";

const states = [
  { label: "Select your state", value: "" },
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Tamil Nadu", value: "tamilnadu" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Delhi", value: "delhi" },
];

export default function ManufacturerProfileSettingsPage() {
  const { user, authLoading } = useContext(AuthContext) as AuthContextType;
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [selectedStartYear, setSelectedStartYear] = useState("");
  const {
    userProfile,
    addedFinancialYearCount,
    hasUnsavedProfileChanges,
    savingProfile,
    canAddFinancialYear,
    setUserProfile,
    handleAddFinancialYear,
    canActivateFinancialYear,
    handleActivateFinancialYear,
    handleDiscardProfileChanges,
    handleSaveProfile,
  } = useContext(UserContext) as UserContextType;

  const currentFinancialStartYear = useMemo(() => {
    const today = new Date();
    return today.getMonth() >= 3
      ? today.getFullYear()
      : today.getFullYear() - 1;
  }, []);

  const availableStartYears = useMemo(() => {
    const existingYears = new Set(
      userProfile.financialYears.map((fy) => fy.startYear),
    );

    const years = [];

    for (let i = 0; i < 8; i++) {
      const year = currentFinancialStartYear + i;
      if (!existingYears.has(year)) {
        years.push({ label: `${year}`, value: `${year}` });
      }
    }

    return years;
  }, [currentFinancialStartYear, userProfile.financialYears]);

  const handleOpenAddYearModal = () => {
    if (!canAddFinancialYear) {
      toast.error(
        `You can add only ${MAX_NEW_FINANCIAL_YEARS} new financial years.`,
      );
      return;
    }

    setSelectedStartYear(availableStartYears[0].value);
    setIsAddYearModalOpen(true);
  };

  const handleConfirmAddYear = () => {
    if (!selectedStartYear) return;
    handleAddFinancialYear(Number(selectedStartYear));
    setIsAddYearModalOpen(false);
    setSelectedStartYear("");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

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
              value={userProfile.businessName}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...prev,
                  businessName: event.target.value,
                }))
              }
              placeholder="Enter legal business name"
            />

            <Input
              label="GST Number"
              value={userProfile.gstin}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...prev,
                  gstin: event.target.value,
                }))
              }
              placeholder="22AAAAA0000A1Z5"
            />

            <Input
              label="Contact Person"
              value={userProfile.contactPerson}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...prev,
                  contactPerson: event.target.value,
                }))
              }
              placeholder="Enter contact person"
            />

            <Input
              label="Phone Number"
              value={userProfile.phone}
              onChange={(event) =>
                setUserProfile((prev) => ({
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
                  setUserProfile((prev) => ({
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
              value={userProfile.state}
              onChange={(event) =>
                setUserProfile((prev) => ({
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
                value={userProfile.registeredAddress}
                onChange={(event) =>
                  setUserProfile((prev) => ({
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
              value={userProfile.gstType}
              options={gstTypeOptions}
              onChange={(event) =>
                setUserProfile((prev) => ({
                  ...prev,
                  gstType: event.target.value as GstType,
                }))
              }
            />

            <Dropdown
              label="Default Tax Mode"
              value={userProfile.gstTaxMode}
              options={taxModeOptions}
              onChange={(event) =>
                setUserProfile((prev) => ({
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
              onClick={handleOpenAddYearModal}
            >
              Add New Year
            </Button>
          </div>

          <p className="mb-3 text-xs text-slate-500">
            New FYs added: {addedFinancialYearCount}/{MAX_NEW_FINANCIAL_YEARS}
          </p>

          <div className="space-y-3">
            {userProfile.financialYears.map((financialYear) => {
              const isActive =
                financialYear.id === userProfile.activeFinancialYearId;
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
                        <div className="flex flex-col">
                          <p className="text-xs text-slate-500 text-right">
                            Available from Apr 1, {financialYear.startYear}
                          </p>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setUserProfile((prev) => ({
                                ...prev,
                                financialYears: prev.financialYears.filter(
                                  (fy) => fy.id !== financialYear.id,
                                ),
                              }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
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

      <AddFinancialYearModal
        open={isAddYearModalOpen}
        selectedStartYear={selectedStartYear}
        yearOptions={availableStartYears}
        onChangeStartYear={setSelectedStartYear}
        onClose={() => setIsAddYearModalOpen(false)}
        onCreate={handleConfirmAddYear}
      />
    </div>
  );
}
