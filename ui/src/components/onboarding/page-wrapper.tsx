"use client";

import { OnboardingPageWrapperProps } from "../../utils/types";

export default function OnboardingPageWrapper({
  title,
  subtitle,
  children,
}: OnboardingPageWrapperProps) {
  return (
    <>
      <div className="text-center mb-5">
        <h1 className="text-slate-900 tracking-tight text-2xl font-bold leading-tight pb-3">
          {title}
        </h1>
        <p className="text-slate-600 text-base font-normal leading-normal max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full mb-2">{children}</div>
    </>
  );
}
