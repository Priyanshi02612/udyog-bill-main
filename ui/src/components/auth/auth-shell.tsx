import Image from "next/image";
import { ReactNode } from "react";

import loginCoverImage from "../../assets/login-cover.png";
import logo from "../../assets/logo.png";

type AuthShellProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  leftBottomContent?: ReactNode;
  rightTitle: string;
  rightDescription: string;
  showDesktopFooter?: boolean;
};

export const AuthShell = ({
  title,
  subtitle,
  children,
  leftBottomContent,
  rightTitle,
  rightDescription,
  showDesktopFooter = false,
}: AuthShellProps) => {
  return (
    <div className="flex flex-1 w-full overflow-hidden min-h-screen">
      <div className="w-full lg:w-1/2 flex flex-col bg-white p-3">
        <div className="lg:hidden flex items-center justify-center gap-2">
          <div className="size-15">
            <Image src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UdyogBill</h1>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-8 lg:py-12">
          <div className="max-w-110 w-full mx-auto">
            <h2
              className={`text-[#0d161b] text-center text-3xl font-black leading-tight tracking-tight ${
                subtitle ? "mb-3" : "mb-5"
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 text-center mb-6">
                {subtitle}
              </p>
            )}

            {children}

            {leftBottomContent}
          </div>
        </div>
        <div className="lg:hidden p-8 text-center text-slate-400 text-xs mt-auto">
          © 2026 UdyogBill Financial. All rights reserved.
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-multiply"
          style={{
            backgroundImage: `url(${loginCoverImage.src})`,
          }}
        />

        <div className="relative z-10 p-12 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-15 p-1 bg-white text-primary rounded-lg flex items-center justify-center">
              <Image src={logo} alt="logo" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">UdyogBill</h1>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            {rightTitle}
          </h2>
          <p className="text-xl text-white/90 font-medium">{rightDescription}</p>
        </div>

        {showDesktopFooter && (
          <div className="absolute bottom-8 right-12 z-10 text-white/70 text-sm">
            © 2026 UdyogBill Financial. All rights reserved.
          </div>
        )}
      </div>
    </div>
  );
};
